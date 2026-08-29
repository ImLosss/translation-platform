'use server';

import { api } from "@/app/lib/api";

export async function createPaymentAction(payload: { amount: number; method: string }) {
    try {
        const data = await api<any>('/payment/charge', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        return { success: true, data };
    } catch (error: any) {
        console.error("Gagal membuat transaksi:", error);
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