import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { TranslationProcessEvent } from './events/translate.event';
import { LlmService } from '../llm/llm.service';


interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class TranslateListener {
  private readonly logger = new Logger(TranslateListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LlmService
  ) {}

  @OnEvent('translation.process', { async: true })
  async handleTranslationProcessEvent(payload: TranslationProcessEvent) {
    this.logger.log(`Memulai proses translasi LLM untuk ID: ${payload.translationId}...`);

    try {
      // 1. Ekstrak bahasa dari DTO
      const { sourceLang, targetLang, glossaryId, model, batchProcessingSize } = payload.dto;

      const translationRows = await this.prisma.translationRow.findMany({
        where: { translationId: payload.translationId },
        orderBy: { sequence: 'asc' },
      });

      // Format kembali ke bentuk array object untuk prompt LLM
      const promptData = translationRows.map(row => ({
        line: row.sequence,
        text: row.sourceText,
      }));

      // 2. Injeksi bahasa ke dalam Prompt
      const glossaryPrompt = await this.buildGlossaryPrompt(glossaryId);
      const globalSystemPrompt = this.getUniversalSystemPrompt(sourceLang, targetLang);

      // 3. Mulai proses Chunking dan Looping ke LLM
      const chunks = this.chunkArray(promptData, batchProcessingSize || 50); 
      let tempChatHistory: ChatMessage[] = [];
      let totReq = 0;
      let repeatReq = 0;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        this.logger.debug(`Memproses Batch ${i + 1}/${chunks.length} [Max 10 lines/Req]`);

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

        // Panggil LLM (DeepSeek / OpenAI)
        const response = await this.llmService.processTranslation(model, chatHistory);

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
        const saveResult = await this.saveBatchResultToDb(payload.translationId, response.message);

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
          

        // Delay untuk mencegah Rate Limit (429)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 5. Tandai selesai
      await this.prisma.translation.update({
        where: { id: payload.translationId },
        data: { status: 'COMPLETED' },
      });

      this.logger.log(`Translasi ID ${payload.translationId} selesai! Total Request: ${totReq}`);

    } catch (error) {
      this.logger.error(`Translasi ID ${payload.translationId} gagal:`, error.stack);
      await this.prisma.translation.update({
        where: { id: payload.translationId },
        data: { status: 'ERROR' }, // Pastikan menggunakan enum ERROR
      });
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
      } catch (error) {
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
      await this.prisma.$transaction(updatePromises);
      this.logger.log(`Berhasil menyimpan batch ke database!`);
      return true;
    } catch (dbError) {
      this.logger.error('Gagal mengeksekusi transaksi database:', dbError);
      return false; // Mengembalikan false agar batch ini di-retry oleh loop utama
    }
  }
}