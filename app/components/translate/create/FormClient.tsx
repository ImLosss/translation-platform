'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAlert } from '../../ui/Alert';
import { createAction } from '@/app/actions/translate/createAction';
import { redirect, useParams } from 'next/navigation';
import SelectSearch from '../../client/SelectSearch';
import { createFromUrlAction } from '@/app/actions/translate/createFromUrlAction';
import { AiModelOption } from '@/app/[locale]/(panel)/translate/create/page';
import { useLanguage } from '../../client/LanguageProvider';
import { interpolate } from '@/app/lib/i18n/format';


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
  const { t } = useLanguage();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'id';

  const [fileName, setFileName] = useState('');
  const [model, setModel] = useState<string>('');
  const [sourceLang, setSourceLang] = useState<string>('en');
  const [targetLang, setTargetLang] = useState<string>('id');
  const [batchSize, setBatchSize] = useState<number | string>(25);
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
    if (!glosaries) return [{ value: '', label: t.translate.create.noGlossaryAvailable }];
    
    const filtered = glosaries.filter((g) => 
      (g.sourceLanguage === sourceLang && g.targetLanguage === targetLang) ||
      (g.sourceLanguage === targetLang && g.targetLanguage === sourceLang)
    );

    const options = filtered.map((g) => ({
      value: String(g.id),
      label: g.name
    }));

    if (options.length === 0) return [{ value: '', label: t.translate.create.noMatchingGlossary }];
    return [{ value: '', label: t.translate.create.selectGlossary }, ...options];
  }, [glosaries, sourceLang, targetLang, t]);

  useEffect(() => {
    setGlossaryId('');
  }, [sourceLang, targetLang]);

  // ===================== HANDLER FILE =====================
  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['srt'].includes(ext || '')) {
        showAlert(t.translate.create.alertUnsupportedFormat, 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showAlert(t.translate.create.alertFileTooLarge, 'error');
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
      showAlert(interpolate(t.translate.create.alertFileUploaded, { name: file.name }), 'success');
    },
    [showAlert, t]
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
      showAlert(t.translate.create.alertValidation, 'error');
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
      showAlert(result.message || t.translate.create.alertCreateFailed, 'error');
    } else {
      showAlert(result.message || t.translate.create.alertCreateSuccess, 'success');
      redirect(`/${locale}/translate`);
    }
  };

  return (
    <section className="card">
      <div className="card-header">
        <h2>
          <i className="fas fa-pen-fancy" style={{ color: 'var(--accent)', marginRight: 10 }}></i>
          {t.translate.create.title}
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
            <i className="fas fa-undo-alt"></i> {t.translate.create.reset}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fileName">{t.translate.create.jobName}</label>
            <input
              type="text"
              className="form-control"
              id="fileName"
              placeholder={t.translate.create.jobNamePlaceholder}
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="sourceLang">{t.translate.create.sourceLanguage}</label>
            <SelectSearch
              id="sourceLang"
              options={languageOptions}
              value={sourceLang}
              onChange={setSourceLang}
              placeholder={t.translate.create.selectSource}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="targetLang">{t.translate.create.targetLanguage}</label>
            <SelectSearch
              id="targetLang"
              options={languageOptions}
              value={targetLang}
              onChange={setTargetLang}
              placeholder={t.translate.create.selectTarget}
            />
          </div>
          <div className="form-group">
            <label htmlFor="model">{t.translate.create.llmModel}</label>
            <SelectSearch
              id="model"
              options={aiModels}
              value={model}
              onChange={setModel}
              placeholder={t.translate.create.selectModel}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="batchSize">{t.translate.create.batchSize}</label>
            <input
              type="number"
              className="form-control"
              id="batchSize"
              value={batchSize}
              onChange={(e) => setBatchSize(e.target.value === '' ? '' : parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="glossaryId">{t.translate.create.glossaryOptional}</label>
            <SelectSearch
              id="glossaryId"
              options={filteredGlossaryOptions}
              value={glossaryId}
              onChange={setGlossaryId}
              placeholder={filteredGlossaryOptions.length > 1 ? t.translate.create.selectGlossary : t.translate.create.glossaryUnavailable}
            />
          </div>
        </div>

        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

        {/* ================= PILIHAN METODE INPUT ================= */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{t.translate.create.subtitleSourceMethod}</label>
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="inputMethod" 
                value="file" 
                checked={inputMethod === 'file'} 
                onChange={() => setInputMethod('file')} 
              />
              <span>{t.translate.create.uploadPasteSrt}</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="inputMethod" 
                value="video" 
                checked={inputMethod === 'video'} 
                onChange={() => setInputMethod('video')} 
              />
              <span>{t.translate.create.extractFromVideo}</span>
            </label>
          </div>
        </div>

        {/* ================= SELALU TAMPILKAN VIDEO URL (Dinamis Required/Opsional) ================= */}
        <div className="form-group" style={{ backgroundColor: 'var(--bg-input)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <label htmlFor="videoUrl">
            {t.translate.create.driveUrl}{' '}
            {inputMethod === 'file' ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85em', marginLeft: 6 }}>{t.translate.create.optional}</span>
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
            <i className="fas fa-info-circle"></i> {t.translate.create.driveUrlHint}<strong>{t.translate.create.driveUrlHintPublic}</strong>.
          </small>
        </div>

        {/* ================= HANYA TAMPILKAN SRT INPUT JIKA METODE = FILE ================= */}
        {inputMethod === 'file' && (
          <div className="form-group">
            <label>{t.translate.create.subtitleContent} <span style={{ color: 'var(--accent-red)' }}>*</span></label>
            
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
              <p>{t.translate.create.dropzoneText}</p>
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
              placeholder={t.translate.create.pasteSrtPlaceholder}
              value={srtContent}
              onChange={(e) => setSrtContent(e.target.value)}
              style={{ marginTop: 12, resize: 'vertical' }}
            />
          </div>
        )}

        <div style={{ marginTop: '30px' }}>
          <button type="submit" className="btn btn-primary">
            <i className="fas fa-rocket"></i> {t.translate.create.submitJob}
          </button>
        </div>
      </form>
    </section>
  );
}