'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/app/components/ui/Alert'; 
import { checkPaymentStatusAction, createQrisAction } from '@/app/actions/payment/paymentAction';

export default function TopupClient() {
    const router = useRouter();
    const { showAlert } = useAlert();

    const [amount, setAmount] = useState<number | ''>('');
    const [paymentMethod, setPaymentMethod] = useState<'qris' | 'credit_card' | ''>('qris');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [qrisData, setQrisData] = useState<{ qrImageUrl: string; orderId: string; expiryTime?: string } | null>(null);
    
    // State baru untuk Timer (15 Menit = 900 Detik)
    const [countdown, setCountdown] = useState<number>(900);

    // =========================================================================
    // EFEK 1: AUTO-POLLING (Cek Status Otomatis setiap 5 detik)
    // =========================================================================
    useEffect(() => {
        if (!qrisData?.orderId) return;

        const intervalId = setInterval(async () => {
            const result = await checkPaymentStatusAction(qrisData.orderId);
            
            if (result.success && result.data) {
                const status = result.data.status;
                
                if (status === 'SUCCESS' || status === 'SETTLEMENT') {
                    clearInterval(intervalId);
                    showAlert('Pembayaran berhasil! Saldo telah ditambahkan.', 'success');
                    router.push('/billing'); 
                } 
                else if (status === 'FAILED' || status === 'EXPIRE' || status === 'CANCEL') {
                    clearInterval(intervalId);
                    showAlert('Transaksi dibatalkan atau kedaluwarsa dari server.', 'error');
                    setQrisData(null); 
                }
            }
        }, 5000); 

        return () => clearInterval(intervalId);
    }, [qrisData, router, showAlert]);

    // =========================================================================
    // EFEK 2: COUNTDOWN TIMER (Hitung mundur 15 menit visual)
    // =========================================================================
    useEffect(() => {
        if (!qrisData) {
            setCountdown(900); // Reset timer jika tidak ada QR aktif
            return;
        }

        const timerId = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    setQrisData(null); // Otomatis batalkan jika waktu habis
                    showAlert('Waktu pembayaran QRIS telah habis. Silakan buat transaksi baru.', 'error');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [qrisData, showAlert]);

    // =========================================================================
    // KALKULASI & HELPER
    // =========================================================================
    const quickAmounts = [50000, 100000, 250000, 500000];
    const subtotal = Number(amount) || 0;
    let serviceFee = 0;

    if (subtotal > 0 && paymentMethod === 'qris') {
        serviceFee = Math.round(subtotal * 0.007);
    }
    const totalPayment = subtotal + serviceFee;

    const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID').format(val);
    
    // Helper format detik ke menit:detik (contoh: 14:59)
    const formatCountdown = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // =========================================================================
    // HANDLER CHECKOUT
    // =========================================================================
    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!amount || amount < 10000) {
            showAlert('Minimum top-up amount is IDR 10,000', 'error');
            return;
        }
        if (paymentMethod !== 'qris') {
            showAlert('Saat ini hanya metode pembayaran QRIS yang didukung.', 'warning');
            return;
        }

        setIsProcessing(true);
        try {
            const result = await createQrisAction({ amount: subtotal, method: paymentMethod });
            
            if (result.success && result.data.qrImageUrl) {
                showAlert('QRIS berhasil dibuat! Silakan scan.', 'success');
                setCountdown(900); // Pastikan timer mulai dari awal saat berhasil
                setQrisData({
                    qrImageUrl: result.data.qrImageUrl,
                    orderId: result.data.orderId,
                    expiryTime: result.data.expiryTime,
                });
            } else {
                showAlert(result.message, 'error');
            }
        } catch (error) {
            showAlert('Terjadi kesalahan saat memproses pembayaran.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    // =========================================================================
    // TAMPILAN 1: QR CODE
    // =========================================================================
    if (qrisData) {
        return (
            <section className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>
                    <i className="fas fa-qrcode" style={{ color: 'var(--accent)', marginRight: '10px' }}></i>
                    Scan QRIS untuk Membayar
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                    Order ID: <strong>{qrisData.orderId}</strong>
                </p>

                {/* Indikator Hitung Mundur */}
                <div style={{ marginBottom: '25px', padding: '8px 20px', backgroundColor: 'rgba(220, 53, 69, 0.1)', color: 'var(--accent-red, #dc3545)', borderRadius: '30px', display: 'inline-block', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    <i className="fas fa-clock" style={{ marginRight: '8px' }}></i>
                    Kadaluarsa dalam: {formatCountdown(countdown)}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px', marginBottom: '30px' }}>
                    <div style={{ backgroundColor: 'var(--bg-input)', padding: '20px 40px', borderRadius: '12px', border: '2px dashed var(--border-color)', width: '100%', maxWidth: '350px' }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: 'var(--text-muted)' }}>Total Pembayaran</p>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2rem' }}>
                            IDR {formatCurrency(totalPayment)}
                        </h3>
                    </div>
                    
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                        <img src={qrisData.qrImageUrl} alt="QR Code QRIS" style={{ width: '250px', height: '250px', display: 'block' }} />
                    </div>
                </div>
                
                <p style={{ color: 'var(--text-primary)', marginBottom: '20px', lineHeight: '1.6' }}>
                    Buka aplikasi <strong>Gopay, OVO, DANA, ShopeePay</strong>, atau m-Banking Anda,<br/> lalu scan kode QR di atas.
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', color: 'var(--accent-blue)', marginBottom: '35px', fontSize: '1rem', fontWeight: '500' }}>
                    <i className="fas fa-circle-notch fa-spin"></i>
                    <span>Menunggu pembayaran Anda terkonfirmasi...</span>
                </div>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button className="btn btn-outline" onClick={() => setQrisData(null)} style={{ padding: '10px 25px' }}>
                        Batalkan
                    </button>
                    <button className="btn btn-primary" onClick={() => router.push('/billing')} style={{ padding: '10px 25px' }}>
                        Ke Halaman Riwayat
                    </button>
                </div>
            </section>
        );
    }

    // =========================================================================
    // TAMPILAN 2: FORM TOP-UP (Default)
    // =========================================================================
    return (
        <section className="card">
            <div className="card-header">
                <h2>
                    <i className="fas fa-wallet" style={{ color: 'var(--accent)', marginRight: 10 }}></i>
                    Top Up Balance
                </h2>
            </div>

            <form onSubmit={handleCheckout}>
                <div className="form-group" style={{ marginBottom: '30px', marginTop: '30px' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '12px', display: 'block', color: 'var(--text-primary)' }}>
                        1. Enter Amount (IDR) <span style={{ color: 'var(--accent-red)' }}>*</span>
                    </label>
                    
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                        {quickAmounts.map((val) => (
                            <button
                                key={val}
                                type="button"
                                onClick={() => setAmount(val)}
                                className={`btn ${amount === val ? 'btn-primary' : 'btn-outline'}`}
                                style={{ flex: '1', minWidth: '120px' }}
                            >
                                IDR {formatCurrency(val)}
                            </button>
                        ))}
                    </div>

                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>IDR</span>
                        <input
                            type="number"
                            className="form-control"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value) || '')}
                            placeholder="Custom amount (Min. 10,000)"
                            style={{ paddingLeft: '55px', fontSize: '1.1rem' }}
                            min="10000"
                            required
                        />
                    </div>
                </div>

                <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

                <div className="form-group" style={{ marginBottom: '30px' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '15px', display: 'block', color: 'var(--text-primary)' }}>
                        2. Select Payment Method <span style={{ color: 'var(--accent-red)' }}>*</span>
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div 
                            onClick={() => setPaymentMethod('qris')}
                            style={{
                                border: paymentMethod === 'qris' ? '2px solid var(--accent, #007bff)' : '1px solid var(--border-color)',
                                backgroundColor: paymentMethod === 'qris' ? 'var(--bg-input)' : 'transparent',
                                borderRadius: '12px', padding: '20px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
                                boxShadow: paymentMethod === 'qris' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            <i className="fas fa-qrcode" style={{ fontSize: '3rem', color: paymentMethod === 'qris' ? 'var(--accent, #007bff)' : 'var(--text-muted)', marginBottom: '15px' }}></i>
                            <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>QRIS</h4>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gopay, OVO, Dana, ShopeePay</p>
                        </div>
                        
                        <div style={{ border: '1px dashed var(--border-color)', borderRadius: '12px', padding: '20px', textAlign: 'center', opacity: 0.5, cursor: 'not-allowed' }}>
                            <i className="fas fa-credit-card" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '15px' }}></i>
                            <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Credit Card</h4>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Coming Soon</p>
                        </div>
                    </div>
                </div>

                <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1 1 300px', backgroundColor: 'var(--bg-input)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                            <i className="fas fa-info-circle" style={{ color: 'var(--accent-blue)', marginRight: '6px' }}></i>
                            Payment Notes
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                            <li>QRIS payments are usually confirmed instantly.</li>
                            <li><strong>Platform Fee</strong> is applied based on the selected payment method to maintain our services.</li>
                            <li>Once the payment is successful, the balance is non-refundable.</li>
                        </ul>
                    </div>

                    <div style={{ flex: '1 1 300px', backgroundColor: 'var(--bg-input)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-muted)' }}>
                            <span>Top-up Amount</span>
                            <span>IDR {formatCurrency(subtotal)}</span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-muted)' }}>
                            <span>Platform Fee</span>
                            <span>IDR {formatCurrency(serviceFee)}</span>
                        </div>
                        
                        <div style={{ borderTop: '1px dashed var(--border-color)', margin: '15px 0' }}></div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                            <span>Total Payment</span>
                            <span>IDR {formatCurrency(totalPayment)}</span>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={isProcessing || !amount || !paymentMethod}
                            style={{ padding: '12px 30px', fontSize: '1.1rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-lock'}`} style={{ marginRight: '8px' }}></i>
                            {isProcessing ? 'Processing...' : 'Pay Now'}
                        </button>
                    </div>
                </div>
            </form>
        </section>
    );
}