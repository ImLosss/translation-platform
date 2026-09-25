import Link from 'next/link';
import { getDictionary } from '@/app/lib/i18n/dictionaries';
import { intlLocaleOf, type Locale } from '@/app/lib/i18n/locales';

// Sesuaikan dengan skema tabel Transaction di Prisma
export interface TransactionDB {
    id: string;
    userId: number;
    amount: number;
    fee: number;
    status: string; // PENDING, SETTLEMENT, EXPIRE, dll
    paymentUrl: string | null;
    createdAt: string; 
}

interface Props {
    initialTransactions: TransactionDB[];
    locale: Locale;
}

export default function BillingHistoryClient({ initialTransactions, locale }: Props) {
    const transactions = initialTransactions;
    const t = getDictionary(locale);
    const intlLocale = intlLocaleOf(locale);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat(intlLocale).format(val);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(intlLocale, {
            year: 'numeric', month: 'short', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusBadge = (dbStatus: string) => {
        const status = dbStatus.toUpperCase();
        
        if (status === 'SETTLEMENT' || status === 'SUCCESS') {
            return (
                <span style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)', color: 'var(--accent-green, #28a745)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    <i className="fas fa-check-circle" style={{ marginRight: '5px' }}></i> {t.billing.status.success}
                </span>
            );
        }
        
        if (status === 'PENDING') {
            return (
                <span style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', color: '#d39e00', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    <i className="fas fa-clock" style={{ marginRight: '5px' }}></i> {t.billing.status.pending}
                </span>
            );
        }

        return (
            <span style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: 'var(--accent-red, #dc3545)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                <i className="fas fa-times-circle" style={{ marginRight: '5px' }}></i> {t.billing.status.failed}
            </span>
        );
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ margin: '0 0 5px 0', color: 'var(--text-primary)' }}>{t.billing.title}</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>{t.billing.subtitle}</p>
                </div>
                <Link href={`/${locale}/topup`} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-coins"></i> {t.billing.topUpBalance}
                </Link>
            </div>

            <section className="card">
                <div className="card-header">
                    <h2>
                        <i className="fas fa-file-invoice-dollar" style={{ color: 'var(--accent)', marginRight: 10 }}></i>
                        {t.billing.transactionHistory}
                    </h2>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr>
                                <th style={{ borderBottom: '2px solid var(--border-color)', padding: '12px 15px' }}>{t.billing.table.transactionId}</th>
                                <th style={{ borderBottom: '2px solid var(--border-color)', padding: '12px 15px' }}>{t.billing.table.date}</th>
                                <th style={{ borderBottom: '2px solid var(--border-color)', padding: '12px 15px' }}>{t.billing.table.amount}</th>
                                <th style={{ borderBottom: '2px solid var(--border-color)', padding: '12px 15px', textAlign: 'center' }}>{t.billing.table.status}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? (
                                transactions.map((trx) => (
                                    <tr key={trx.id} style={{ borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                                        <td style={{ padding: '15px', fontWeight: '500' }}>{trx.id}</td>
                                        <td style={{ padding: '15px', color: 'var(--text-muted)' }}>{formatDate(trx.createdAt)}</td>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>IDR {formatCurrency(trx.amount)}</td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            {getStatusBadge(trx.status)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <i className="fas fa-box-open" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
                                        <p>{t.billing.empty}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
}