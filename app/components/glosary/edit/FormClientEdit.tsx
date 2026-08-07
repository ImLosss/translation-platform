'use client';

import { useState } from 'react';
import { useAlert } from '../../ui/Alert';
import { redirect } from 'next/navigation';
import { updateGlosaryAction } from '@/app/actions/glosary/updateGlosaryAction'; // Pastikan action ini dibuat
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

export interface GlosaryData {
    id: string | number;
    name: string;
    sourceLanguage: string;
    targetLanguage: string;
}

export default function FormClientEdit({ initialData }: { initialData: GlosaryData }) {
    const { showAlert } = useAlert();

    const [name, setName] = useState(initialData.name);
    const [sourceLanguage, setSourceLang] = useState<string>(initialData.sourceLanguage);
    const [targetLanguage, setTargetLang] = useState<string>(initialData.targetLanguage);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !sourceLanguage || !targetLanguage) {
            showAlert('Harap isi semua field wajib', 'error');
            return;
        }

        const payload = {
            id: initialData.id,
            name,
            sourceLanguage,
            targetLanguage,
        };

        const result = await updateGlosaryAction(payload);

        console.log('Result from updateGlosaryAction:', result);

        if (!result.success) {
            showAlert(result.message || 'Error updating glosary.', 'error');
        } else {
            showAlert(result.message || 'Glosary updated successfully!', 'success');
            redirect('/glosary');
        }
    };

    const handleReset = () => {
        // Mengembalikan form ke data semula (dari database)
        setName(initialData.name);
        setSourceLang(initialData.sourceLanguage);
        setTargetLang(initialData.targetLanguage);
    };

    return (
        <section className="card">
            <div className="card-header">
                <h2>
                    <i className="fas fa-edit" style={{ color: 'var(--accent)', marginRight: 10 }}></i>
                    Edit Glosary
                </h2>
                <div className="card-actions">
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handleReset}
                    >
                        <i className="fas fa-undo-alt"></i> Reset
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
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
                    <i className="fas fa-save"></i> Save Changes
                </button>
            </form>
        </section>
    );
}