'use client';

import { useState, useRef } from 'react';
import { useLanguage } from '../client/LanguageProvider';
import { interpolate } from '@/app/lib/i18n/format';

export default function Dropzone() {
  const { t } = useLanguage();
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['srt', 'ass', 'txt'];
    if (!ext || !allowed.includes(ext)) {
      alert(t.translate.dropzone.alertUnsupported);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(t.translate.dropzone.alertTooLarge);
      return;
    }
    setFile(file);
    alert(interpolate(t.translate.dropzone.alertUploaded, { name: file.name, size: (file.size / 1024).toFixed(1) }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
      // Reset input agar bisa mengunggah file yang sama lagi
      e.target.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="card">
      <div className="card-header">
        <h2>
          <i className="fas fa-upload" style={{ color: 'var(--accent)', marginRight: '10px' }}></i>
          {t.translate.dropzone.title}
        </h2>
      </div>
      <div
        className={`dropzone ${isDragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <div className="dz-icon">
          <i className="fas fa-cloud-upload-alt"></i>
        </div>
        <p>{t.translate.dropzone.dragDrop}</p>
        <label className="browse-btn" htmlFor="fileInput" onClick={(e) => e.stopPropagation()}>
          {t.translate.dropzone.browseFiles}
        </label>
        <input
          ref={fileInputRef}
          type="file"
          id="fileInput"
          accept=".srt,.ass,.txt"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
          {t.translate.dropzone.supported}
        </p>
      </div>
      {file && (
        <div style={{ marginTop: '12px', color: 'var(--green)', fontSize: '13px' }}>
          <i className="fas fa-check-circle"></i> {t.translate.dropzone.lastUploaded} {file.name}
        </div>
      )}
    </section>
  );
}