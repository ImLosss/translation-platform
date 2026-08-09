'use client';

import { useState, useCallback, useRef } from 'react';
import { useAlert } from '../ui/Alert';
import SelectSearch from '../client/SelectSearch';

export interface GlosaryEntry {
    id?: number;
    source: string;
    target: string;
    detail: string;
    isRecommended?: boolean;
}

export interface GlosaryInfo {
    id?: number;
    name: string;
    sourceLanguage: string;
    targetLanguage: string;
}

interface GlossaryRecommendationEditorProps {
    existingGlossary?: GlosaryInfo | null;
    existingEntries?: GlosaryEntry[];
    recommendations: GlosaryEntry[];
    onSave: (glossaryInfo: GlosaryInfo, entries: GlosaryEntry[]) => Promise<void>;
}

// Opsi bahasa yang sama dengan form template Anda
const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Indonesian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
];

export default function GlossaryRecommendationEditor({
    existingGlossary,
    existingEntries = [],
    recommendations = [],
    onSave
}: GlossaryRecommendationEditorProps) {
    const { showAlert } = useAlert();
    
    // State untuk info glossary baru
    const [glossaryInfo, setGlossaryInfo] = useState<GlosaryInfo>(
        existingGlossary || { name: '', sourceLanguage: 'en', targetLanguage: 'id' }
    );

    const nextTempId = useRef(-1);

    // Inisialisasi daftar entri
    const [entries, setEntries] = useState<GlosaryEntry[]>(() => {
        const oldEntries = existingEntries.map(e => ({ ...e, isRecommended: false }));
        const newEntries = recommendations.map(e => ({
            ...e,
            id: nextTempId.current--,
            isRecommended: true 
        }));
        return [...oldEntries, ...newEntries];
    });

    const [isSaving, setIsSaving] = useState(false);

    // Hitung jumlah kemunculan source untuk deteksi duplikat
    const sourceCounts = entries.reduce((acc, entry) => {
        const val = entry.source.trim().toLowerCase();
        if (val) {
            acc[val] = (acc[val] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const handleAddEntry = useCallback((afterIndex?: number) => {
        const newEntry: GlosaryEntry = {
            id: nextTempId.current--,
            source: '',
            target: '',
            detail: '',
            isRecommended: false,
        };
        setEntries((prev) => {
            if (afterIndex !== undefined) {
                const updated = [...prev];
                updated.splice(afterIndex + 1, 0, newEntry);
                return updated;
            }
            return [...prev, newEntry];
        });
    }, []);

    const handleDeleteEntry = useCallback((index: number) => {
        setEntries((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleUpdateEntry = useCallback((index: number, field: keyof GlosaryEntry, value: string) => {
        setEntries((prev) =>
            prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
        );
    }, []);

    const resizeTextarea = (el: HTMLTextAreaElement | null) => {
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    };

    // Fungsi Submit/Save
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault(); // Mencegah reload jika berada dalam tag form

        if (!existingGlossary?.id) {
            if (!glossaryInfo.name || !glossaryInfo.sourceLanguage || !glossaryInfo.targetLanguage) {
                showAlert('Glossary Name and Languages are required for a new glossary!', 'error');
                return;
            }
        }

        const hasEmptyRequired = entries.some(e => !e.source.trim() || !e.target.trim());
        if (hasEmptyRequired) {
            showAlert('Source and Target in entries cannot be empty!', 'error');
            return;
        }

        const hasDuplicates = Object.values(sourceCounts).some(count => count > 1);
        if (hasDuplicates) {
            showAlert('There are duplicate Source Terms. Please fix them before saving!', 'error');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(glossaryInfo, entries);
        } catch (error) {
            showAlert('An error occurred while saving.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="card">
            <div className="card-header">
                <h2>
                    <i className="fas fa-magic" style={{ color: 'var(--accent)', marginRight: 10 }}></i>
                    Glossary Editor
                </h2>
                <div className="card-actions">
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                            if(window.confirm('Are you sure you want to reset all entries?')) {
                                // Logika reset entries jika dibutuhkan
                            }
                        }}
                    >
                        <i className="fas fa-undo-alt"></i> Reset
                    </button>
                </div>
            </div>

            <form onSubmit={handleSave}>
                {/* ================= FORM NEW GLOSSARY ================= */}
                {!existingGlossary?.id ? (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--text-primary)' }}>
                            <i className="fas fa-book-medical" style={{ marginRight: 8, color: 'var(--accent-green)' }}></i>
                            Create New Glossary
                        </h3>
                        
                        <div className="form-row">
                            <div className="form-group" style={{ flex: '1 1 100%' }}>
                                <label htmlFor="glossaryName">
                                    Glossary Name <span style={{ color: 'var(--accent-red)' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="glossaryName"
                                    placeholder="e.g. Anime Subtitle DB"
                                    value={glossaryInfo.name}
                                    onChange={(e) => setGlossaryInfo({ ...glossaryInfo, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="sourceLang">
                                    Source Language <span style={{ color: 'var(--accent-red)' }}>*</span>
                                </label>
                                <SelectSearch
                                    id="sourceLang"
                                    options={languageOptions}
                                    value={glossaryInfo.sourceLanguage}
                                    onChange={(val) => setGlossaryInfo({ ...glossaryInfo, sourceLanguage: val })}
                                    placeholder="Select source language"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="targetLang">
                                    Target Language <span style={{ color: 'var(--accent-red)' }}>*</span>
                                </label>
                                <SelectSearch
                                    id="targetLang"
                                    options={languageOptions}
                                    value={glossaryInfo.targetLanguage}
                                    onChange={(val) => setGlossaryInfo({ ...glossaryInfo, targetLanguage: val })}
                                    placeholder="Select target language"
                                />
                            </div>
                        </div>
                        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />
                    </div>
                ) : (
                    // Jika Glossary sudah ada
                    <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '20px' }}>
                        <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                            <i className="fas fa-info-circle" style={{ color: 'var(--accent-blue)', marginRight: '8px' }}></i>
                            Appending to Glossary: <strong>{existingGlossary.name}</strong> ({existingGlossary.sourceLanguage} → {existingGlossary.targetLanguage})
                        </p>
                    </div>
                )}

                {/* ================= ENTRIES LIST ================= */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '12px', display: 'block' }}>
                        Glossary Entries
                    </label>
                    <div id="GlosaryContainer">
                        {entries.map((entry, index) => {
                            const sourceVal = entry.source.trim().toLowerCase();
                            const isDuplicate = sourceVal !== '' && sourceCounts[sourceVal] > 1;

                            return (
                                <div 
                                    className={`glosary-line ${isDuplicate ? 'duplicated-line' : ''} ${entry.isRecommended ? 'recommended-highlight' : ''}`} 
                                    key={entry.id}
                                >
                                    <div className="sub-field">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            Source Term <span style={{ color: 'var(--accent-red)' }}>*</span>
                                            {entry.isRecommended && (
                                                <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--accent-green, #28a745)', color: '#fff', padding: '2px 6px', borderRadius: '4px', textTransform: 'none' }}>
                                                    <i className="fas fa-sparkles"></i> AI Suggested
                                                </span>
                                            )}
                                            {isDuplicate && (
                                                <span style={{ color: 'var(--accent-red, #dc3545)', fontWeight: 'bold', fontSize: '0.65rem', textTransform: 'none' }}>
                                                    <i className="fas fa-exclamation-triangle"></i> Duplicate
                                                </span>
                                            )}
                                        </label>
                                        <textarea
                                            ref={resizeTextarea}
                                            className="sub-source"
                                            rows={1}
                                            placeholder="Source word/phrase"
                                            value={entry.source}
                                            onChange={(e) => handleUpdateEntry(index, 'source', e.target.value)}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="sub-field">
                                        <label>Target Translation <span style={{ color: 'var(--accent-red)' }}>*</span></label>
                                        <textarea
                                            ref={resizeTextarea}
                                            className="sub-translated"
                                            rows={1}
                                            placeholder="Target word/phrase"
                                            value={entry.target}
                                            onChange={(e) => handleUpdateEntry(index, 'target', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="sub-field">
                                        <label>Detail / Context <span style={{ color: 'var(--text-muted)', textTransform: 'none', fontWeight: 'normal' }}>(Optional)</span></label>
                                        <textarea
                                            ref={resizeTextarea}
                                            className="sub-detail"
                                            rows={1}
                                            placeholder="Additional context..."
                                            value={entry.detail || ''}
                                            onChange={(e) => handleUpdateEntry(index, 'detail', e.target.value)}
                                        />
                                    </div>

                                    <div className="sub-actions">
                                        <button type="button" className="btn-add-line" onClick={() => handleAddEntry(index)} title="Add entry below">
                                            <i className="fas fa-plus-circle" />
                                        </button>
                                        <button type="button" className="btn-del-line" onClick={() => handleDeleteEntry(index)} title="Delete entry">
                                            <i className="fas fa-trash-alt" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ marginTop: '30px' }}>
                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                        <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>{' '}
                        {isSaving ? 'Saving Glossary...' : 'Confirm & Save Glossary'}
                    </button>
                </div>
            </form>
        </section>
    );
}