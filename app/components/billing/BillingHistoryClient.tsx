'use client';

import { useState } from 'react';
import Link from 'next/link';

// ================= DUMMY DATA =================
interface Transaction {
    id: string;
    date: string;
    description: string;
    paymentMethod: string;
    amount: number;
    status: 'success' | 'pending' | 'failed';
}

const dummyTransactions: Transaction[] = [
    {
        id: 'TRX-982374982',
        date: '2026-08-25 14:30',
        description: 'Top Up Balance',
        paymentMethod: 'QRIS',
        amount: 100700, // Termasuk service fee
        status: 'success',
    },
    {
        id: 'TRX-982374850',
        date: '2026-08-20 09:15',
        description: 'Top Up Balance',
        paymentMethod: 'Credit Card',
        amount: 258750,
        status: 'success',
    },
    {
        id: 'TRX-982374112',
        date: '2026-08-15 19:45',
        description: 'Top Up Balance',
        paymentMethod: 'QRIS',
        amount: 50350,
        status: 'failed',
    },
    {
        id: 'TRX-982374005',
        date: '2026-08-10 10:00',
        description: 'Top Up Balance',
        paymentMethod: 'Credit Card',
        amount: 516350,
        status: 'success',
    }
];

export default function BillingHistoryClient() {
    const [transactions] = useState<Transaction[]>(dummyTransactions);

    // Helper untuk format mata uang
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US').format(val);
    };

    // Helper untuk warna badge status
    const getStatusBadge = (status: Transaction['status']) => {
        switch (status) {
            case 'success':
                return (
                    <span style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)', color: 'var(--accent-green, #28a745)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        <i className="fas fa-check-circle" style={{ marginRight: '5px' }}></i> Success
                    </span>
                );
            case 'pending':
                return (
                    <span style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', color: '#d39e00', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        <i className="fas fa-clock" style={{ marginRight: '5px' }}></i> Pending
                    </span>
                );
            case 'failed':
                return (
                    <span style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: 'var(--accent-red, #dc3545)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        <i className="fas fa-times-circle" style={{ marginRight: '5px' }}></i> Failed
                    </span>
                );
        }
    };

    return (
        <>
            
            {/* Header Ringkasan Saldo (Opsional) */}
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
                                <th style={{ borderBottom: '2px solid var(--border-color)', padding: '12px 15px', color: 'var(--text-primary)', fontWeight: 'bold' }}>Transaction ID</th>
                                <th style={{ borderBottom: '2px solid var(--border-color)', padding: '12px 15px', color: 'var(--text-primary)', fontWeight: 'bold' }}>Date</th>
                                <th style={{ borderBottom: '2px solid var(--border-color)', padding: '12px 15px', color: 'var(--text-primary)', fontWeight: 'bold' }}>Description</th>
                                <th style={{ borderBottom: '2px solid var(--border-color)', padding: '12px 15px', color: 'var(--text-primary)', fontWeight: 'bold' }}>Method</th>
                                <th style={{ borderBottom: '2px solid var(--border-color)', padding: '12px 15px', color: 'var(--text-primary)', fontWeight: 'bold' }}>Amount</th>
                                <th style={{ borderBottom: '2px solid var(--border-color)', padding: '12px 15px', color: 'var(--text-primary)', fontWeight: 'bold', textAlign: 'center' }}>Status</th>
                                <th style={{ borderBottom: '2px solid var(--border-color)', padding: '12px 15px', color: 'var(--text-primary)', fontWeight: 'bold', textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? (
                                transactions.map((trx) => (
                                    <tr key={trx.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-input)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <td style={{ padding: '15px', color: 'var(--text-primary)', fontWeight: '500' }}>{trx.id}</td>
                                        <td style={{ padding: '15px', color: 'var(--text-muted)' }}>{trx.date}</td>
                                        <td style={{ padding: '15px', color: 'var(--text-primary)' }}>{trx.description}</td>
                                        <td style={{ padding: '15px', color: 'var(--text-muted)' }}>{trx.paymentMethod}</td>
                                        <td style={{ padding: '15px', color: 'var(--text-primary)', fontWeight: 'bold' }}>IDR {formatCurrency(trx.amount)}</td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            {getStatusBadge(trx.status)}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <button 
                                                className="btn btn-outline btn-sm" 
                                                title="Download Invoice"
                                                disabled={trx.status !== 'success'}
                                                style={{ padding: '5px 10px', opacity: trx.status !== 'success' ? 0.5 : 1 }}
                                            >
                                                <i className="fas fa-download"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <i className="fas fa-box-open" style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--border-color)' }}></i>
                                        <p>No transactions found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Dummy */}
                <div style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Showing 1 to 4 of 4 entries</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button className="btn btn-outline btn-sm" disabled><i className="fas fa-chevron-left"></i> Prev</button>
                        <button className="btn btn-primary btn-sm">1</button>
                        <button className="btn btn-outline btn-sm" disabled>Next <i className="fas fa-chevron-right"></i></button>
                    </div>
                </div>

            </section>
            </>
    );
}