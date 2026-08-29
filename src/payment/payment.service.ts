// src/payment/payment.service.ts
import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CreateQrisDto } from './dto/create-qris.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
    private readonly baseUrl: string;
    private readonly serverKey: string;
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        const key = this.configService.get<string>('MIDTRANS_SERVER_KEY');
        if (!key) throw new Error('MIDTRANS_SERVER_KEY tidak ditemukan!');

        this.serverKey = key;
        this.baseUrl = 'https://api.sandbox.midtrans.com';
    }

    private getBasicAuthHeader() {
        const token = Buffer.from(`${this.serverKey}:`).toString('base64');
        return { Authorization: `Basic ${token}` };
    }

    async generateQrisTransaction(userId: number, dto: CreateQrisDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) throw new NotFoundException('User tidak ditemukan');

        const orderId = `QRIS-${userId}-${Date.now()}`;

        // 1. Kalkulasi Fee di sisi Backend untuk keamanan
        let serviceFee = 0;
        if (dto.method === 'qris') {
            serviceFee = Math.round(dto.amount * 0.007); // Fee QRIS 0.7%
        }
        const grossAmount = dto.amount + serviceFee; // Total tagihan: 50.350

        // 2. Kirim grossAmount (50.350) ke Midtrans
        const payload = {
            payment_type: 'qris',
            transaction_details: {
                order_id: orderId,
                gross_amount: grossAmount,
            },
            customer_details: {
                first_name: user.username || 'User',
                email: user.email,
            }
        };

        try {
            const { data } = await axios.post(`${this.baseUrl}/v2/charge`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getBasicAuthHeader(),
                },
            });

            const qrAction = (data.actions || []).find((a: any) => a.name === 'generate-qr-code');
            if (!qrAction?.url) throw new Error('Action URL untuk QRIS tidak ditemukan');

            // 3. Simpan amount bersih (50.000) dan fee (350) ke database secara terpisah
            const transaction = await this.prisma.transaction.create({
                data: {
                    id: orderId,
                    userId: userId,
                    amount: dto.amount, // <-- HANYA 50.000
                    fee: serviceFee,    // <-- 350
                    status: 'PENDING',
                    paymentUrl: qrAction.url,
                },
            });

            return {
                message: 'QRIS berhasil di-generate',
                orderId: transaction.id,
                qrImageUrl: transaction.paymentUrl,
                expiryTime: data.expiry_time || null,
            };

        } catch (error: any) {
            throw new InternalServerErrorException('Gagal memproses transaksi');
        }
    }

    async generateSnapToken(userId: number, dto: { amount: number }) {
        // 1. Ambil data user dari database internal
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) throw new NotFoundException('User tidak ditemukan');

        // 2. Buat Order ID unik (menggunakan prefix CC)
        const orderId = `CC-${userId}-${Date.now()}`;

        // 3. Kalkulasi Fee di Backend untuk keamanan (Misal: CC Fee = 2.7% + Rp 2.000)
        const serviceFee = 2000 + Math.round(dto.amount * 0.027);
        const grossAmount = dto.amount + serviceFee;

        // 4. Susun Payload Snap sesuai standar Midtrans
        const payload = {
            transaction_details: {
                order_id: orderId,
                gross_amount: grossAmount,
            },
            customer_details: {
                first_name: user.username || 'User',
                email: user.email,
            },
            enabled_payments: ["credit_card"],
            credit_card: {
                secure: true,
            }
        };

        try {
            // 5. Hit Endpoint SNAP API
            // URL Snap menggunakan subdomain 'app', bukan 'api'
            const snapUrl = 'https://app.sandbox.midtrans.com/snap/v1/transactions';

            const { data } = await axios.post(snapUrl, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...this.getBasicAuthHeader(), // Menggunakan helper header auth yang sudah ada
                },
            });

            // 6. Simpan transaksi ke database (menyimpan redirect_url sebagai paymentUrl)
            const transaction = await this.prisma.transaction.create({
                data: {
                    id: orderId,
                    userId: userId,
                    amount: dto.amount, // Nominal asli (misal 50.000)
                    fee: serviceFee,    // Biaya layanan (misal 3.350)
                    status: 'PENDING',
                    paymentUrl: data.redirect_url,
                },
            });

            // 7. Kembalikan token dan redirect_url ke Frontend
            return {
                message: 'Snap Token berhasil di-generate',
                orderId: transaction.id,
                snapToken: data.token,
                redirectUrl: data.redirect_url,
            };

        } catch (error: any) {
            throw new InternalServerErrorException(
                error.response?.data?.message || error.response?.data?.error_messages || error.message || 'Gagal memproses Snap Token Midtrans'
            );
        }
    }

    async getPaymentStatus(transactionId: string) {
        try {
            // 1. Cek status saat ini di database
            const transaction = await this.prisma.transaction.findUnique({
                where: { id: transactionId },
            });

            if (!transaction) {
                throw new NotFoundException('Transaksi tidak ditemukan di sistem');
            }

            // 2. Jika status sudah final (mungkin sudah diselesaikan oleh Webhook), langsung kembalikan
            const finalStatuses = ['SUCCESS', 'SETTLEMENT', 'FAILED', 'EXPIRE', 'CANCEL'];
            if (finalStatuses.includes(transaction.status)) {
                return transaction;
            }

            // 3. Jika status masih PENDING, ambil status terbaru dari Midtrans
            const { data } = await axios.get(`${this.baseUrl}/v2/${transactionId}/status`, {
                headers: this.getBasicAuthHeader(),
            });

            const midtransStatus = data.transaction_status;
            let newStatus = transaction.status;

            if (midtransStatus === 'settlement' || midtransStatus === 'capture') {
                newStatus = 'SUCCESS';
            } else if (['cancel', 'deny', 'expire'].includes(midtransStatus)) {
                newStatus = 'FAILED';
            }

            // 4. Jika status di Midtrans sudah berubah, lakukan update atomik
            if (newStatus !== transaction.status) {
                const updatedTransaction = await this.prisma.$transaction(async (prisma) => {
                    // a. Re-fetch data di dalam transaction block untuk mencegah race condition dengan Webhook
                    const currentTx = await prisma.transaction.findUnique({
                        where: { id: transactionId }
                    });

                    // b. Idempotency Check kedua (jika Webhook keduluan memproses milidetik sebelumnya)
                    if (currentTx && finalStatuses.includes(currentTx.status)) {
                        this.logger.log(`⚠️ Status sinkronisasi dilewati, Webhook sudah memproses ${transactionId}`);
                        return currentTx;
                    }

                    // c. Update status transaksi
                    const updated = await prisma.transaction.update({
                        where: { id: transactionId },
                        data: { status: newStatus },
                    });

                    // d. Tambahkan saldo jika sukses
                    if (newStatus === 'SUCCESS') {
                        await prisma.user.update({
                            where: { id: transaction.userId },
                            data: { balance: { increment: transaction.amount } }
                        });
                        this.logger.log(`💰 Saldo ditambahkan via Frontend Sync untuk Order ID: ${transactionId}`);
                    }

                    return updated;
                });

                return updatedTransaction;
            }

            return transaction;

        } catch (error: any) {
            if (error instanceof NotFoundException) throw error;

            throw new InternalServerErrorException(
                error.response?.data?.message || error.message || 'Gagal sinkronisasi status pembayaran'
            );
        }
    }

    async getPaymentHistory(userId: number) {
        try {
            const transactions = await this.prisma.transaction.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });
            return transactions;
        } catch (error) {
            throw new InternalServerErrorException('Gagal mengambil riwayat pembayaran');
        }
    }

    async handlePaymentNotification(notificationData: any) {
        const {
            order_id,
            transaction_status,
            status_code,
            gross_amount,
            signature_key
        } = notificationData;

        this.logger.log(`🔔 Webhook Midtrans diterima untuk Order ID: ${order_id}`);

        // 1. Gabungkan string sesuai rumus Midtrans
        const inputString = `${order_id}${status_code}${gross_amount}${this.serverKey}`;

        // 2. Lakukan Hashing menggunakan SHA512
        const crypto = require('crypto'); // Pastikan sudah di-import di atas
        const mySignature = crypto.createHash('sha512').update(inputString).digest('hex');

        // 3. Validasi Keamanan Signature
        if (mySignature !== signature_key) {
            this.logger.error(`🚨 ALERT: Invalid Signature Key untuk Order ID: ${order_id}!`);
            throw new Error('Invalid Midtrans Signature Key');
        }

        // 4. Cari transaksi di database
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: order_id },
        });

        if (!transaction) {
            this.logger.error(`Transaksi ${order_id} tidak ditemukan di sistem.`);
            return { status: 'error', message: 'Transaction not found' };
        }

        // ====================================================================
        // 5. PENCEGAHAN DOUBLE TOP-UP (IDEMPOTENCY CHECK)
        // ====================================================================
        if (transaction.status === 'SUCCESS' || transaction.status === 'SETTLEMENT') {
            this.logger.log(`⚠️ Transaksi ${order_id} sudah sukses sebelumnya. Mengabaikan Webhook.`);
            return { status: 'success', message: 'Transaction already processed' };
        }

        // 6. Update Database menggunakan Prisma Transaction (Atomic)
        try {
            if (transaction_status === 'settlement' || transaction_status === 'capture') {
                await this.prisma.$transaction(async (prisma) => {
                    // a. Update status transaksi
                    await prisma.transaction.update({
                        where: { id: order_id },
                        data: { status: 'SUCCESS' },
                    });

                    // b. Tambah saldo user
                    await prisma.user.update({
                        where: { id: transaction.userId },
                        data: { balance: { increment: transaction.amount } }
                    });
                });
                this.logger.log(`✅ Transaksi Sukses & Saldo ditambahkan untuk Order ID: ${order_id}`);

            } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
                await this.prisma.transaction.update({
                    where: { id: order_id },
                    data: { status: 'FAILED' },
                });
                this.logger.log(`❌ Transaksi Gagal/Expired untuk Order ID: ${order_id}`);
            }

            return { status: 'success' };
        } catch (error: any) {
            this.logger.error(`Gagal memproses webhook untuk ${order_id}: ${error.message}`);
            throw new Error('Gagal memproses data ke database');
        }
    }
}