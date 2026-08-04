'use client';

import { useState } from 'react';
import { useAlert } from '../../ui/Alert';
import { redirect } from 'next/navigation';
import { createGlosaryAction } from '@/app/actions/glosary/createGlosaryAction';
import SelectSearch from '../../client/SelectSearch';

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

    const [name, setName] = useState('');
    const [sourceLanguage, setSourceLang] = useState<string>('en');
    const [targetLanguage, setTargetLang] = useState<string>('id');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !sourceLanguage || !targetLanguage) {
            showAlert('Harap isi semua field wajib', 'error');
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
            showAlert(result.message || 'Error creating glosary.', 'error');
        } else {
            showAlert(result.message || 'Glosary created successfully!', 'success');
            redirect('/glosary');
        }
    };

    return (
        <section className="card">
            <div className="card-header">
                <h2>
                    <i className="fas fa-pen-fancy" style={{ color: 'var(--accent)', marginRight: 10 }}></i>
                    New Glosary
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
                        <i className="fas fa-undo-alt"></i> Reset
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                    <div className="form-group ">
                        <label htmlFor="name">Glosary Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            placeholder="e.g. Universal"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="sourceLang">Source Language</label>
                        <SelectSearch
                            id="sourceLang"
                            options={languageOptions}
                            value={sourceLanguage}
                            onChange={setSourceLang}
                            placeholder="Select source language"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="targetLang">Target Language</label>
                        <SelectSearch
                            id="targetLang"
                            options={languageOptions}
                            value={targetLanguage}
                            onChange={setTargetLang}
                            placeholder="Select target language"
                        />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary">
                    <i className="fas fa-paper-plane"></i> Submit
                </button>
            </form>
        </section>
    );
}