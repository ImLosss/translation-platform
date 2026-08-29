'use client';

import { useState } from 'react';
import Link from 'next/link';

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
}

export default function BillingHistoryClient({ initialTransactions }: Props) {
    const [transactions] = useState<TransactionDB[]>(initialTransactions);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID').format(val);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric', month: 'short', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusBadge = (dbStatus: string) => {
        const status = dbStatus.toUpperCase();
        
        if (status === 'SETTLEMENT' || status === 'SUCCESS') {
            return (
                <span style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)', color: 'var(--accent-green, #28a745)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    <i className="fas fa-check-circle" style={{ marginRight: '5px' }}></i> Success
                </span>
            );
        }
        
        if (status === 'PENDING') {
            return (
                <span style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', color: '#d39e00', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    <i className="fas fa-clock" style={{ marginRight: '5px' }}></i> Pending
                </span>
            );
        }

        return (
            <span style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: 'var(--accent-red, #dc3545)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                <i className="fas fa-times-circle" style={{ marginRight: '5px' }}></i> Failed
            </span>
        );
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ margin: '0 0 5px 0', color: 'var(--text-primary)' }}>Billing & History</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage your invoices and track your recent transactions.</p>
                </div>
                <Link href="/topup" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-coins"></i> Top Up Balance
                </Link>
            </div>

            <section className="card">
                <div className="card-header">
                    <h2>
                        <i className="fas fa-file-invoice-dollar" style={{ color: 'var(--accent)', marginRight: 10 }}></i>
                        Transaction History
                    </h2>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr>
                                <th style={{ borderBottom: '2px solid var(--border-color)', padding: '12px 15px' }}>Transaction ID</th>
                                <th style={{ borderBottom: '2px solid var(--border-color)', padding: '12px 15px' }}>Date</th>
                                <th style={{ borderBottom: '2px solid var(--border-color)', padding: '12px 15px' }}>Amount</th>
                                <th style={{ borderBottom: '2px solid var(--border-color)', padding: '12px 15px', textAlign: 'center' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? (
                                transactions.map((trx) => (
                                    <tr key={trx.id} style={{ borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                                        <td style={{ padding: '15px', fontWeight: '500' }}>{trx.id}</td>
                                        <td style={{ padding: '15px', color: 'var(--text-muted)' }}>{formatDate(trx.createdAt)}</td>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>IDR {formatCurrency(trx.amount + trx.fee)}</td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            {getStatusBadge(trx.status)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <i className="fas fa-box-open" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
                                        <p>No transactions found.</p>
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