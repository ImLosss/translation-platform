'use client';

import { useState, useRef } from 'react';

export default function Dropzone() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['srt', 'ass', 'txt'];
    if (!ext || !allowed.includes(ext)) {
      alert('Unsupported file format. Please upload .srt, .ass, or .txt.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Max 10MB.');
      return;
    }
    setFile(file);
    alert(`File "${file.name}" uploaded successfully! (${(file.size / 1024).toFixed(1)} KB)`);
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
          Upload Subtitle File
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
        <p>Drag &amp; drop your .srt or .ass file here, or</p>
        <label className="browse-btn" htmlFor="fileInput" onClick={(e) => e.stopPropagation()}>
          Browse Files
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
          Supported: SRT, ASS, TXT (max 10MB)
        </p>
      </div>
      {file && (
        <div style={{ marginTop: '12px', color: 'var(--green)', fontSize: '13px' }}>
          <i className="fas fa-check-circle"></i> Last uploaded: {file.name}
        </div>
      )}
    </section>
  );
}