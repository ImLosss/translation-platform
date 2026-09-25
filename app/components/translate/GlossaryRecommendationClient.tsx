'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/app/components/ui/Alert';
import { saveGlossaryAction } from '@/app/actions/translate/generateGlosaryAction';
import { useLanguage } from '../client/LanguageProvider';
import { interpolate } from '@/app/lib/i18n/format';

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

// ======== KOMPONEN BARIS (DI-MEMOISASI) ========
// Mencegah re-render pada semua baris saat user mengetik di salah satu baris
const GlossaryRecommendationRow = memo(({
    entry,
    index,
    isDuplicate,
    t,
    handleUpdateEntry,
    handleAddEntry,
    handleDeleteEntry,
    resizeTextarea
}: any) => {
    return (
        <div className={`glosary-line ${isDuplicate ? 'duplicated-line' : ''} ${entry.isRecommended ? 'recommended-highlight' : ''}`}>
            <div className="sub-field">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {t.translate.glossary.sourceTerm} <span style={{ color: 'var(--accent-red)' }}>*</span>
                    {entry.isRecommended && (
                        <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--accent-green, #28a745)', color: '#fff', padding: '2px 6px', borderRadius: '4px', textTransform: 'none' }}>
                            <i className="fas fa-sparkles"></i> {t.translate.glossary.aiSuggested}
                        </span>
                    )}
                    {isDuplicate && (
                        <span style={{ color: 'var(--accent-red, #dc3545)', fontWeight: 'bold', fontSize: '0.65rem', textTransform: 'none' }}>
                            <i className="fas fa-exclamation-triangle"></i> {t.translate.glossary.duplicate}
                        </span>
                    )}
                </label>
                <textarea
                    ref={resizeTextarea} className="sub-source" rows={1} placeholder={t.translate.glossary.sourcePlaceholder}
                    value={entry.source} onChange={(e) => handleUpdateEntry(index, 'source', e.target.value)} required
                />
            </div>

            <div className="sub-field">
                <label>{t.translate.glossary.targetTranslation} <span style={{ color: 'var(--accent-red)' }}>*</span></label>
                <textarea
                    ref={resizeTextarea} className="sub-translated" rows={1} placeholder={t.translate.glossary.targetPlaceholder}
                    value={entry.target} onChange={(e) => handleUpdateEntry(index, 'target', e.target.value)} required
                />
            </div>

            <div className="sub-field">
                <label>{t.translate.glossary.detailContext} <span style={{ color: 'var(--text-muted)', textTransform: 'none', fontWeight: 'normal' }}>({t.translate.glossary.optional})</span></label>
                <textarea
                    ref={resizeTextarea} className="sub-detail" rows={1} placeholder={t.translate.glossary.detailPlaceholder}
                    value={entry.detail || ''} onChange={(e) => handleUpdateEntry(index, 'detail', e.target.value)}
                />
            </div>

            <div className="sub-actions">
                <button type="button" className="btn-add-line" onClick={() => handleAddEntry(index)} title={t.translate.glossary.addEntry}><i className="fas fa-plus-circle" /></button>
                <button type="button" className="btn-del-line" onClick={() => handleDeleteEntry(index)} title={t.translate.glossary.deleteEntry}><i className="fas fa-trash-alt" /></button>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Hanya render ulang baris ini jika datanya benar-benar berubah
    return (
        prevProps.entry === nextProps.entry &&
        prevProps.isDuplicate === nextProps.isDuplicate &&
        prevProps.index === nextProps.index &&
        prevProps.t === nextProps.t
    );
});


// ================= KOMPONEN UTAMA =================
export default function GlossaryRecommendationClient() {
    const router = useRouter();
    const { showAlert } = useAlert();
    const { t } = useLanguage();

    // --- State untuk Load Data ---
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [translationId, setTranslationId] = useState<number | null>(null);
    const [sourceLang, setSourceLang] = useState<string>('en');
    const [targetLang, setTargetLang] = useState<string>('id');
    const [existingGlossaryId, setExistingGlossaryId] = useState<number | null>(null);

    // --- State untuk Form Editor ---
    const [glossaryInfo, setGlossaryInfo] = useState<GlosaryInfo>({ name: '', sourceLanguage: 'en', targetLanguage: 'id' });
    const [entries, setEntries] = useState<GlosaryEntry[]>([]);
    const [initialEntries, setInitialEntries] = useState<GlosaryEntry[]>([]);
    const [lastSavedEntries, setLastSavedEntries] = useState<GlosaryEntry[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // --- State untuk Floating Button ---
    const [isSaveVisible, setIsSaveVisible] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);
    const nextTempId = useRef(-1);

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

    // 1. Ambil data dari sessionStorage
    useEffect(() => {
        const savedData = sessionStorage.getItem('tempGlossary');

        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                const tId = parsedData.translationId;

                if (!tId) throw new Error("translationId is missing in payload");

                const recommendations = parsedData.recommendations || [];
                if (recommendations.length === 0) {
                    showAlert(t.translate.glossary.alertNoRecommendation, 'error');
                    router.push('/translate');
                    return;
                }

                setTranslationId(tId);

                let oldEntries: GlosaryEntry[] = [];
                if (parsedData.glosary?.id) {
                    setExistingGlossaryId(parsedData.glosary.id);
                    setGlossaryInfo({
                        id: parsedData.glosary.id,
                        name: parsedData.glosary.name,
                        sourceLanguage: parsedData.glosary.sourceLanguage,
                        targetLanguage: parsedData.glosary.targetLanguage,
                    });
                    oldEntries = (parsedData.glosary?.entries || []).map((e: any) => ({ ...e, isRecommended: false }));
                }

                setSourceLang(parsedData.sourceLang || 'en');
                setTargetLang(parsedData.targetLang || 'id');

                const newEntries = recommendations.map((e: any) => ({
                    ...e,
                    id: nextTempId.current--,
                    isRecommended: true
                }));

                const combinedEntries = [...newEntries, ...oldEntries];

                setEntries([...newEntries, ...oldEntries]);
                setInitialEntries(combinedEntries);
                setLastSavedEntries(oldEntries);
                setIsLoadingData(false);

            } catch (error) {
                console.error("Gagal mem-parsing data dari sessionStorage", error);
                showAlert(t.translate.glossary.alertInvalidFormat, 'error');
                router.push('/translate');
            }
        } else {
            showAlert(t.translate.glossary.alertNoRecommendation, 'error');
            router.push('/translate');
        }
    }, [router, showAlert, t]);

    // 2. Fungsi Logika Form Editor
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

    // PENTING: resizeTextarea sekarang dibungkus useCallback agar tidak memicu re-render pada memo
    const resizeTextarea = useCallback((el: HTMLTextAreaElement | null) => {
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }, []);

    // 3. Fungsi Save/Submit
    const handleSave = async (e: React.FormEvent) => {
        if (e && e.preventDefault) e.preventDefault();

        const hasDuplicates = Object.values(sourceCounts).some(count => count > 1);
        if (hasDuplicates) {
            showAlert(t.translate.glossary.alertDuplicate, 'error');
            return;
        }

        setIsSaving(true);
        try {
            const creates = entries
                .filter(l => !l.id || l.id < 0)
                .map(({ id, source, target, detail }) => ({ id, source, target, detail }));

            const updates = entries
                .filter(l => {
                    if (!l.id || l.id < 0) return false;
                    const original = lastSavedEntries.find(old => old.id === l.id);
                    if (!original) return false;
                    return (
                        l.source !== original.source ||
                        l.target !== original.target ||
                        l.detail !== original.detail
                    );
                })
                .map(({ id, source, target, detail }) => ({ id, source, target, detail }));

            const deletes = lastSavedEntries
                .filter(old => old.id && !entries.some(l => l.id === old.id))
                .map(old => old.id as number);

            if (existingGlossaryId && creates.length === 0 && updates.length === 0 && deletes.length === 0) {
                showAlert(t.translate.glossary.alertNoChanges, 'info');
                setIsSaving(false);
                return;
            }

            const payload = {
                translationId: translationId!,
                glosaryId: glossaryInfo.id,
                name: glossaryInfo.name,
                sourceLanguage: glossaryInfo.sourceLanguage,
                targetLanguage: glossaryInfo.targetLanguage,
                creates,
                updates,
                deletes
            };

            const response = await saveGlossaryAction(payload);

            if (!response.success) {
                showAlert(interpolate(t.translate.glossary.alertSaveFailed, { message: response.message }), 'error');
                return;
            }

            showAlert(response.message, 'success');
            sessionStorage.removeItem('tempGlossary');
            return router.push('/translate');

        } catch (error) {
            console.error(error);
            showAlert(t.translate.glossary.alertSaveError, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // --- Tampilan Loading ---
    if (isLoadingData) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-primary)' }}>
                <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px', fontSize: '1.5rem' }}></i>
                <p style={{ marginTop: '12px' }}>{t.translate.glossary.loadingData}</p>
            </div>
        );
    }

    // --- Tampilan Form Utama ---
    return (
        <>
            <div style={{ marginBottom: '20px' }}>
                <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                        if (window.confirm(t.translate.glossary.confirmBack)) {
                            router.push('/translate');
                        }
                    }}
                >
                    <i className="fas fa-arrow-left"></i> {t.translate.glossary.back}
                </button>
            </div>

            <section className="card">
                <div className="card-header">
                    <h2>
                        <i className="fas fa-magic" style={{ color: 'var(--accent)', marginRight: 10 }}></i>
                        {interpolate(t.translate.glossary.editorTitle, { id: translationId ?? '' })}
                    </h2>
                    <div className="card-actions">
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                                setEntries([...initialEntries]);
                                showAlert(t.translate.glossary.alertReverted, 'info');
                            }}>
                            <i className="fas fa-undo-alt"></i> {t.translate.glossary.reset}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSave}>
                    {!existingGlossaryId ? (
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--text-primary)' }}>
                                <i className="fas fa-book-medical" style={{ marginRight: 8, color: 'var(--accent-green)' }}></i>
                                {t.translate.glossary.createNew}
                            </h3>
                            <div className="form-row">
                                <div className="form-group" style={{ flex: '1 1 100%' }}>
                                    <label htmlFor="glossaryName">{t.translate.glossary.glossaryName} <span style={{ color: 'var(--accent-red)' }}>*</span></label>
                                    <input
                                        type="text" className="form-control" id="glossaryName" placeholder={t.translate.glossary.glossaryNamePlaceholder}
                                        value={glossaryInfo.name} onChange={(e) => setGlossaryInfo({ ...glossaryInfo, name: e.target.value })} required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="sourceLang">{t.translate.glossary.sourceLanguage} <span style={{ color: 'var(--accent-red)' }}>*</span></label>
                                    <input
                                        type="text" className="form-control" id="sourceLang"
                                        value={sourceLang} required disabled
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="targetLang">{t.translate.glossary.targetLanguage} <span style={{ color: 'var(--accent-red)' }}>*</span></label>
                                    <input
                                        type="text" className="form-control" id="targetLang"
                                        value={targetLang} required disabled
                                    />
                                </div>
                            </div>
                            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />
                        </div>
                    ) : (
                        <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '20px' }}>
                            <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                                <i className="fas fa-info-circle" style={{ color: 'var(--accent-blue)', marginRight: '8px' }}></i>
                                {t.translate.glossary.appendingTo} <strong>{glossaryInfo.name}</strong> ({glossaryInfo.sourceLanguage} → {glossaryInfo.targetLanguage})
                            </p>
                        </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '12px', display: 'block' }}>
                            {t.translate.glossary.entries}
                        </label>
                        <div id="GlosaryContainer">
                            {entries.map((entry, index) => {
                                const sourceVal = entry.source.trim().toLowerCase();
                                const isDuplicate = sourceVal !== '' && sourceCounts[sourceVal] > 1;

                                // Gunakan komponen yang di-memo di sini
                                return (
                                    <GlossaryRecommendationRow
                                        key={entry.id}
                                        entry={entry}
                                        index={index}
                                        isDuplicate={isDuplicate}
                                        t={t}
                                        handleUpdateEntry={handleUpdateEntry}
                                        handleAddEntry={handleAddEntry}
                                        handleDeleteEntry={handleDeleteEntry}
                                        resizeTextarea={resizeTextarea}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <div ref={saveContainerRef} style={{ marginTop: '30px' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>{' '}
                            {isSaving ? t.translate.glossary.savingGlossary : t.translate.glossary.confirmSave}
                        </button>
                    </div>
                </form>
            </section>

            {/* FLOATING SAVE BUTTON */}
            {!isSaveVisible && (
                <button
                    className="btn btn-primary"
                    onClick={(e) => handleSave(e as any)}
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
                    {isSaving ? t.translate.glossary.savingGlossary : t.translate.glossary.confirmSaveShort}
                </button>
            )}
        </>
    );
}