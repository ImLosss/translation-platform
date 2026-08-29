import { api } from '@/app/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import UserActions from './client/UserAction';

// ==============================
// 1. Definisi Tipe Data (Interface)
// ==============================
interface User {
  id: number;
  email: string;
  username: string | null;
  avatar: string | null;
  balance: number;
  provider: 'LOCAL' | 'GOOGLE';
  role: 'USER' | 'ADMIN';
  createdAt: string;
  // Opsional: Jika backend mengirimkan jumlah relasi
  _count?: {
    translations: number;
    glossaries: number;
  };
}

interface MetaPagination {
  total: number;
  page: number;
  lastPage: number;
}

interface UsersResponse {
  data: User[];
  meta: MetaPagination;
}

// ==============================
// 2. Server Component
// ==============================
export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const limit = 10;

  let users: User[] = [];
  let meta: MetaPagination | null = null;
  let errorMsg = '';

  try {
    // Asumsi: Kamu memiliki endpoint GET /admin/users di NestJS
    const response = await api<UsersResponse>(`/user?page=${currentPage}&limit=${limit}`);
    users = response.data;
    meta = response.meta;
  } catch (error: any) {
    errorMsg = error.message || 'Gagal mengambil data pengguna.';
  }

  // Helper formating tanggal
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  // Helper formating saldo (misal: format mata uang)
  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR', // Ubah ke USD jika menggunakan dollar
      minimumFractionDigits: 0,
    }).format(balance);
  };

  return (
    <section className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>
          <i className="fas fa-users" style={{ color: 'var(--accent)', marginRight: 10 }}></i>
          User Management
        </h2>
        <div className="card-actions">
          {/* Opsional: Tombol untuk tambah user manual */}
          <button className="btn btn-primary btn-sm">
            <i className="fas fa-plus"></i> Add User
          </button>
        </div>
      </div>

      <div>
        {errorMsg ? (
          <div className="alert alert-error">{errorMsg}</div>
        ) : (
          <>
            {/* TABEL USERS */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '12px 8px' }}>User</th>
                    <th style={{ padding: '12px 8px' }}>Role</th>
                    <th style={{ padding: '12px 8px' }}>Provider</th>
                    <th style={{ padding: '12px 8px' }}>Balance</th>
                    <th style={{ padding: '12px 8px' }}>Joined Date</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        
                        {/* Avatar & Info Utama */}
                        <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--border-color)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                          }}>
                            {user.avatar ? (
                              <Image src={user.avatar} alt={user.username || 'User'} width={40} height={40} style={{ objectFit: 'cover' }} />
                            ) : (
                              <i className="fas fa-user" style={{ color: 'var(--text-muted)' }}></i>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{user.username || 'No Name'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                          </div>
                        </td>

                        {/* Role */}
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{
                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                            backgroundColor: user.role === 'ADMIN' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)',
                            color: user.role === 'ADMIN' ? 'var(--accent-red)' : 'var(--accent-blue)',
                          }}>
                            {user.role}
                          </span>
                        </td>

                        {/* Provider (Google / Local) */}
                        <td style={{ padding: '12px 8px' }}>
                          {user.provider === 'GOOGLE' ? (
                            <span style={{ color: '#db4437', fontWeight: '500', fontSize: '0.85rem' }}>
                              <i className="fab fa-google"></i> Google
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem' }}>
                              <i className="fas fa-envelope"></i> Local
                            </span>
                          )}
                        </td>

                        {/* Balance */}
                        <td style={{ padding: '12px 8px', fontWeight: '500', color: 'var(--accent-green)' }}>
                          {formatBalance(user.balance)}
                        </td>

                        {/* Joined Date */}
                        <td style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {formatDate(user.createdAt)}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}><UserActions userId={user.id} userName={user.username} /></td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        Belum ada pengguna yang terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* KONTROL PAGINASI */}
            {meta && meta.lastPage > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Halaman <strong>{meta.page}</strong> dari <strong>{meta.lastPage}</strong> (Total: {meta.total} users)
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  
                  {meta.page > 1 ? (
                    <Link href={`/users?page=${meta.page - 1}`} className="btn btn-outline btn-sm">
                      <i className="fas fa-chevron-left" /> Prev
                    </Link>
                  ) : (
                    <button className="btn btn-outline btn-sm" disabled style={{ opacity: 0.5 }}>
                      <i className="fas fa-chevron-left" /> Prev
                    </button>
                  )}

                  {meta.page < meta.lastPage ? (
                    <Link href={`/users?page=${meta.page + 1}`} className="btn btn-outline btn-sm">
                      Next <i className="fas fa-chevron-right" />
                    </Link>
                  ) : (
                    <button className="btn btn-outline btn-sm" disabled style={{ opacity: 0.5 }}>
                      Next <i className="fas fa-chevron-right" />
                    </button>
                  )}
                  
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}