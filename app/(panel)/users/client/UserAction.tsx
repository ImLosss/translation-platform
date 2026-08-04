'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAlert } from '@/app/components/ui/Alert';
import { deleteUser } from '@/app/actions/users/UserAction';

export default function UserActions({ userId, userName }: { userId: number, userName: string | null }) {
    const router = useRouter();
    const { showAlert } = useAlert();

    const handleDelete = async () => {
        const displayName = userName || 'Pengguna ini';

        if (!window.confirm(`Apakah Anda yakin ingin menghapus user "${displayName}" secara permanen?`)) {
            return;
        }

        // Panggil server action
        const result = await deleteUser(userId);

        if (result.success) {
            showAlert('Pengguna berhasil dihapus', 'success');
            // Tidak perlu router.refresh() lagi karena revalidatePath di action sudah melakukannya
        } else {
            showAlert(result.message, 'error');
        }
    };

    return (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <Link href={`/users/${userId}`} className="btn btn-outline btn-sm" title="Edit User" style={{ padding: '4px 8px' }}>
                <i className="fas fa-edit"></i>
            </Link>
            <button
                onClick={handleDelete}
                className="btn btn-outline btn-sm"
                title="Delete User"
                style={{ padding: '4px 8px', color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}
            >
                <i className="fas fa-trash"></i>
            </button>
        </div>
    );
}