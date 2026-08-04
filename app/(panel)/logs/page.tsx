import { api } from '@/app/lib/api';
import Link from 'next/link';
import LogFilters from './LogFilters';

// ==============================
// 1. Definisi Tipe Data (Interface)
// ==============================
interface UserInfo {
  id: number;
  name: string | null;
  email: string;
}

interface ActivityLog {
  id: number;
  userId: number | null;
  user: UserInfo | null;
  action: string;
  method: string;
  url: string;
  ipAddress: string | null;
  statusCode: number | null;
  createdAt: string;
}

interface MetaPagination {
  total: number;
  page: number;
  lastPage: number;
}

interface ActivityLogResponse {
  data: ActivityLog[];
  meta: MetaPagination;
}

// ==============================
// 2. Server Component
// ==============================
export default async function ActivityLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    page?: string;
    method?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const resolvedParams = await searchParams;
  
  const currentPage = Number(resolvedParams.page) || 1;
  const limit = 20;
  
  // Tangkap param filter untuk diteruskan ke API
  const methodParam = resolvedParams.method ? `&method=${resolvedParams.method}` : '';
  const statusParam = resolvedParams.status ? `&status=${resolvedParams.status}` : '';
  const startDateParam = resolvedParams.startDate ? `&startDate=${resolvedParams.startDate}` : '';
  const endDateParam = resolvedParams.endDate ? `&endDate=${resolvedParams.endDate}` : '';

  // Gabungkan semua parameter
  const queryString = `?page=${currentPage}&limit=${limit}${methodParam}${statusParam}${startDateParam}${endDateParam}`;

  let logs: ActivityLog[] = [];
  let meta: MetaPagination | null = null;
  let errorMsg = '';

  try {
    const response = await api<ActivityLogResponse>(`/admin/activity-logs${queryString}`);
    logs = response.data;
    meta = response.meta;
  } catch (error: any) {
    errorMsg = error.message || 'Gagal mengambil data activity log.';
  }

  // 👇 PERBAIKAN 1: Helper formating tanggal diisi
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(dateString));
  };

  // Helper fungsi untuk membuat URL Paginasi dengan mempertahankan filter saat ini
  const createPaginationUrl = (newPage: number) => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    if (resolvedParams.method) params.set('method', resolvedParams.method);
    if (resolvedParams.status) params.set('status', resolvedParams.status);
    if (resolvedParams.startDate) params.set('startDate', resolvedParams.startDate);
    if (resolvedParams.endDate) params.set('endDate', resolvedParams.endDate);
    return `/logs?${params.toString()}`;
  };

  return (
    <section className="card">
      <div className="card-header">
        <h2>
          <i className="fas fa-list-alt" style={{ color: 'var(--accent)', marginRight: 10 }}></i>
          System Activity Logs
        </h2>
      </div>

      <div>
        <LogFilters />
        
        {errorMsg ? (
          <div className="alert alert-error">{errorMsg}</div>
        ) : (
          <>
            {/* TABEL LOG */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '12px 8px' }}>Waktu</th>
                    <th style={{ padding: '12px 8px' }}>User</th>
                    <th style={{ padding: '12px 8px' }}>Aksi</th>
                    <th style={{ padding: '12px 8px' }}>Method</th>
                    <th style={{ padding: '12px 8px' }}>Status</th>
                    <th style={{ padding: '12px 8px' }}>URL / Endpoint</th>
                    <th style={{ padding: '12px 8px' }}>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>
                          {formatDate(log.createdAt)}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          {log.user ? (
                            <div>
                              <strong>{log.user.name || 'User'}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {log.user.email}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>System/Guest</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span className="badge badge-outline">{log.action}</span>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span
                            style={{
                              fontWeight: 'bold',
                              color:
                                log.method === 'POST' ? 'var(--accent-green)' :
                                log.method === 'DELETE' ? 'var(--accent-red)' :
                                log.method === 'PUT' ? 'var(--accent-blue)' : 'inherit',
                            }}
                          >
                            {log.method}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          {log.statusCode ? (
                            <span
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                color: '#fff',
                                backgroundColor:
                                  log.statusCode >= 200 && log.statusCode < 300
                                    ? '#2ecc71' // Hijau untuk Sukses
                                    : log.statusCode >= 400 && log.statusCode < 500
                                    ? '#f39c12' // Oranye untuk Client Error
                                    : log.statusCode >= 500
                                    ? '#e74c3c' // Merah untuk Server Error
                                    : '#95a5a6', // Abu-abu default
                              }}
                            >
                              {log.statusCode}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                          {log.url}
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {log.ipAddress || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      {/* 👇 PERBAIKAN 2: colSpan diubah jadi 7 karena ada 7 kolom */}
                      <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        Belum ada aktivitas yang tercatat.
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
                  Halaman <strong>{meta.page}</strong> dari <strong>{meta.lastPage}</strong> (Total: {meta.total} logs)
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  
                  {meta.page > 1 ? (
                    <Link href={createPaginationUrl(meta.page - 1)} className="btn btn-outline btn-sm">
                      <i className="fas fa-chevron-left" /> Prev
                    </Link>
                  ) : (
                    <button className="btn btn-outline btn-sm" disabled style={{ opacity: 0.5 }}>
                      <i className="fas fa-chevron-left" /> Prev
                    </button>
                  )}

                  {meta.page < meta.lastPage ? (
                    <Link href={createPaginationUrl(meta.page + 1)} className="btn btn-outline btn-sm">
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