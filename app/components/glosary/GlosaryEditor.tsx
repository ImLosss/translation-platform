'use client';

import { useState, useCallback, useRef, useEffect, memo } from 'react';
import { useAlert } from '../ui/Alert';
import { updateGlosaryEntriesAction } from '@/app/actions/glosary/updateGlosaryEntriesAction';
import { GlosaryData } from '@/app/(panel)/glosary/[id]/page';

export interface GlosaryEntry {
    id: number;
    source: string;
    target: string;
    detail: string;
}

interface GlosaryEditorProps {
    entries: GlosaryEntry[];
    glosary: GlosaryData;
}

// ======== KOMPONEN GLOSARY ROW YANG DI-MEMOISASI ========
// Ini akan mencegah re-render pada semua baris saat user mengetik di salah satu baris
const GlosaryRow = memo(({
    entry,
    index,
    isDuplicate,
    handleUpdateEntry,
    handleAddEntry,
    handleDeleteEntry,
    resizeTextarea
}: any) => {
    return (
        <div className={`glosary-line ${isDuplicate ? 'duplicated-line' : ''}`}>
            <div className="sub-field">
                <label>
                    Source Term <span style={{ color: 'red' }}>*</span>
                    {isDuplicate && (
                        <span style={{ color: '#dc3545', marginLeft: '6px', textTransform: 'none', fontWeight: 'bold' }}>
                            <i className="fas fa-exclamation-triangle"></i> Duplicate
                        </span>
                    )}
                </label>
                <textarea
                    ref={resizeTextarea}
                    className="sub-source"
                    rows={1}
                    placeholder="Kata/Frasa Asli"
                    value={entry.source}
                    onChange={(e) => handleUpdateEntry(index, 'source', e.target.value)}
                />
            </div>
            
            <div className="sub-field">
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

            <div className="sub-field">
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

            <div className="sub-actions">
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
    );
}, (prevProps, nextProps) => {
    // Hanya render ulang jika data entry ini berubah, index berubah, atau status duplikatnya berubah
    return (
        prevProps.entry === nextProps.entry &&
        prevProps.isDuplicate === nextProps.isDuplicate &&
        prevProps.index === nextProps.index
    );
});


// ======== KOMPONEN UTAMA ========
export default function GlosaryEditor({
    entries: initialEntries,
    glosary,
}: GlosaryEditorProps) {
    const { showAlert } = useAlert();
    
    // Inisialisasi state
    const [entries, setEntries] = useState<GlosaryEntry[]>(initialEntries);
    const [lastSavedEntries, setLastSavedEntries] = useState<GlosaryEntry[]>(initialEntries);
    const [isSaving, setIsSaving] = useState(false);
    
    // State & Ref untuk Floating Button (Diperbaiki)
    const [isSaveVisible, setIsSaveVisible] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);

    const nextTempId = useRef(
        Math.min(0, ...initialEntries.map(e => e.id)) - 1
    );

    // ===================== DETEKSI DUPLIKAT =====================
    const sourceCounts = entries.reduce((acc, entry) => {
        const val = entry.source.trim().toLowerCase();
        if (val) {
            acc[val] = (acc[val] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    // ===================== FUNGSI RESET =====================
    const handleReset = useCallback(() => {
        if (window.confirm('Are you sure you want to revert to the last saved state? All unsaved changes will be lost.')) {
            setEntries([...lastSavedEntries]);
            showAlert('Reverted to last saved state.', 'warning');
        }
    }, [lastSavedEntries, showAlert]);

    // ===================== OBSERVER FLOATING BUTTON =====================
    const saveContainerRef = useCallback((node: HTMLDivElement | null) => {
        if (observer.current) observer.current.disconnect();
        
        if (node) {
            observer.current = new IntersectionObserver(
                ([entry]) => {
                    setIsSaveVisible(entry.isIntersecting);
                },
                { threshold: 0, rootMargin: '0px 0px 50px 0px' } 
            );
            observer.current.observe(node);
        }
    }, []);

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
            if (afterIndex === undefined) showAlert('New glosary entry added.', 'success');
        },
        [showAlert]
    );

    const handleDeleteEntry = useCallback(
        (index: number) => {
            if (entries.length <= 1) {
                showAlert('At least one glosary entry is required.', 'warning');
                return;
            }
            setEntries((prev) => prev.filter((_, i) => i !== index));
            showAlert('Glosary entry deleted.', 'warning');
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

    const resizeTextarea = useCallback((el: HTMLTextAreaElement | null) => {
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }, []);

    // ===================== SIMPAN DATA =====================
    const handleSave = async (e?: React.FormEvent) => {
        if (e && e.preventDefault) e.preventDefault();

        const hasEmptyRequired = entries.some(e => !e.source.trim() || !e.target.trim());
        if (hasEmptyRequired) {
            showAlert('Source and Target cannot be empty!', 'warning');
            return;
        }

        const hasDuplicates = Object.values(sourceCounts).some(count => count > 1);
        if (hasDuplicates) {
            showAlert('There are duplicate Source Terms. Please fix them before saving!', 'error');
            return;
        }

        setIsSaving(true);
        try {
            // 1. Data yang baru (id < 0)
            const creates = entries.filter(l => l.id < 0);
            
            // 2. Data yang diupdate
            const updates = entries.filter(l => {
                if (l.id < 0) return false;
                const original = lastSavedEntries.find(old => old.id === l.id);
                if (!original) return false;
                return (
                    l.source !== original.source ||
                    l.target !== original.target ||
                    l.detail !== original.detail
                );
            });

            // 3. Data yang dihapus
            const deletes = lastSavedEntries
                .filter(old => !entries.some(l => l.id === old.id))
                .map(old => old.id);

            if (creates.length === 0 && updates.length === 0 && deletes.length === 0) {
                showAlert('Tidak ada perubahan untuk disimpan.', 'info');
                return;
            }

            const result = await updateGlosaryEntriesAction(glosary.id, { creates, updates, deletes });
            
            if (result.success) {
                showAlert('Glosary entries saved successfully.', 'success');
                setLastSavedEntries([...entries]); 
            } else {
                showAlert(result.message, 'error');
            }
        } catch (error) {
            showAlert('An error occurred while saving.', 'error');
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

            <div id="GlosaryContainer" style={{ marginTop: '16px' }}>
                {entries.map((entry, index) => {
                    const sourceVal = entry.source.trim().toLowerCase();
                    const isDuplicate = sourceVal !== '' && sourceCounts[sourceVal] > 1;

                    return (
                        <GlosaryRow
                            key={entry.id}
                            entry={entry}
                            index={index}
                            isDuplicate={isDuplicate}
                            handleUpdateEntry={handleUpdateEntry}
                            handleAddEntry={handleAddEntry}
                            handleDeleteEntry={handleDeleteEntry}
                            resizeTextarea={resizeTextarea}
                        />
                    );
                })}
            </div>

            {/* Container referensi untuk intersection observer */}
            <div 
                ref={saveContainerRef}
                style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 12, justifyContent: 'end' }}
            >
                <button className="btn btn-outline btn-sm" onClick={handleSave} disabled={isSaving}>
                    <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`} />{' '}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* FLOATING SAVE BUTTON */}
            {!isSaveVisible && (
                <button 
                    className="btn btn-primary" 
                    onClick={handleSave} 
                    disabled={isSaving}
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        zIndex: 9999,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        borderRadius: '50px',
                        padding: '12px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`} /> 
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            )}
        </section>
    );
}