// src/payment/payment.service.ts
import { Injectable, InternalServerErrorException, Logger, NotFoundException, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CreateQrisDto } from './dto/create-qris.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';
import { ActivityLogService } from 'src/activity-log/activity-log.service';

@Injectable()
export class PaymentService {
    private readonly baseUrl: string;
    private readonly serverKey: string;
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
        private activityLogService: ActivityLogService
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
        const paymentProvider = process.env.PAYMENT_PROVIDER || 'midtrans';

        try {
            // ==========================================
            // LOGIKA PAKASIR
            // ==========================================
            if (paymentProvider === 'pakasir') {
                const payload = {
                    project: process.env.PAKASIR_PROJECT, // Sesuaikan dengan env Anda
                    order_id: orderId,
                    amount: dto.amount,
                    api_key: process.env.PAKASIR_API_KEY, // Sesuaikan dengan env Anda
                };

                const { data } = await axios.post(
                    'https://app.pakasir.com/api/transactioncreate/qris',
                    payload,
                    {
                        headers: { 'Content-Type': 'application/json' },
                    }
                );

                const paymentData = data.payment;
                if (!paymentData || !paymentData.payment_number) {
                    throw new Error('Gagal mendapatkan payment_number dari Pakasir');
                }

                // Generate QR Image URL menggunakan API qrserver
                const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentData.payment_number)}`;

                // Simpan transaksi ke database
                const transaction = await this.prisma.transaction.create({
                    data: {
                        id: orderId,
                        userId: userId,
                        amount: paymentData.amount,
                        fee: paymentData.fee,
                        status: 'PENDING',
                        paymentUrl: qrImageUrl,
                    },
                });

                return {
                    message: 'QRIS berhasil di-generate via Pakasir',
                    orderId: transaction.id,
                    qrImageUrl: transaction.paymentUrl,
                    expiryTime: paymentData.expired_at || null,
                };
            }

            // ==========================================
            // LOGIKA MIDTRANS (Default)
            // ==========================================
            else {
                // 1. Kalkulasi Fee di sisi Backend untuk keamanan
                let serviceFee = 0;
                if (dto.method === 'qris') {
                    serviceFee = Math.round(dto.amount * 0.007); // Fee QRIS 0.7%
                }
                const grossAmount = dto.amount + serviceFee;

                // 2. Kirim grossAmount ke Midtrans
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

                const { data } = await axios.post(`${this.baseUrl}/v2/charge`, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...this.getBasicAuthHeader(),
                    },
                });

                const qrAction = (data.actions || []).find((a: any) => a.name === 'generate-qr-code');
                if (!qrAction?.url) throw new Error('Action URL untuk QRIS tidak ditemukan');

                // 3. Simpan amount bersih dan fee ke database secara terpisah
                const transaction = await this.prisma.transaction.create({
                    data: {
                        id: orderId,
                        userId: userId,
                        amount: dto.amount,
                        fee: serviceFee,
                        status: 'PENDING',
                        paymentUrl: qrAction.url,
                    },
                });

                return {
                    message: 'QRIS berhasil di-generate via Midtrans',
                    orderId: transaction.id,
                    qrImageUrl: transaction.paymentUrl,
                    expiryTime: data.expiry_time || null,
                };
            }

        } catch (error: any) {
            // Anda bisa melakukan console.log(error.response?.data) di sini untuk debugging jika API Pakasir/Midtrans gagal
            throw new InternalServerErrorException('Gagal memproses transaksi: ' + (error.message || ''));
        }
    }

    async generateSnapToken(userId: number, dto: { amount: number }) {
        // return saat ini tidak mendukung metode cc dalam bahasa inggris
        throw new NotImplementedException('This payment method is currently unavailable. Contact support for a manual top-up process.');

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
                    amount: dto.amount,
                    fee: serviceFee,
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

            // 3. Jika status masih PENDING, ambil status terbaru dari Provider Pembayaran
            const paymentProvider = process.env.PAYMENT_PROVIDER || 'midtrans';
            let newStatus = transaction.status;

            if (paymentProvider === 'pakasir') {
                // ==========================================
                // FETCH STATUS KE PAKASIR
                // ==========================================
                const { data } = await axios.get('https://app.pakasir.com/api/transactiondetail', {
                    params: {
                        project: process.env.PAKASIR_PROJECT,
                        amount: transaction.amount,
                        order_id: transactionId,
                        api_key: process.env.PAKASIR_API_KEY,
                    }
                });

                const pakasirStatus = data.transaction?.status;

                // Mapping status Pakasir ke status internal kita
                if (pakasirStatus === 'completed') {
                    newStatus = 'SUCCESS';
                } else if (['failed', 'expired', 'canceled'].includes(pakasirStatus)) {
                    newStatus = 'FAILED';
                }
            } else {
                // ==========================================
                // FETCH STATUS KE MIDTRANS (Default)
                // ==========================================
                const { data } = await axios.get(`${this.baseUrl}/v2/${transactionId}/status`, {
                    headers: this.getBasicAuthHeader(),
                });

                const midtransStatus = data.transaction_status;

                // Mapping status Midtrans ke status internal kita
                if (midtransStatus === 'settlement' || midtransStatus === 'capture') {
                    newStatus = 'SUCCESS';
                } else if (['cancel', 'deny', 'expire'].includes(midtransStatus)) {
                    newStatus = 'FAILED';
                }
            }

            // 4. Jika status di Provider Pembayaran sudah berubah, lakukan update atomik
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
                        this.logger.log(`💰 Saldo ditambahkan via Frontend Sync untuk Order ID: ${transactionId} via ${paymentProvider.toUpperCase()}`);
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
        const paymentProvider = process.env.PAYMENT_PROVIDER || 'midtrans';

        // Variabel untuk menampung data yang sudah dinormalisasi dari provider
        let orderId = '';
        let mappedStatus = '';
        let logAmount = 0;
        let originalStatus = '';

        // ====================================================================
        // 1. EKSTRAKSI & VALIDASI BERDASARKAN PROVIDER
        // ====================================================================
        if (paymentProvider === 'pakasir') {
            const { order_id, status, amount, project } = notificationData;
            orderId = order_id;
            originalStatus = status;
            logAmount = amount;

            this.logger.log(`🔔 Webhook Pakasir diterima untuk Order ID: ${orderId}`);

            // Validasi keamanan dasar Pakasir (Cek Project ID)
            if (project !== process.env.PAKASIR_PROJECT) {
                this.logger.error(`🚨 ALERT: Invalid Project Name untuk Order ID: ${orderId}!`);
                throw new Error('Invalid Pakasir Project');
            }

            // Mapping Status Pakasir ke Internal
            if (status === 'completed') {
                mappedStatus = 'SUCCESS';
            } else if (['failed', 'expired', 'canceled'].includes(status)) {
                mappedStatus = 'FAILED';
            } else {
                mappedStatus = 'PENDING';
            }

        } else {
            // Logika Midtrans (Default)
            const { order_id, transaction_status, status_code, gross_amount, signature_key } = notificationData;
            orderId = order_id;
            originalStatus = transaction_status;
            logAmount = gross_amount;

            this.logger.log(`🔔 Webhook Midtrans diterima untuk Order ID: ${orderId}`);

            // Validasi Keamanan Signature Midtrans
            const inputString = `${orderId}${status_code}${gross_amount}${this.serverKey}`;
            const mySignature = crypto.createHash('sha512').update(inputString).digest('hex');

            if (mySignature !== signature_key) {
                this.logger.error(`🚨 ALERT: Invalid Signature Key untuk Order ID: ${orderId}!`);
                throw new Error('Invalid Midtrans Signature Key');
            }

            // Mapping Status Midtrans ke Internal
            if (transaction_status === 'settlement' || transaction_status === 'capture') {
                mappedStatus = 'SUCCESS';
            } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
                mappedStatus = 'FAILED';
            } else {
                mappedStatus = 'PENDING';
            }
        }

        // ====================================================================
        // 2. CARI TRANSAKSI DI DATABASE
        // ====================================================================
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: orderId },
        });

        if (!transaction) {
            this.logger.error(`Transaksi ${orderId} tidak ditemukan di sistem.`);
            return { status: 'error', message: 'Transaction not found' };
        }

        // ====================================================================
        // 3. PENCEGAHAN DOUBLE TOP-UP (IDEMPOTENCY CHECK)
        // ====================================================================
        const finalStatuses = ['SUCCESS', 'SETTLEMENT', 'FAILED', 'EXPIRE', 'CANCEL'];
        if (finalStatuses.includes(transaction.status)) {
            this.logger.log(`⚠️ Transaksi ${orderId} sudah berstatus final (${transaction.status}). Mengabaikan Webhook.`);
            return { status: 'success', message: 'Transaction already processed' };
        }

        // ====================================================================
        // 4. UPDATE DATABASE MENGGUNAKAN PRISMA TRANSACTION (ATOMIC)
        // ====================================================================
        try {
            if (mappedStatus === 'SUCCESS') {
                await this.prisma.$transaction(async (prisma) => {
                    // a. Update status transaksi
                    await prisma.transaction.update({
                        where: { id: orderId },
                        data: { status: 'SUCCESS' },
                    });

                    // b. Tambah saldo user (gunakan amount dari database untuk keamanan ganda)
                    await prisma.user.update({
                        where: { id: transaction.userId },
                        data: { balance: { increment: transaction.amount } }
                    });
                });
                this.logger.log(`✅ Transaksi Sukses & Saldo ditambahkan untuk Order ID: ${orderId} via ${paymentProvider.toUpperCase()}`);

                this.activityLogService.logAction({
                    userId: transaction.userId,
                    action: `Top-Up ${logAmount} successful via ${paymentProvider.toUpperCase()}`,
                    method: 'POST',
                    url: '/payment/webhook',
                    details: { orderId: orderId, status: originalStatus },
                    statusCode: 200,
                });

            } else if (mappedStatus === 'FAILED') {
                await this.prisma.transaction.update({
                    where: { id: orderId },
                    data: { status: 'FAILED' },
                });
                this.logger.log(`❌ Transaksi Gagal/Expired untuk Order ID: ${orderId} via ${paymentProvider.toUpperCase()}`);

                this.activityLogService.logAction({
                    userId: transaction.userId,
                    action: `Top-Up ${logAmount} failed/expired via ${paymentProvider.toUpperCase()}`,
                    method: 'POST',
                    url: '/payment/webhook',
                    details: { orderId: orderId, status: originalStatus },
                    statusCode: 200,
                });
            }

            return { status: 'success' };
        } catch (error: any) {
            this.logger.error(`Gagal memproses webhook untuk ${orderId}: ${error.message}`);
            throw new Error('Gagal memproses data ke database');
        }
    }
}