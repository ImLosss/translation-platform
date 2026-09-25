'use client';

import { translateDocumentAction } from '@/app/actions/translate-doc/translateDocument';
import { useCallback, useRef, useState } from 'react';

export default function TranslationDoc() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidFile = useCallback((file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['docx'].includes(ext || '')) {
      setError('Format file tidak didukung. Gunakan .docx');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran file terlalu besar. Maksimal 10MB.');
      return false;
    }
    return true;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      setDownloadUrl(null);
      if (isValidFile(file)) {
        setUploadedFile(file);
      } else {
        setUploadedFile(null);
      }
    },
    [isValidFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleTranslate = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const result = await translateDocumentAction(formData);

      // Konversi base64 ke Blob
      const byteCharacters = atob(result.fileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.mimeType });

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses file.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="card">
      <div className="card-header">
        <h2>
          <i
            className="fas fa-file-word"
            style={{ color: 'var(--accent)', marginRight: '10px' }}
          ></i>
          Translate Word Document (.docx)
        </h2>
      </div>

      <div className="form-group">
        <label>Upload Dokumen</label>

        <div
          className={`dropzone ${isDragOver ? 'dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="dz-icon">
            <i className="fas fa-file-upload"></i>
          </div>
          <p>Seret & letakkan file .docx di sini, atau klik untuk memilih</p>
          <input
            type="file"
            ref={fileInputRef}
            // accept=".docx"
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />
          {uploadedFile && (
            <p style={{ marginTop: 8, fontSize: 12, color: 'var(--green)' }}>
              <i className="fas fa-check-circle"></i> {uploadedFile.name} (
              {(uploadedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {error && (
          <p style={{ marginTop: 8, color: 'var(--red)', fontSize: 13 }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </p>
        )}
      </div>

      <div className="card-actions" style={{ marginTop: 12 }}>
        <button
          className="btn btn-primary"
          onClick={handleTranslate}
          disabled={!uploadedFile || isProcessing}
        >
          {isProcessing ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Menerjemahkan...
            </>
          ) : (
            <>
              <i className="fas fa-language"></i> Terjemahkan
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            className="btn btn-success"
            href={downloadUrl}
            download={uploadedFile?.name.replace(/\.[^/.]+$/, '') + '_translated.docx'}
            style={{ marginLeft: 8 }}
          >
            <i className="fas fa-download"></i> Unduh Hasil Terjemahan
          </a>
        )}
      </div>
    </section>
  );
}