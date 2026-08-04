import { api } from '@/app/lib/api';
import EditUserForm from './EditUserForm';
import Link from 'next/link';

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const userId = resolvedParams.id;
  
  let user = null;
  let errorMsg = '';

  try {
    user = await api<any>(`/user/${userId}`);
  } catch (error: any) {
    errorMsg = error.message || 'Gagal mengambil data user.';
  }

  if (errorMsg || !user) {
    return (
      <section className="card">
        <div className="card-header">
          <h2>Error</h2>
          <Link href="/users" className="btn btn-outline btn-sm"><i className="fas fa-arrow-left"></i> Kembali</Link>
        </div>
        <div style={{ padding: '20px' }}>
          <div className="alert alert-error">{errorMsg || 'User tidak ditemukan'}</div>
        </div>
      </section>
    );
  }

  return <EditUserForm user={user} />;
}