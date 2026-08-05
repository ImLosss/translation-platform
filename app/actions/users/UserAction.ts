'use server';

import { api } from '@/app/lib/api';
import { revalidatePath } from 'next/cache';

export async function deleteUser(userId: number) {
    try {
        // Karena ini berjalan di server, kita bebas memanggil api() yang punya next/headers
        await api<any>(`/user/${userId}`, { method: 'DELETE' });

        // Refresh cache halaman users agar data yang dihapus langsung hilang
        revalidatePath('/users');

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to delete user.'
        };
    }
}

export async function updateUser(userId: number, data: { username: string; role: string; balance: number }) {
    try {
        await api<any>(`/user/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });

        // Refresh cache untuk tabel users dan halaman detail user
        revalidatePath('/users');
        revalidatePath(`/users/${userId}`);

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Gagal memperbarui pengguna'
        };
    }
}