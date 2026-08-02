'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAlert } from '../../ui/Alert';
import SelectSearch from './SelectSearch';
import { createAction } from '@/app/actions/translate/createAction';
import { redirect } from 'next/navigation';

interface AiModelOption {
  value: string;
  label: string;
}

const modelOptions: AiModelOption[] = [
  { value: 'deepseek', label: 'Deepseek' },
  { value: 'GPT-4 Turbo', label: 'GPT-4 Turbo' },
  { value: 'Claude 3.5 Sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'Gemini Pro', label: 'Gemini Pro' },
  { value: 'LLaMA 3', label: 'LLaMA 3' },
];

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

export default function FormClient({ glosaries }: { glosaries: any[] }) {
  const { showAlert } = useAlert();

  const [fileName, setFileName] = useState('');
  const [model, setModel] = useState<string>('Claude 3.5 Sonnet');
  const [sourceLang, setSourceLang] = useState<string>('en');
  const [targetLang, setTargetLang] = useState<string>('id');
  const [srtContent, setSrtContent] = useState('');
  const [batchSize, setBatchSize] = useState<number>(25);
  const [glossaryId, setGlossaryId] = useState<string>(''); // Diubah ke string untuk SelectSearch

  // State untuk drag & drop
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // ===================== LOGIKA GLOSARIUM =====================
  // Filter glosarium berdasarkan Source dan Target (bisa bolak-balik)
  const filteredGlossaryOptions = useMemo(() => {
    if (!glosaries) return [{ value: '', label: '-- No Glossary Available --' }];
    
    const filtered = glosaries.filter((g) => 
      (g.sourceLanguage === sourceLang && g.targetLanguage === targetLang) ||
      (g.sourceLanguage === targetLang && g.targetLanguage === sourceLang)
    );

    // Format menjadi array of object untuk SelectSearch
    const options = filtered.map((g) => ({
      value: String(g.id),
      label: g.name
    }));

    if (options.length === 0) return [{ value: '', label: '-- No matching Glossary --' }];
    return [{ value: '', label: '-- Select Glosary --' }, ...options];
  }, [glosaries, sourceLang, targetLang]);

  // Reset pilihan glosarium jika kombinasi bahasa sumber/target berubah
  useEffect(() => {
    setGlossaryId('');
  }, [sourceLang, targetLang]);

  // ===================== HANDLER FILE =====================
  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['srt', 'ass', 'txt'].includes(ext || '')) {
        showAlert('Format file tidak didukung. Gunakan .srt, .ass, atau .txt', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showAlert('Ukuran file terlalu besar. Maksimal 10MB.', 'error');
        return;
      }

      setUploadedFile(file);
      // Isi nama job dari nama file (tanpa ekstensi)
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setFileName(nameWithoutExt);

      // Baca isi file sebagai teks
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setSrtContent(text);
      };
      reader.readAsText(file);
      showAlert(`File "${file.name}" berhasil diunggah`, 'success');
    },
    [showAlert]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName || !sourceLang || !targetLang || !srtContent) {
      showAlert('Harap isi semua field wajib', 'error');
      return;
    }

    const payload = {
      fileName,
      model,
      sourceLang,
      targetLang,
      srtContent,
      batchSize: batchSize || undefined,
      glossaryId: glossaryId !== '' ? Number(glossaryId) : undefined, 
    };

    const result = await createAction(payload);

    if (!result.success) {
      showAlert(result.message || 'Gagal membuat job.', 'error');
    } else {
      showAlert(result.message || 'Job terbuat sukses!', 'success');
      redirect('/translate');
    }
  };

  return (
    <section className="card">
      <div className="card-header">
        <h2>
          <i className="fas fa-pen-fancy" style={{ color: 'var(--accent)', marginRight: 10 }}></i>
          New Translation Job
        </h2>
        <div className="card-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setFileName('');
              setSrtContent('');
              setUploadedFile(null);
              setModel('Claude 3.5 Sonnet');
              setSourceLang('en');
              setTargetLang('id');
              setBatchSize(10);
              setGlossaryId('');
            }}
          >
            <i className="fas fa-undo-alt"></i> Reset
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fileName">Job Name</label>
            <input
              type="text"
              className="form-control"
              id="fileName"
              placeholder="e.g. Episode 12 - Subtitle"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="sourceLang">Source Language</label>
            <SelectSearch
              id="sourceLang"
              options={languageOptions}
              value={sourceLang}
              onChange={setSourceLang}
              placeholder="Select source language"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="targetLang">Target Language</label>
            <SelectSearch
              id="targetLang"
              options={languageOptions}
              value={targetLang}
              onChange={setTargetLang}
              placeholder="Select target language"
            />
          </div>
          <div className="form-group">
            <label htmlFor="model">LLM Model</label>
            <SelectSearch
              id="model"
              options={modelOptions}
              value={model}
              onChange={setModel}
              placeholder="Select LLM Model"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="batchSize">Batch Processing Size</label>
            <input
              type="number"
              className="form-control"
              id="batchSize"
              min={1}
              max={100}
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value) || 10)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="glossaryId">Glossary (Optional)</label>
            <SelectSearch
              id="glossaryId"
              options={filteredGlossaryOptions}
              value={glossaryId}
              onChange={setGlossaryId}
              placeholder={filteredGlossaryOptions.length > 1 ? "Pilih Glosarium..." : "Glosarium tidak tersedia"}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Subtitle Content (SRT)</label>

          {/* Drag & Drop Area */}
          <div
            className={`dropzone ${isDragOver ? 'dragover' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <div className="dz-icon">
              <i className="fas fa-cloud-upload-alt"></i>
            </div>
            <p>Drag & drop your .srt file here, or click to browse</p>
            <input
              type="file"
              id="fileInput"
              accept=".srt,.ass,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              style={{ display: 'none' }}
            />
            {uploadedFile && (
              <p style={{ marginTop: 8, fontSize: 12, color: 'var(--green)' }}>
                <i className="fas fa-check-circle"></i> {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Textarea untuk srtContent */}
          <textarea
            className="form-control"
            rows={6}
            placeholder="Atau tempel konten SRT di sini..."
            value={srtContent}
            onChange={(e) => setSrtContent(e.target.value)}
            style={{ marginTop: 12 }}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          <i className="fas fa-rocket"></i> Submit Job
        </button>
      </form>
    </section>
  );
}