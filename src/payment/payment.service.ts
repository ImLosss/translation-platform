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
        // 1. Ambil data user dari database
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) throw new NotFoundException('User tidak ditemukan');

        // 2. Buat Order ID unik dari sisi backend
        const orderId = `QRIS-${userId}-${Date.now()}`;

        // 3. Susun payload Midtrans menggunakan data asli dari database
        const payload = {
            payment_type: 'qris',
            transaction_details: {
                order_id: orderId,
                gross_amount: dto.amount,
            },
            customer_details: {
                first_name: user.username || 'User',
                email: user.email,
            }
        };

        try {
            // 4. Hit API Midtrans
            const { data } = await axios.post(`${this.baseUrl}/v2/charge`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getBasicAuthHeader(),
                },
            });

            console.log('Response dari Midtrans:', data);

            const qrAction = (data.actions || []).find((a: any) => a.name === 'generate-qr-code');
            if (!qrAction?.url) {
                throw new Error('Action URL untuk QRIS tidak ditemukan dari provider');
            }

            // 5. Simpan transaksi dengan status PENDING ke database
            const transaction = await this.prisma.transaction.create({
                data: {
                    id: orderId,
                    userId: userId,
                    amount: dto.amount,
                    status: 'PENDING',
                    paymentUrl: qrAction.url,
                },
            });

            // 6. Kembalikan data ke frontend
            return {
                message: 'QRIS berhasil di-generate',
                orderId: transaction.id,
                qrImageUrl: transaction.paymentUrl,
                expiryTime: data.expiry_time || null,
            };

        } catch (error: any) {
            throw new InternalServerErrorException(
                error.response?.data?.message || error.message || 'Gagal memproses transaksi'
            );
        }
    }

    async getPaymentStatus(transactionId: string) {
        try {
            const { data } = await axios.get(`${this.baseUrl}/v2/${transactionId}/status`, {
                headers: this.getBasicAuthHeader(),
            });
            return data;
        } catch (error: any) {
            throw new InternalServerErrorException(
                error.response?.data?.message || error.message || 'Gagal mengambil status pembayaran'
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
        // 1. Ekstrak semua data yang dibutuhkan dari payload
        const { 
            order_id, 
            transaction_status, 
            status_code, 
            gross_amount, 
            signature_key 
        } = notificationData;

        this.logger.log(`Payload notifikasi diterima: ${JSON.stringify(notificationData)}`);

        // 3. Gabungkan string sesuai rumus Midtrans
        const inputString = `${order_id}${status_code}${gross_amount}${this.serverKey}`;

        // 4. Lakukan Hashing menggunakan SHA512
        const mySignature = crypto.createHash('sha512').update(inputString).digest('hex');

        // 5. Validasi Keamanan
        if (mySignature !== signature_key) {
            this.logger.error(`🚨 ALERT: Invalid Signature Key untuk Order ID: ${order_id}! Potensi manipulasi data.`);
            throw new Error('Invalid Midtrans Signature Key'); 
        }

        this.logger.log(`✅ Signature Valid! Memproses status: ${transaction_status} untuk Order ID: ${order_id}`);

        if (transaction_status === 'settlement' || transaction_status === 'capture') {
            // TODO: Update status pesanan menjadi LUNAS di database
            
        } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
            // TODO: Update status pesanan menjadi GAGAL/BATAL di database
            
        } else if (transaction_status === 'pending') {
            // TODO: Update status pesanan menjadi MENUNGGU PEMBAYARAN
            
        }
    }
}