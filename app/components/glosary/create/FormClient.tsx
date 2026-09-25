'use client';

import { useState } from 'react';
import { useAlert } from '../../ui/Alert';
import { redirect, useParams } from 'next/navigation';
import { createGlosaryAction } from '@/app/actions/glosary/createGlosaryAction';
import SelectSearch from '../../client/SelectSearch';
import { useLanguage } from '../../client/LanguageProvider';

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

export default function FormClient() {
    const { showAlert } = useAlert();
    const { t } = useLanguage();
    const params = useParams<{ locale: string }>();
    const locale = params?.locale ?? 'id';

    const [name, setName] = useState('');
    const [sourceLanguage, setSourceLang] = useState<string>('en');
    const [targetLanguage, setTargetLang] = useState<string>('id');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !sourceLanguage || !targetLanguage) {
            showAlert(t.glossary.alertRequired, 'error');
            return;
        }

        const payload = {
            name,
            sourceLanguage,
            targetLanguage,
        };

        const result = await createGlosaryAction(payload);

        console.log('Result from createGlosaryAction:', result);

        if (!result.success) {
            showAlert(result.message || t.glossary.alertCreateFailed, 'error');
        } else {
            showAlert(result.message || t.glossary.alertCreateSuccess, 'success');
            redirect(`/${locale}/glosary`);
        }
    };

    return (
        <section className="card">
            <div className="card-header">
                <h2>
                    <i className="fas fa-pen-fancy" style={{ color: 'var(--accent)', marginRight: 10 }}></i>
                    {t.glossary.createTitle}
                </h2>
                <div className="card-actions">
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                            setName('');
                            setSourceLang('en');
                            setTargetLang('id');
                        }}
                    >
                        <i className="fas fa-undo-alt"></i> {t.glossary.reset}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                    <div className="form-group ">
                        <label htmlFor="name">{t.glossary.name}</label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            placeholder={t.glossary.namePlaceholder}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="sourceLang">{t.glossary.sourceLanguage}</label>
                        <SelectSearch
                            id="sourceLang"
                            options={languageOptions}
                            value={sourceLanguage}
                            onChange={setSourceLang}
                            placeholder={t.glossary.selectSource}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="targetLang">{t.glossary.targetLanguage}</label>
                        <SelectSearch
                            id="targetLang"
                            options={languageOptions}
                            value={targetLanguage}
                            onChange={setTargetLang}
                            placeholder={t.glossary.selectTarget}
                        />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary">
                    <i className="fas fa-paper-plane"></i> {t.glossary.submit}
                </button>
            </form>
        </section>
    );
}