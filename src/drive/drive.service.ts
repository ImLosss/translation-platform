import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';

@Injectable()
export class DriveService {
  private readonly logger = new Logger(DriveService.name);
  private driveClient: drive_v3.Drive;

  constructor() {
    // Setup OAuth2 persis seperti referensi (pastikan credentials ada di environment)
    const oauth2Client = new google.auth.OAuth2(
      process.env.GDRIVE_CLIENT_ID,
      process.env.GDRIVE_CLIENT_SECRET,
      process.env.GDRIVE_REDIRECT_URI,
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GDRIVE_REFRESH_TOKEN,
    });

    this.driveClient = google.drive({
      version: 'v3',
      auth: oauth2Client,
    });
  }

  /**
   * Ekstrak file ID dari link Google Drive
   */
  private extractFileIdFromUrlDrive(url: string): string | null {
    const regex1 = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const regex2 = /id=([a-zA-Z0-9_-]+)/;
    
    let match = url.match(regex1);
    if (match && match[1]) return match[1];
    
    match = url.match(regex2);
    if (match && match[1]) return match[1];
    
    return null;
  }

  /**
   * Mengunduh Video dari Google Drive dengan Error Handling Ekstensif
   */
  async downloadVideoPublic(link: string): Promise<{ status: boolean; path: string; name: string }> {
    // 1. Validasi URL
    const fileId = this.extractFileIdFromUrlDrive(link);
    if (!fileId) {
      throw new BadRequestException('Link Google Drive tidak valid.');
    }

    let meta: drive_v3.Schema$File;
    
    // 2. Ambil Metadata & Cek Akses (Apakah Public?)
    try {
      const metaRes = await this.driveClient.files.get({
        fileId,
        fields: 'name,mimeType,size',
      });
      meta = metaRes.data;
    } catch (err) {
      this.logger.error(`Error mengambil metadata: ${err.message}`);
      
      // Error handling jika file tidak public atau terhapus
      if (err.code === 403 || err.code === 404 || err.message.includes('insufficient')) {
        throw new BadRequestException('File tidak ditemukan atau URL tidak diset publik (Anyone with the link).');
      }
      throw new InternalServerErrorException('Gagal mengakses file di Google Drive.');
    }

    const originalName = meta.name || `file_drive_${fileId}`;
    const mimeType = meta.mimeType;

    // 3. Validasi Tipe File (Apakah Video?)
    if (!mimeType || !mimeType.startsWith('video/')) {
      throw new BadRequestException(`File ini bukan video. (Format terdeteksi: ${mimeType})`);
    }

    // 4. Siapkan Path Destinasi Download
    let ext = path.extname(originalName);
    if (!ext && mimeType) {
      const guessed = mime.extension(mimeType);
      if (guessed) ext = `.${guessed}`;
    }
    if (!ext) ext = '.mp4'; // Fallback

    // Pastikan folder downloads ada
    const downloadDir = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    // Hindari nama file bentrok dengan ID random tambahan
    const uniqueId = Math.random().toString(36).substring(2, 8);
    const destPath = path.join(downloadDir, `${uniqueId}_${originalName}`);
    const dest = fs.createWriteStream(destPath);

    // 5. Eksekusi Download Stream
    try {
      const res = await this.driveClient.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );

      return await new Promise((resolve, reject) => {
        res.data
          .on('error', (err) => {
            this.logger.error(`Error pada stream dari Drive: ${err.message}`);
            reject(new InternalServerErrorException('Terjadi kesalahan saat mengunduh data stream.'));
          })
          .pipe(dest);

        dest.on('finish', () => {
          resolve({
            status: true,
            path: destPath,
            name: originalName,
          });
        });

        dest.on('error', (err) => {
          this.logger.error(`Error saat menyimpan file lokal: ${err.message}`);
          reject(new InternalServerErrorException('Gagal menyimpan file ke server lokal.'));
        });
      });
    } catch (err) {
      this.logger.error(`Error inisiasi download media: ${err.message}`);
      // Tangani kasus langka seperti video tidak bisa didownload karena limit dari pembuat file (disable download)
      if (err.message.includes('fileNotDownloadable')) {
        throw new BadRequestException('Pemilik video telah menonaktifkan fitur download untuk file ini.');
      }
      throw new InternalServerErrorException('Gagal memproses unduhan dari Google Drive.');
    }
  }
}