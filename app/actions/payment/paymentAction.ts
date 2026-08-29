'use server';

import { api } from "@/app/lib/api";

export async function createQrisAction(payload: { amount: number; method: string }) {
    try {
        // Asumsi endpoint NestJS Anda adalah POST /payment/qris
        const data = await api<any>('/payment/qris', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        return { success: true, data };
    } catch (error: any) {
        console.error("Gagal membuat QRIS:", error);
        return { success: false, message: error.message || 'Gagal memproses pembayaran' };
    }
}

export async function checkPaymentStatusAction(orderId: string) {
    try {
        const data = await api<any>(`/payment/status/${orderId}`, {
            method: 'GET',
        });
        console.log("Status pembayaran:", data);
        return { success: true, data };
    } catch (error: any) {
        console.error("Gagal mengecek status pembayaran:", error);
        return { success: false, message: error.message || 'Gagal mengecek status' };
    }
}