'use client';

import { useState, useCallback, useRef } from 'react';
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

    // ===================== DETEKSI DUPLIKAT =====================
    // Menghitung jumlah kemunculan setiap kata di kolom Source (case-insensitive)
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

    const resizeTextarea = (el: HTMLTextAreaElement | null) => {
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    };

    // ===================== SIMPAN DATA =====================
    const handleSave = async () => {
        const hasEmptyRequired = entries.some(e => !e.source.trim() || !e.target.trim());
        if (hasEmptyRequired) {
            showAlert('Source and Target cannot be empty!', 'warning');
            return;
        }

        // Opsional: Cegah save jika ada duplikat
        const hasDuplicates = Object.values(sourceCounts).some(count => count > 1);
        if (hasDuplicates) {
            showAlert('There are duplicate Source Terms. Please fix them before saving!', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const result = await updateGlosaryEntriesAction(glosary.id, entries);
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
                    // Cek apakah entry ini duplikat
                    const sourceVal = entry.source.trim().toLowerCase();
                    const isDuplicate = sourceVal !== '' && sourceCounts[sourceVal] > 1;

                    return (
                        <div 
                            className={`glosary-line ${isDuplicate ? 'duplicated-line' : ''}`} 
                            key={entry.id}
                        >
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
                })}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 12, justifyContent: 'end' }}>
                <button className="btn btn-outline btn-sm" onClick={handleSave} disabled={isSaving}>
                    <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`} />{' '}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </section>
    );
}