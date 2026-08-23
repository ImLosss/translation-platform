'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAlert } from '../../ui/Alert';
import { createAction } from '@/app/actions/translate/createAction';
import { redirect } from 'next/navigation';
import SelectSearch from '../../client/SelectSearch';
import { createFromUrlAction } from '@/app/actions/translate/createFromUrlAction';
import { AiModelOption } from '@/app/(panel)/translate/create/page';


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

export default function FormClient({ glosaries, aiModels }: { glosaries: any[]; aiModels: AiModelOption[] }) {
  const { showAlert } = useAlert();

  const [fileName, setFileName] = useState('');
  const [model, setModel] = useState<string>('');
  const [sourceLang, setSourceLang] = useState<string>('en');
  const [targetLang, setTargetLang] = useState<string>('id');
  const [batchSize, setBatchSize] = useState<number>(25);
  const [glossaryId, setGlossaryId] = useState<string>(''); 
  
  // State untuk Opsi Input
  const [inputMethod, setInputMethod] = useState<'file' | 'video'>('file');
  const [srtContent, setSrtContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // State untuk drag & drop
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // ===================== LOGIKA GLOSARIUM =====================
  const filteredGlossaryOptions = useMemo(() => {
    if (!glosaries) return [{ value: '', label: '-- No Glossary Available --' }];
    
    const filtered = glosaries.filter((g) => 
      (g.sourceLanguage === sourceLang && g.targetLanguage === targetLang) ||
      (g.sourceLanguage === targetLang && g.targetLanguage === sourceLang)
    );

    const options = filtered.map((g) => ({
      value: String(g.id),
      label: g.name
    }));

    if (options.length === 0) return [{ value: '', label: '-- No matching Glossary --' }];
    return [{ value: '', label: '-- Select Glosary --' }, ...options];
  }, [glosaries, sourceLang, targetLang]);

  useEffect(() => {
    setGlossaryId('');
  }, [sourceLang, targetLang]);

  // ===================== HANDLER FILE =====================
  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['srt'].includes(ext || '')) {
        showAlert('Unsupported file format. Please upload an .srt file.', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showAlert('File size too large. Maximum 10MB.', 'error');
        return;
      }

      setUploadedFile(file);
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setFileName(nameWithoutExt);

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

  // ===================== SUBMIT HANDLER =====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi Umum
    if (!fileName || !sourceLang || !targetLang) {
      showAlert('Harap isi Nama Job, Source, dan Target Language', 'error');
      return;
    }

    // Susun Payload
    const payload: any = {
      fileName,
      providerId: model,
      sourceLang,
      targetLang,
      batchSize: batchSize || undefined,
      glossaryId: glossaryId !== '' ? Number(glossaryId) : undefined,
      videoSource: videoUrl || undefined, // Selalu kirim jika ada isinya
    };

    let result;
    if (inputMethod === 'file') {
      payload.srtContent = srtContent;
      result = await createAction(payload);
    } else result = await createFromUrlAction(payload);

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
              setVideoUrl('');
              setUploadedFile(null);
              setModel('');
              setSourceLang('en');
              setTargetLang('id');
              setBatchSize(25);
              setGlossaryId('');
              setInputMethod('file');
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
              options={aiModels}
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

        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

        {/* ================= PILIHAN METODE INPUT ================= */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Subtitle Source Method</label>
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="inputMethod" 
                value="file" 
                checked={inputMethod === 'file'} 
                onChange={() => setInputMethod('file')} 
              />
              <span>Upload / Paste SRT</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="inputMethod" 
                value="video" 
                checked={inputMethod === 'video'} 
                onChange={() => setInputMethod('video')} 
              />
              <span>Extract from Video</span>
            </label>
          </div>
        </div>

        {/* ================= SELALU TAMPILKAN VIDEO URL (Dinamis Required/Opsional) ================= */}
        <div className="form-group" style={{ backgroundColor: 'var(--bg-input)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <label htmlFor="videoUrl">
            Google Drive Video URL 
            {inputMethod === 'file' ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85em', marginLeft: 6 }}>(Optional)</span>
            ) : (
              <span style={{ color: 'var(--accent-red)', marginLeft: 4 }}>*</span>
            )}
          </label>
          <input
            type="url"
            className="form-control"
            id="videoUrl"
            placeholder="https://drive.google.com/file/d/.../view"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            style={{ marginTop: '8px' }}
          />
          <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '8px' }}>
            <i className="fas fa-info-circle"></i> Pastikan akses link video Google Drive diatur menjadi <strong>"Anyone with the link" (Publik)</strong>.
          </small>
        </div>

        {/* ================= HANYA TAMPILKAN SRT INPUT JIKA METODE = FILE ================= */}
        {inputMethod === 'file' && (
          <div className="form-group">
            <label>Subtitle Content (SRT) <span style={{ color: 'var(--accent-red)' }}>*</span></label>
            
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
                // accept=".srt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
                style={{ display: 'none' }}
              />
              {uploadedFile && (
                <p style={{ marginTop: 8, fontSize: 12, color: 'var(--accent-green)' }}>
                  <i className="fas fa-check-circle"></i> {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <textarea
              className="form-control"
              rows={6}
              placeholder="Atau tempel konten SRT di sini..."
              value={srtContent}
              onChange={(e) => setSrtContent(e.target.value)}
              style={{ marginTop: 12, resize: 'vertical' }}
            />
          </div>
        )}

        <div style={{ marginTop: '30px' }}>
          <button type="submit" className="btn btn-primary">
            <i className="fas fa-rocket"></i> Submit Job
          </button>
        </div>
      </form>
    </section>
  );
}