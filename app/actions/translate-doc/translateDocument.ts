'use server';

import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export async function translateDocumentAction(formData: FormData) {
  const file = formData.get('file') as File | null;

  if (!file) {
    throw new Error('Tidak ada file yang diunggah.');
  }

  // Validasi ekstensi
  const allowed = ['docx'];
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!allowed.includes(ext)) {
    throw new Error('Format file tidak didukung. Gunakan .docx');
  }

  // Validasi ukuran maks 10MB
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Ukuran file terlalu besar. Maksimal 10MB.');
  }

  // Baca file menjadi buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Ekstrak teks dari DOCX menggunakan mammoth
  const { value: extractedText } = await mammoth.extractRawText({ buffer });

  // ==================================================
  // SIMULASI PROSES TERJEMAHAN
  // Di sini Anda dapat memanggil API penerjemah sungguhan.
  // Untuk demo, setiap baris teks ditambahkan "[ID]" di depannya.
  // ==================================================
  const lines = extractedText.split('\n').filter((line) => line.trim() !== '');
  const translatedLines = lines.map((line) => `[ID] ${line}`);

  // Buat dokumen DOCX baru dengan teks terjemahan
  const doc = new Document({
    sections: [
      {
        children: translatedLines.map(
          (line) =>
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  font: 'Arial',
                  size: 22, // 11pt
                }),
              ],
            })
        ),
      },
    ],
  });

  // Serialisasi dokumen ke buffer
  const translatedBuffer = await Packer.toBuffer(doc);

  // Encode ke base64
  const base64 = translatedBuffer.toString('base64');

  const originalName = file.name.replace(/\.[^/.]+$/, '');
  const newFileName = `${originalName}_translated.docx`;

  return {
    success: true,
    fileName: newFileName,
    fileData: base64,
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
}