'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/app/components/ui/Alert';
import SelectSearch from '@/app/components/client/SelectSearch';
import { saveGlossaryAction } from '@/app/actions/translate/generateGlosaryAction';

// ================= INTERFACES & CONSTANTS =================
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

// ================= KOMPONEN UTAMA (1 FUNGSI) =================
export default function GlossaryRecommendationClient() {
    const router = useRouter();
    const { showAlert } = useAlert(); 

    // --- State untuk Load Data ---
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [translationId, setTranslationId] = useState<number | null>(null);
    const [sourceLang, setSourceLang] = useState<string>('en');
    const [targetLang, setTargetLang] = useState<string>('id');
    const [existingGlossaryId, setExistingGlossaryId] = useState<number | null>(null);

    // --- State untuk Form Editor ---
    const [glossaryInfo, setGlossaryInfo] = useState<GlosaryInfo>({ name: '', sourceLanguage: 'en', targetLanguage: 'id' });
    const [entries, setEntries] = useState<GlosaryEntry[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const nextTempId = useRef(-1);

    // 1. Ambil data dari sessionStorage saat komponen dimuat
    useEffect(() => {
        const savedData = sessionStorage.getItem('tempGlossary');
        
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                const tId = parsedData.translationId;

                if (!tId) throw new Error("translationId is missing in payload");

                const recommendations = parsedData.recommendations || [];
                if (recommendations.length === 0) {
                    showAlert('No recommendation data available.', 'error');
                    router.push('/translate');
                    return;
                }

                // Set Data Umum
                setTranslationId(tId);

                // Set Data Glossary (Jika ada)
                if (parsedData.glosary?.id) {
                    setExistingGlossaryId(parsedData.glosary.id);
                    setGlossaryInfo({
                        id: parsedData.glosary.id,
                        name: parsedData.glosary.name,
                        sourceLanguage: parsedData.glosary.sourceLanguage,
                        targetLanguage: parsedData.glosary.targetLanguage,
                    });
                }

                // Set Source and Target Languages
                setSourceLang(parsedData.sourceLang || 'en');
                setTargetLang(parsedData.targetLang || 'id');

                // Gabungkan Entries Lama & Rekomendasi Baru
                const oldEntries = (parsedData.glosary?.entries || []).map((e: any) => ({ ...e, isRecommended: false }));
                const newEntries = recommendations.map((e: any) => ({
                    ...e,
                    id: nextTempId.current--,
                    isRecommended: true 
                }));

                setEntries([...newEntries, ...oldEntries]);

                setIsLoadingData(false);

            } catch (error) {
                console.error("Gagal mem-parsing data dari sessionStorage", error);
                showAlert('Format data rekomendasi tidak valid.', 'error');
                router.push('/translate');
            }
        } else {
            showAlert('No recommendation data available.', 'error');
            router.push('/translate');
        }
    }, [router, showAlert]); 

    // 2. Fungsi Logika Form Editor (Tambah, Hapus, Update)
    const sourceCounts = entries.reduce((acc, entry) => {
        const val = entry.source.trim().toLowerCase();
        if (val) acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const handleAddEntry = useCallback((afterIndex?: number) => {
        const newEntry: GlosaryEntry = {
            id: nextTempId.current--,
            source: '', target: '', detail: '', isRecommended: false,
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
        setEntries((prev) => prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)));
    }, []);

    const resizeTextarea = (el: HTMLTextAreaElement | null) => {
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    };

    // 3. Fungsi Save/Submit Data ke Action
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault(); 

        const hasDuplicates = Object.values(sourceCounts).some(count => count > 1);
        if (hasDuplicates) {
            showAlert('There are duplicate Source Terms. Please fix them before saving!', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const cleanEntries = entries.map(({ id, source, target, detail }) => ({ id, source, target, detail }));

            const payload = {
                translationId: translationId!, // Hanya dipakai saat Create
                glosaryId: glossaryInfo.id,    // Mengubah id menjadi glosaryId untuk DTO NestJS
                name: glossaryInfo.name,
                sourceLanguage: glossaryInfo.sourceLanguage,
                targetLanguage: glossaryInfo.targetLanguage,
                entries: cleanEntries
            };

            const response = await saveGlossaryAction(payload);

            if (!response.success) {
                showAlert(`Failed to save glossary: ${response.message}`, 'error');
                return;
            }

            showAlert(response.message, 'success');
            sessionStorage.removeItem('tempGlossary');
            return router.push('/translate');
            
        } catch (error) {
            console.error(error);
            showAlert('Gagal menyimpan glosarium', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // --- Tampilan Loading ---
    if (isLoadingData) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-primary)' }}>
                <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px', fontSize: '1.5rem' }}></i>
                <p style={{ marginTop: '12px' }}>Memuat data rekomendasi...</p>
            </div>
        );
    }

    // --- Tampilan Form Utama ---
    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <button 
                    className="btn btn-outline btn-sm" 
                    onClick={() => {
                        if(window.confirm('Batal menyimpan glosarium dan kembali ke daftar?')) {
                            router.push('/translate');
                        }
                    }}
                >
                    <i className="fas fa-arrow-left"></i> Kembali
                </button>
            </div>

            <section className="card">
                <div className="card-header">
                    <h2>
                        <i className="fas fa-magic" style={{ color: 'var(--accent)', marginRight: 10 }}></i>
                        Glossary Editor (Job #{translationId})
                    </h2>
                    <div className="card-actions">
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                                if(window.confirm('Are you sure you want to reset all entries?')) {
                                    setEntries([]); 
                                }
                            }}
                        >
                            <i className="fas fa-undo-alt"></i> Reset
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSave}>
                    {/* FORM NEW GLOSSARY */}
                    {!existingGlossaryId ? (
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--text-primary)' }}>
                                <i className="fas fa-book-medical" style={{ marginRight: 8, color: 'var(--accent-green)' }}></i>
                                Create New Glossary
                            </h3>
                            <div className="form-row">
                                <div className="form-group" style={{ flex: '1 1 100%' }}>
                                    <label htmlFor="glossaryName">Glossary Name <span style={{ color: 'var(--accent-red)' }}>*</span></label>
                                    <input
                                        type="text" className="form-control" id="glossaryName" placeholder="e.g. Anime Subtitle DB"
                                        value={glossaryInfo.name} onChange={(e) => setGlossaryInfo({ ...glossaryInfo, name: e.target.value })} required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="sourceLang">Source Language <span style={{ color: 'var(--accent-red)' }}>*</span></label>
                                    <input
                                        type="text" className="form-control" id="sourceLang"
                                        value={sourceLang} required
                                        disabled
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="targetLang">Target Language <span style={{ color: 'var(--accent-red)' }}>*</span></label>
                                    <input
                                        type="text" className="form-control" id="targetLang"
                                        value={targetLang} required
                                        disabled
                                    />
                                </div>
                            </div>
                            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />
                        </div>
                    ) : (
                        <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '20px' }}>
                            <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                                <i className="fas fa-info-circle" style={{ color: 'var(--accent-blue)', marginRight: '8px' }}></i>
                                Appending to Glossary: <strong>{glossaryInfo.name}</strong> ({glossaryInfo.sourceLanguage} → {glossaryInfo.targetLanguage})
                            </p>
                        </div>
                    )}

                    {/* ENTRIES LIST */}
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '12px', display: 'block' }}>
                            Glossary Entries
                        </label>
                        <div id="GlosaryContainer">
                            {entries.map((entry, index) => {
                                const sourceVal = entry.source.trim().toLowerCase();
                                const isDuplicate = sourceVal !== '' && sourceCounts[sourceVal] > 1;

                                return (
                                    <div className={`glosary-line ${isDuplicate ? 'duplicated-line' : ''} ${entry.isRecommended ? 'recommended-highlight' : ''}`} key={entry.id}>
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
                                                ref={resizeTextarea} className="sub-source" rows={1} placeholder="Source word/phrase"
                                                value={entry.source} onChange={(e) => handleUpdateEntry(index, 'source', e.target.value)} required
                                            />
                                        </div>
                                        
                                        <div className="sub-field">
                                            <label>Target Translation <span style={{ color: 'var(--accent-red)' }}>*</span></label>
                                            <textarea
                                                ref={resizeTextarea} className="sub-translated" rows={1} placeholder="Target word/phrase"
                                                value={entry.target} onChange={(e) => handleUpdateEntry(index, 'target', e.target.value)} required
                                            />
                                        </div>

                                        {/* KEMBALI MENGGUNAKAN TEXTAREA UNTUK DETAIL/CONTEXT */}
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
                                            <button type="button" className="btn-add-line" onClick={() => handleAddEntry(index)} title="Add entry below"><i className="fas fa-plus-circle" /></button>
                                            <button type="button" className="btn-del-line" onClick={() => handleDeleteEntry(index)} title="Delete entry"><i className="fas fa-trash-alt" /></button>
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
        </div>
    );
}