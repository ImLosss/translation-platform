import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { TranslationProcessEvent } from './events/translate.event';
import { LlmService } from '../llm/llm.service';
import { DriveService } from 'src/drive/drive.service';
import ffmpeg = require('fluent-ffmpeg');
import * as path from 'path';
import * as fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import { CurrencyService } from 'src/currency/currency.service';
import SrtParser from 'srt-parser-2';


interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class TranslateListener {
  private readonly logger = new Logger(TranslateListener.name);
  private srtParser = new SrtParser();

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LlmService,
    private readonly driveService: DriveService,
    private readonly currencyService: CurrencyService,
    private eventEmitter: EventEmitter2,
  ) {
    ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
    ffmpeg.setFfprobePath('/usr/bin/ffprobe');
  }

  @OnEvent('translation.process', { async: true })
  async handleTranslationProcessEvent(payload: TranslationProcessEvent) {
    this.logger.log(`Memulai proses translasi LLM untuk ID: ${payload.translation.id}...`);

    try {
      const translationRows = await this.prisma.translationRow.findMany({
        where: { translationId: payload.translation.id },
        orderBy: { sequence: 'asc' },
      });

      // Format kembali ke bentuk array object untuk prompt LLM
      const promptData = translationRows.map(row => ({
        line: row.sequence,
        text: row.sourceText,
      }));

      // 2. Injeksi bahasa ke dalam Prompt
      const glossaryPrompt = await this.buildGlossaryPrompt(payload.translation.glossaryId);
      const globalSystemPrompt = this.getUniversalSystemPrompt(payload.translation.sourceLang, payload.translation.targetLang);

      // 3. Mulai proses Chunking dan Looping ke LLM
      const chunks = this.chunkArray(promptData, payload.translation.batchSize || 50);
      let tempChatHistory: ChatMessage[] = [];
      let totReq = 0;
      let repeatReq = 0;
      let totalTokens = 0;
      let totalCost = 0;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        this.logger.debug(`Memproses Batch ${i + 1}/${chunks.length} [Max ${payload.translation.batchSize || 50} lines/Req]`);

        // Susun Chat History sesuai referensi Anda
        const chatHistory: ChatMessage[] = [];
        chatHistory.push({ role: 'system', content: globalSystemPrompt });
        chatHistory.push({ role: 'system', content: glossaryPrompt });

        // Masukkan konteks percakapan sebelumnya (jika ada)
        if (tempChatHistory.length > 0) {
          chatHistory.push(...tempChatHistory);
        }

        // Masukkan prompt user saat ini
        chatHistory.push({
          role: 'user',
          content: `Terjemahkan subtitle berikut dengan aturan:\n- Gunakan tanda baca yang sesuai (titik, koma, tanda tanya, tanda seru)\n- Gunakan koma untuk jeda atau kalimat yang belum selesai\n- Gunakan titik hanya untuk kalimat yang benar-benar selesai\n- Jangan tambahkan komentar atau penjelasan apapun\n\nSubtitle:\n${JSON.stringify(chunk)}`,
        });

        this.logger.debug(`Chat History untuk Batch ${i + 1}: ${JSON.stringify(chatHistory)}`);

        const response = await this.llmService.processTranslation(payload.translation.provider.name, chatHistory);

        if (!response.status) {
          this.logger.warn(`Request gagal pada batch ${i + 1}. Mengulang...`);
          i--; // Ulangi index ini
          repeatReq += 1;

          if (repeatReq > 5) {
            throw new Error(`Terlalu banyak request gagal (Rate Limit / Error LLM). Proses dihentikan pada batch ${i + 1}.`);
          }
          await new Promise(resolve => setTimeout(resolve, 2000)); // Delay lebih lama jika gagal
          continue;
        }

        // Reset repeat request jika sukses
        repeatReq = 0;
        totReq += 1;

        // Simpan riwayat chat untuk menjaga konteks terjemahan antar-batch (Memory)
        tempChatHistory.push({ role: 'user', content: JSON.stringify(chunk) });
        tempChatHistory.push({ role: 'assistant', content: response.message });

        // Batasi memori history maksimal 2 pasang (4 item) agar tidak over-token
        if (tempChatHistory.length > 4) {
          tempChatHistory.splice(0, 2);
        }

        // 4. Update hasil ke database per batch (mencegah data hilang jika crash di tengah jalan)
        const saveResult = await this.saveBatchResultToDb(payload.translation.id, response.message);

        if (!saveResult) {
          this.logger.warn(`Gagal menyimpan hasil batch ${i + 1} ke database. Mengulang...`);
          i--; // Ulangi index ini
          repeatReq += 1;

          if (repeatReq > 5) {
            throw new Error(`Terlalu banyak request gagal (Rate Limit / Error LLM). Proses dihentikan pada batch ${i + 1}.`);
          }

          await new Promise(resolve => setTimeout(resolve, 2000)); // Delay lebih lama jika gagal
          continue;
        }

        // Update total tokens dan biaya
        let inputTokens = response.inputTokens || 0;
        let inputCacheTokens = response.inputCacheTokens || 0;
        let outputTokens = response.outputTokens || 0;

        const ONE_MILLION = 1_000_000;

        const inputCost = (inputTokens / ONE_MILLION) * payload.translation.provider.inputPricing;
        const cacheCost = (inputCacheTokens / ONE_MILLION) * payload.translation.provider.inputCachePricing;
        const outputCost = (outputTokens / ONE_MILLION) * payload.translation.provider.outputPricing;

        totalCost += inputCost + cacheCost + outputCost;
        totalTokens += response.totalTokens || 0;


        // Delay untuk mencegah Rate Limit (429)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // biaya fee 5%
      totalCost = totalCost * 1.05;

      let cv = await this.currencyService.convert(totalCost, 'USD', 'IDR');

      // 5. Tandai selesai
      await this.prisma.translation.update({
        where: { id: payload.translation.id },
        data: { status: 'COMPLETED', totalToken: totalTokens, totalCost: cv.result },
      });

      await this.prisma.user.update({
        where: { id: payload.translation.userId },
        data: { balance: { decrement: cv.result } },
      });

      this.logger.log(`Translasi ID ${payload.translation.id} selesai! Total Request: ${totReq}`);

    } catch (error: any) {
      this.logger.error(`Translasi ID ${payload.translation.id} gagal:`, error.stack);
      await this.prisma.translation.update({
        where: { id: payload.translation.id },
        data: { status: 'ERROR' }, // Pastikan menggunakan enum ERROR
      });
    }
  }

  @OnEvent('translation.drive.process', { async: true })
  async handleTranslationDriveProcessEvent(payload: TranslationProcessEvent) {
    this.logger.log(`Memulai proses translasi dari Drive untuk ID: ${payload.translation.id}...`);
    this.logger.debug(`Payload Event: ${JSON.stringify(payload)}`);

    let audioPath: string | null = null;

    try {
      // 1. Download dan Ekstrak Audio
      const videoData = await this.driveService.downloadVideoPublic(payload.translation.videoSource);
      audioPath = await this.extractAudioAndDeleteVideo(videoData.path);

      // 2. Siapkan form-data untuk mengirim file ke API Whisper
      this.logger.log('Mengirim file audio ke server Whisper...');
      const formData = new FormData();
      formData.append('media_file', fs.createReadStream(audioPath));

      // Gunakan URL server Node.js Whisper Anda (misal: localhost:2055)
      const WHISPER_API_URL = process.env.WHISPER_API_URL;
      const WEBHOOK_TOKEN = 'sbwhook-lwatbodiymchocuj2fdbt1qs'; // Sesuaikan dengan token Anda

      // 3. Masukkan ke antrean API Whisper
      const uploadRes = await axios.post(`${WHISPER_API_URL}/transcribe`, formData, {
        headers: {
          ...formData.getHeaders(),
          'sb-webhook-token': WEBHOOK_TOKEN,
        },
      });

      const taskId = uploadRes.data.taskId;
      this.logger.log(`Berhasil masuk antrean Whisper. Task ID: ${taskId}`);

      await this.prisma.translation.update({
        where: { id: payload.translation.id },
        data: { whisperId: taskId },
      });

      // 4. Polling untuk mengecek status (misal: cek setiap 5 detik)
      let srtContent = null;
      let detectedLanguage = null;

      while (true) {
        // Jeda 5 detik
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const statusRes = await axios.get(`${WHISPER_API_URL}/tasks/${taskId}`, {
          headers: { 'sb-webhook-token': WEBHOOK_TOKEN },
        });

        const taskData = statusRes.data;

        if (taskData.status === 'not_found') {
          throw new Error('Task Whisper dibatalkan atau tidak ditemukan.');
        }

        if (taskData.status === 'completed') {
          srtContent = taskData.details.srt_content;
          detectedLanguage = taskData.language;
          this.logger.log(`Ekstraksi SRT selesai. Bahasa terdeteksi: ${detectedLanguage}`);
          break;
        }

        if (taskData.status === 'error') {
          throw new Error(`Error dari Whisper: ${taskData.errorStr || 'Unknown error'}`);
        }

        // Tampilkan progres
        this.logger.debug(`Progres ekstrak audio [Task ${taskId}]: ${taskData.progress}%`);
      }

      const parsedSrt = this.srtParser.fromSrt(srtContent!);

      const rowsData = parsedSrt.map((item) => ({
        translationId: payload.translation.id,
        sequence: parseInt(item.id, 10),
        startTime: item.startTime,
        endTime: item.endTime,
        sourceText: item.text,
      }));

      // Simpan ke database menggunakan createMany
      await this.prisma.translationRow.createMany({
        data: rowsData,
        skipDuplicates: true, // (Opsional) Mengabaikan error jika kebetulan ada data duplikat
      });

      // 6. Lanjut panggil event translasi LLM
      this.logger.log('Memicu event translation.process (LLM)...');
      this.eventEmitter.emit('translation.process', payload);

    } catch (error: any) {
      this.logger.error(`Gagal melakukan ekstraksi audio/srt: ${error.message}`, error.stack);
      await this.prisma.translation.update({
        where: { id: payload.translation.id },
        data: { status: 'ERROR' },
      });
    } finally {
      // 7. Bersihkan file audio lokal di server NestJS agar storage tidak penuh
      if (audioPath && fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
        this.logger.debug(`File audio sementara dihapus: ${audioPath}`);
      }
    }
  }

  // =====================================================================
  // HELPER METHODS
  // =====================================================================

  /**
   * Menyusun prompt sistem utama yang universal
   */
  private getUniversalSystemPrompt(sourceLang: string, targetLang: string): string {
    return `Kamu adalah seorang Translator Subtitle Profesional. Saya akan mengirimkan potongan subtitle dalam bentuk JSON. Terjemahkan teks tersebut dari bahasa ${sourceLang} ke bahasa ${targetLang} seakurat mungkin, sambil mempertahankan gaya bahasa, konteks, dan referensi dataset glosarium yang diberikan (jika ada).

Kirim jawaban kamu dalam format array JSON valid.
Selalu ikuti line yang diberikan user tanpa menambahkan atau mengurangi baris apapun.

Output HARUS mengikuti skema berikut:
{"translations":[{"line":"nomor_baris","translated_text":"terjemahan"}]}

Pastikan JSON dapat diparse langsung menggunakan JSON.parse() tanpa modifikasi apa pun.

Detail yang perlu diperhatikan dalam penerjemahan dari ${sourceLang} ke ${targetLang}:
- Pertahankan nama entitas spesifik (seperti nama karakter, klan, suku, atau lokasi) dalam ejaan aslinya atau transliterasi yang paling umum diterima, jangan diterjemahkan secara harfiah.
- Jaga konsistensi penggunaan kata ganti orang agar tidak tertukar.
- Jaga nuansa terjemahan agar tetap natural, mencerminkan lingkungan percakapan yang sesuai dengan latar cerita aslinya.
- Ekspresi dan reaksi dalam dialog harus ditangkap dengan baik untuk memberikan konteks emosional.
- Gunakan struktur kalimat yang singkat, padat, dan terstruktur agar efektif saat dibaca di layar sebagai subtitle.`;
  }

  /**
   * Glosarium juga bisa dibuat lebih fleksibel
   */
  private async buildGlossaryPrompt(glossaryId?: number): Promise<string> {
    if (!glossaryId) {
      return `Gunakan pengetahuan bahasamu yang luas untuk menerjemahkan subtitle ini dengan akurat dan natural.`;
    }

    const entries = await this.prisma.glossaryEntry.findMany({
      where: { glossaryId: glossaryId },
      select: { source: true, target: true, detail: true }, // Sesuaikan dengan nama kolom DB Anda
    });

    if (entries.length === 0) return '';

    const trainingData = {
      GLOSSARY: entries.map(entry => ({
        source: entry.source,
        target: entry.target,
        context: entry.detail || 'istilah',
      })),
    };

    return `Gunakan dataset glosarium berikut sebagai aturan wajib dalam menerjemahkan istilah spesifik:\n\n${JSON.stringify(trainingData)}`;
  }

  /**
   * Memecah array menjadi batch yang lebih kecil
   */
  private chunkArray<T>(arr: T[], size: number = 50): T[][] {
    const chunks: T[][] = [];

    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }

    return chunks;
  }

  /**
   * Menyimpan hasil terjemahan kembali ke database (TranslationRow)
   */
  private async saveBatchResultToDb(translationId: number, llmResult: any): Promise<boolean> {
    let parsedResult = llmResult;

    this.logger.log(llmResult);

    if (typeof llmResult === 'string') {
      try {
        parsedResult = JSON.parse(llmResult);
      } catch (error: any) {
        this.logger.error('Gagal melakukan JSON.parse pada respons LLM:', llmResult);
        return false; // <-- PERBAIKAN: Berikan return false secara eksplisit
      }
    }

    const translations = parsedResult.translations || parsedResult;

    if (!Array.isArray(translations)) {
      this.logger.warn('Format data bukan array, membatalkan penyimpanan ke DB.', translations);
      return false;
    }

    const updatePromises = translations.map(t =>
      this.prisma.translationRow.updateMany({
        where: {
          translationId: translationId,
          sequence: Number(t.line)
        },
        data: {
          targetText: t.translated_text || t.content || "MISSING TRANSLATION"
        }
      })
    );

    try {
      await this.prisma.$transaction(updatePromises, {
        maxWait: 5000, 
        timeout: 15000 
      });
      this.logger.log(`Berhasil menyimpan batch ke database!`);
      return true;
    } catch (dbError: any) {
      this.logger.error('Gagal mengeksekusi transaksi database:', dbError);
      return false; // Mengembalikan false agar batch ini di-retry oleh loop utama
    }
  }

  private async extractAudioAndDeleteVideo(videoPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Tentukan path audio (ganti ekstensi video menjadi .mp3)
      const audioPath = videoPath.replace(path.extname(videoPath), '.mp3');

      ffmpeg(videoPath)
        .noVideo() // Abaikan stream video, ambil audionya saja
        .audioCodec('libmp3lame') // Format MP3
        .audioChannels(1) // (Opsional) 1 channel (mono) sudah cukup untuk Speech-to-Text dan ukuran file lebih kecil
        .audioFrequency(16000) // (Opsional) 16kHz adalah standar optimal untuk AI seperti Whisper
        .on('start', () => {
          this.logger.log('Memulai proses ekstraksi audio...');
        })
        .on('end', async () => {
          this.logger.log('Ekstraksi audio selesai!');
          try {
            // Hapus file video asli setelah audio berhasil dibuat
            fs.unlinkSync(videoPath);
            this.logger.log(`Video asli berhasil dihapus: ${videoPath}`);
            resolve(audioPath); // Kembalikan lokasi file audio
          } catch (err: any) {
            this.logger.error(`Gagal menghapus video asli: ${err.message}`);
            resolve(audioPath); // Tetap kembalikan path audio meski video gagal dihapus
          }
        })
        .on('error', async (err: any) => {
          this.logger.error(`Error saat mengekstrak audio: ${err.message}`);

          // Jika gagal ekstrak, usahakan tetap hapus videonya agar tidak menjadi sampah
          try {
            fs.unlinkSync(videoPath);
          } catch (e: any) { }

          reject(err);
        })
        .save(audioPath); // Simpan ke audioPath
    });
  }
}