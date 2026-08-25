'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/app/components/ui/Alert';

export default function TopupClient() {
    const router = useRouter();
    const { showAlert } = useAlert();

    const [amount, setAmount] = useState<number | ''>('');
    const [paymentMethod, setPaymentMethod] = useState<'qris' | 'credit_card' | ''>('');
    const [isProcessing, setIsProcessing] = useState(false);

    const quickAmounts = [50000, 100000, 250000, 500000];

    // ================= CALCULATE DYNAMIC SERVICE FEE =================
    const subtotal = Number(amount) || 0;
    let serviceFee = 0;

    if (subtotal > 0 && paymentMethod) {
        if (paymentMethod === 'credit_card') {
            // Faspay CC Aggregator Fee: Rp 2.000 + 2.7%
            serviceFee = 2000 + Math.round(subtotal * 0.027);
        } else if (paymentMethod === 'qris') {
            // Asumsi QRIS MDR Fee: 0.7%
            serviceFee = Math.round(subtotal * 0.007);
        }
    }

    const totalPayment = subtotal + serviceFee;

    // Helper to format currency
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US').format(val);
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || amount < 10000) {
            showAlert('Minimum top-up amount is IDR 10,000', 'error');
            return;
        }

        if (!paymentMethod) {
            showAlert('Please select a payment method first.', 'error');
            return;
        }

        setIsProcessing(true);
        try {
            // Payload yang akan dikirim ke backend NestJS
            const payload = {
                amount: subtotal,
                fee: serviceFee, // Backend akan menerima ini sebagai fee tambahan
                total: totalPayment,
                method: paymentMethod
            };
            
            console.log('Initiating Payment:', payload);
            await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulasi API Call

            showAlert('Payment initiated successfully!', 'success');
            // router.push('/billing/invoice/123'); 
            
        } catch (error) {
            console.error(error);
            showAlert('An error occurred while processing your payment.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
            <section className="card">
                <div className="card-header">
                    <h2>
                        <i className="fas fa-wallet" style={{ color: 'var(--accent)', marginRight: 10 }}></i>
                        Top Up Balance
                    </h2>
                </div>

                <form onSubmit={handleCheckout}>
                    {/* ================= INPUT AMOUNT ================= */}
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
                            <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                IDR
                            </span>
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

                    {/* ================= PAYMENT METHOD ================= */}
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

                            <div 
                                onClick={() => setPaymentMethod('credit_card')}
                                style={{
                                    border: paymentMethod === 'credit_card' ? '2px solid var(--accent, #007bff)' : '1px solid var(--border-color)',
                                    backgroundColor: paymentMethod === 'credit_card' ? 'var(--bg-input)' : 'transparent',
                                    borderRadius: '12px', padding: '20px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
                                    boxShadow: paymentMethod === 'credit_card' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                <i className="fas fa-credit-card" style={{ fontSize: '3rem', color: paymentMethod === 'credit_card' ? 'var(--accent, #007bff)' : 'var(--text-muted)', marginBottom: '15px' }}></i>
                                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Credit Card</h4>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Visa, Mastercard, JCB</p>
                            </div>
                        </div>
                    </div>

                    <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

                    {/* ================= BILLING SUMMARY & NOTES ================= */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        
                        <div style={{ flex: '1 1 300px', backgroundColor: 'var(--bg-input)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                <i className="fas fa-info-circle" style={{ color: 'var(--accent-blue)', marginRight: '6px' }}></i>
                                Payment Notes
                            </h4>
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                <li>QRIS payments are usually confirmed instantly.</li>
                                {/* Menyembunyikan kata-kata detail 2.7% di note agar terkesan seperti biaya platform biasa */}
                                <li><strong>Service Fee</strong> is applied based on the selected payment method to maintain our services.</li>
                                <li>Once the payment is successful, the balance is non-refundable.</li>
                                <li>If your balance is not updated within 10 minutes, please contact support.</li>
                            </ul>
                        </div>

                        <div style={{ flex: '1 1 300px', backgroundColor: 'var(--bg-input)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-muted)' }}>
                                <span>Top-up Amount</span>
                                <span>IDR {formatCurrency(subtotal)}</span>
                            </div>
                            
                            {/* Menggunakan label Platform Service Fee yang aman */}
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
                            <p style={{ marginTop: '15px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 0 }}>
                                <i className="fas fa-shield-alt"></i> Payments are 100% secure and encrypted.
                            </p>
                        </div>
                    </div>
                </form>
            </section>
    );
}