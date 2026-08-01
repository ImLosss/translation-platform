'use client';

import { useState, useCallback, useRef } from 'react';
import { useAlert } from '../ui/Alert';
import { updateGlosaryEntriesAction } from '@/app/actions/glosary/updateGlosaryEntriesAction';
import { GlosaryData } from '@/app/(panel)/glosary/[id]/page';

export interface GlosaryEntry {
    id: number; // Gunakan ID negatif untuk entry baru yang belum disave ke DB
    source: string;
    target: string;
    detail: string;
}

interface GlosaryEditorProps {
    entries: GlosaryEntry[];
    glosary: GlosaryData;
}

export default function GlosaryEditor({
    entries: initialEntries,
    glosary,
}: GlosaryEditorProps) {
    const { showAlert } = useAlert();
    
    // Inisialisasi state
    const [entries, setEntries] = useState<GlosaryEntry[]>(initialEntries);
    const [lastSavedEntries, setLastSavedEntries] = useState<GlosaryEntry[]>(initialEntries);
    const [isSaving, setIsSaving] = useState(false);
    
    const nextTempId = useRef(
        Math.min(0, ...initialEntries.map(e => e.id)) - 1
    );

    // ===================== FUNGSI RESET =====================
    const handleReset = useCallback(() => {
        if (window.confirm('Apakah Anda yakin ingin mengembalikan ke kondisi terakhir yang disimpan? Semua perubahan yang belum disimpan akan hilang.')) {
            setEntries([...lastSavedEntries]);
            showAlert('Dikembalikan ke kondisi terakhir disimpan.', 'warning');
        }
    }, [lastSavedEntries, showAlert]);

    // ===================== HANDLER GLOSARIUM =====================
    const handleAddEntry = useCallback(
        (afterIndex?: number) => {
            const newEntry: GlosaryEntry = {
                id: nextTempId.current--,
                source: '',
                target: '',
                detail: '',
            };
            setEntries((prev) => {
                if (afterIndex !== undefined) {
                    const updated = [...prev];
                    updated.splice(afterIndex + 1, 0, newEntry);
                    return updated;
                }
                return [...prev, newEntry];
            });
            if (afterIndex === undefined) showAlert('Baris glosarium baru ditambahkan.', 'success');
        },
        [showAlert]
    );

    const handleDeleteEntry = useCallback(
        (index: number) => {
            if (entries.length <= 1) {
                showAlert('Minimal harus ada satu baris glosarium.', 'warning');
                return;
            }
            setEntries((prev) => prev.filter((_, i) => i !== index));
            showAlert('Baris glosarium dihapus.', 'warning');
        },
        [entries, showAlert]
    );

    const handleUpdateEntry = useCallback(
        (index: number, field: keyof GlosaryEntry, value: string) => {
            setEntries((prev) =>
                prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
            );
        },
        []
    );

    // Bantuan untuk otomatis menyesuaikan tinggi textarea
    const resizeTextarea = (el: HTMLTextAreaElement | null) => {
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    };

    // ===================== SIMPAN DATA =====================
    const handleSave = async () => {
        // Validasi simpel sebelum dikirim
        const hasEmptyRequired = entries.some(e => !e.source.trim() || !e.target.trim());
        if (hasEmptyRequired) {
            showAlert('Source dan Target tidak boleh kosong!', 'warning');
            return;
        }

        setIsSaving(true);
        try {
            // Panggil action dengan GlosaryId dan array entries
            const result = await updateGlosaryEntriesAction(glosary.id, entries);
            if (result.success) {
                showAlert('Glosarium berhasil disimpan.', 'success');
                setLastSavedEntries([...entries]); // Update titik aman untuk fitur Reset
            } else {
                showAlert(result.message, 'error');
            }
        } catch (error) {
            showAlert('Terjadi kesalahan saat menyimpan.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // ===================== RENDER =====================
    return (
        <section className="card">
            <div className="card-header">
                <h2>
                    <i className="fas fa-book" style={{ color: 'var(--accent)', marginRight: 10 }} />
                    Glosarium Editor - {glosary.name} ({glosary.sourceLanguage} → {glosary.targetLanguage})
                </h2>
                <div className="card-actions">
                    <button className="btn btn-outline btn-sm" onClick={handleReset}>
                        <i className="fas fa-undo" /> Reset to Last Save
                    </button>
                </div>
            </div>

            {/* Container Glosary */}
            <div id="GlosaryContainer" style={{ marginTop: '16px' }}>
                {entries.map((entry, index) => (
                    <div 
                        className="glosary-line" 
                        key={entry.id}
                        style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '12px' }}
                    >
                        <div className="sub-field" style={{ flex: 1 }}>
                            <label>Source Term <span style={{ color: 'red' }}>*</span></label>
                            <textarea
                                ref={resizeTextarea}
                                className="sub-source"
                                rows={1}
                                placeholder="Kata/Frasa Asli"
                                value={entry.source}
                                onChange={(e) => handleUpdateEntry(index, 'source', e.target.value)}
                            />
                        </div>
                        
                        <div className="sub-field" style={{ flex: 1 }}>
                            <label>Target Translation <span style={{ color: 'red' }}>*</span></label>
                            <textarea
                                ref={resizeTextarea}
                                className="sub-translated"
                                rows={1}
                                placeholder="Terjemahan"
                                value={entry.target}
                                onChange={(e) => handleUpdateEntry(index, 'target', e.target.value)}
                            />
                        </div>

                        <div className="sub-field" style={{ flex: 1.5 }}>
                            <label>Detail / Context (Opsional)</label>
                            <textarea
                                ref={resizeTextarea}
                                className="sub-detail"
                                rows={1}
                                placeholder="Catatan tambahan..."
                                value={entry.detail || ''}
                                onChange={(e) => handleUpdateEntry(index, 'detail', e.target.value)}
                            />
                        </div>

                        <div className="sub-actions" style={{ display: 'flex', gap: '4px', marginTop: '24px' }}>
                            <button
                                className="btn-add-line"
                                title="Tambahkan entri di bawah ini"
                                onClick={() => handleAddEntry(index)}
                            >
                                <i className="fas fa-plus-circle" />
                            </button>
                            <button
                                className="btn-del-line"
                                title="Hapus entri ini"
                                onClick={() => handleDeleteEntry(index)}
                            >
                                <i className="fas fa-trash-alt" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Area Tambah di Akhir & Simpan */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 12, justifyContent: 'space-between' }}>
                <button className="btn btn-success btn-sm" onClick={() => handleAddEntry()}>
                    <i className="fas fa-plus" /> Tambah Baris
                </button>
                
                <button className="btn btn-outline btn-sm" onClick={handleSave} disabled={isSaving}>
                    <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`} />{' '}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </section>
    );
}