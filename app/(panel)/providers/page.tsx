'use client';

import { useState, useEffect } from 'react';
import { useAlert } from '@/app/components/ui/Alert';
import { deleteProviderAction, getProvidersAction, saveProviderAction } from '@/app/actions/provider/providerAction';

interface Provider {
    id: number;
    name: string;
    inputPricing: number;
    inputCachePricing: number;
    outputPricing: number;
    status: 'ACTIVE' | 'INACTIVE';
}

export default function ProviderManager() {
    const { showAlert } = useAlert();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form State
    const [editId, setEditId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        inputPricing: 0,
        inputCachePricing: 0,
        outputPricing: 0,
        status: 'ACTIVE'
    });

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        setIsLoading(true);
        const result = await getProvidersAction();

        console.log('Fetched Providers:', result); // Debugging log
        
        if (!result.success) {
            showAlert(result.message, 'error');
            setProviders([]); // Kosongkan data jika error
        } else {
            setProviders(result.data ?? []);
        }
        
        setIsLoading(false);
    };

    const handleEdit = (provider: Provider) => {
        setEditId(provider.id);
        setFormData({
            name: provider.name,
            inputPricing: provider.inputPricing,
            inputCachePricing: provider.inputCachePricing,
            outputPricing: provider.outputPricing,
            status: provider.status
        });
    };

    const handleCancel = () => {
        setEditId(null);
        setFormData({ name: '', inputPricing: 0, inputCachePricing: 0, outputPricing: 0, status: 'ACTIVE' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        const result = await saveProviderAction(formData, editId || undefined);
        if (result.success) {
            showAlert(`Provider berhasil ${editId ? 'diperbarui' : 'ditambahkan'}.`, 'success');
            handleCancel();
            fetchProviders();
        } else {
            showAlert(result.message, 'error');
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus provider ini?')) return;
        const result = await deleteProviderAction(id);
        if (result.success) {
            showAlert('Provider dihapus.', 'warning');
            fetchProviders();
        } else {
            showAlert(result.message, 'error');
        }
    };

    return (
        <section className="card">
            <div className="card-header">
                <h2>
                    <i className="fas fa-server" style={{ color: 'var(--accent)', marginRight: 10 }} />
                    Manage AI Providers
                </h2>
            </div>

            {/* FORM TAMBAH / EDIT */}
            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label>Provider Name</label>
                        <input type="text" className="form-control" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. OpenAI, DeepSeek" />
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select className="form-control" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE'})}>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Input Pricing ($/1M tokens)</label>
                        <input type="number" step="0.0001" className="form-control" required value={formData.inputPricing} onChange={(e) => setFormData({...formData, inputPricing: e.target.value as any })} />
                    </div>
                    <div className="form-group">
                        <label>Input Cache Pricing</label>
                        <input type="number" step="0.0001" className="form-control" required value={formData.inputCachePricing} onChange={(e) => setFormData({...formData, inputCachePricing: e.target.value as any })} />
                    </div>
                    <div className="form-group">
                        <label>Output Pricing ($/1M tokens)</label>
                        <input type="number" step="0.0001" className="form-control" required value={formData.outputPricing} onChange={(e) => setFormData({...formData, outputPricing: e.target.value as any })} />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', justifyContent: 'flex-end', gridColumn: '1 / -1' }}>
                        {editId && (
                            <button type="button" className="btn btn-outline btn-sm" onClick={handleCancel}>
                                <i className="fas fa-times" /> Cancel
                            </button>
                        )}
                        <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
                            <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`} /> {editId ? 'Update Provider' : 'Add Provider'}
                        </button>
                    </div>
                </form>
            </div>

            {/* TABEL DATA */}
            <div style={{ paddingTop: '1rem', overflowX: 'auto' }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}><i className="fas fa-spinner fa-spin fa-2x" /></div>
                ) : (
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <th style={{ padding: '8px' }}>Name</th>
                                <th style={{ padding: '8px' }}>Input Price</th>
                                <th style={{ padding: '8px' }}>Cache Price</th>
                                <th style={{ padding: '8px' }}>Output Price</th>
                                <th style={{ padding: '8px' }}>Status</th>
                                <th style={{ padding: '8px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {providers.map((p) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{p.name}</td>
                                    <td style={{ padding: '8px' }}>${p.inputPricing}</td>
                                    <td style={{ padding: '8px' }}>${p.inputCachePricing}</td>
                                    <td style={{ padding: '8px' }}>${p.outputPricing}</td>
                                    <td style={{ padding: '8px' }}>
                                        <span style={{ 
                                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', 
                                            background: p.status === 'ACTIVE' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 94, 0.2)',
                                            color: p.status === 'ACTIVE' ? 'var(--accent-green)' : 'var(--accent-red)'
                                        }}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
                                        <button className="btn btn-outline btn-sm" onClick={() => handleEdit(p)}><i className="fas fa-edit" /></button>
                                        <button className="btn btn-outline btn-sm" onClick={() => handleDelete(p.id)} style={{ color: 'var(--accent-red)', borderColor: 'transparent' }}><i className="fas fa-trash-alt" /></button>
                                    </td>
                                </tr>
                            ))}
                            {providers.length === 0 && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>No providers found.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}