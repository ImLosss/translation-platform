'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GlossaryRecommendationEditor, { GlosaryEntry, GlosaryInfo } from '@/app/components/translate/GlossaryRecommendationEditor';
import { useAlert } from '@/app/components/ui/Alert';
import './generate-glosary.css'; 

export default function GenerateGlossaryPage() {
    const router = useRouter();
    const { showAlert } = useAlert(); 

    const [glossaryData, setGlossaryData] = useState<{
        translationId: number;
        glossary: GlosaryInfo | null;
        existingEntries: GlosaryEntry[];
        recommendations: GlosaryEntry[];
    } | null>(null);

    useEffect(() => {
        const savedData = sessionStorage.getItem('tempGlossary');

        console.log("Loaded tempGlossary from sessionStorage:", savedData);
        
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                
                const tId = parsedData.translationId;

                const existingGlossary = parsedData.glosary ? {
                    id: parsedData.glosary.id,
                    name: parsedData.glosary.name,
                    sourceLanguage: parsedData.glosary.sourceLanguage,
                    targetLanguage: parsedData.glosary.targetLanguage,
                } : null;

                const existingEntries = parsedData.glosary?.entries || [];
                const recommendations = parsedData.recommendations || [];

                if (recommendations.length === 0) {
                    showAlert('No recommendation data available.', 'error');
                    return router.push('/translate');;
                }

                setGlossaryData({
                    translationId: tId,
                    glossary: existingGlossary,
                    existingEntries: existingEntries,
                    recommendations: recommendations
                });

            } catch (error) {
                console.error("Gagal mem-parsing data dari sessionStorage", error);
                
                // --- PERBAIKAN DI SINI ---
                showAlert('Format data rekomendasi tidak valid.', 'error');
                return router.push('/translate');
            }
        } else {
            // --- PERBAIKAN DI SINI ---
            showAlert('No recommendation data available.', 'error');
            return router.push('/translate');
        }
        
        // Hapus dependensi kosong jika linter Next.js meminta showAlert & router dimasukkan, 
        // tapi biarkan [] agar hanya dijalankan sekali saat mount.
    }, [router, showAlert]); 
            
    const handleSaveGlossary = async (glossaryInfo: GlosaryInfo, entries: GlosaryEntry[]) => {
        try {
            const cleanEntries = entries.map(({ source, target, detail }) => ({
                source, target, detail
            }));

            if (glossaryInfo.id) {
                console.log('UPDATE existing glossary ID:', glossaryInfo.id);
                console.log('Payload:', cleanEntries);
                // await updateGlossaryAction(glossaryInfo.id, cleanEntries);
            } else {
                console.log('CREATE new glossary for translation:', glossaryData?.translationId);
                console.log('Glossary Info:', glossaryInfo);
                console.log('Payload:', cleanEntries);
                // await createGlossaryAction({ translationId: glossaryData?.translationId, ...glossaryInfo, entries: cleanEntries });
            }

            showAlert('Data glosarium berhasil disimpan!', 'success');
            router.push('/admin'); 
            
        } catch (error) {
            console.error(error);
            showAlert('Gagal menyimpan glosarium', 'error');
        }
    };

    // --- HAPUS BLOK if(isError) DI SINI ---

    if (!glossaryData) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-primary)' }}>
                <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px', fontSize: '1.5rem' }}></i>
                <p style={{ marginTop: '12px' }}>Memuat data rekomendasi...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>

            <GlossaryRecommendationEditor 
                existingGlossary={glossaryData.glossary}
                existingEntries={glossaryData.existingEntries}
                recommendations={glossaryData.recommendations}
                onSave={handleSaveGlossary}
            />
        </div>
    );
}