// src/translate/translate.service.ts
import { Injectable, BadRequestException, NotFoundException, Logger, NotImplementedException, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { TranslationProcessEvent } from './events/translate.event';
import SrtParser from 'srt-parser-2';
import { TranslateDto } from './dto/translate.dto';
import { UpdateTranslationDto } from './dto/update-subtitle-row.dto';
import { TranslateFromDriveDto } from './dto/translate-from-drive.dto';
import { LlmService } from 'src/llm/llm.service';
import { CurrencyService } from 'src/currency/currency.service';
import { SaveGlossaryRecommendationDto } from './dto/save-glossary-recommendation.dto';

export interface SrtBlock {
  line: number;
  timestamp: string;
  content: string;
}

export interface GlosaryEntry {
  source: string;
  target: string;
  detail: string;
}

@Injectable()
export class TranslateService {
  private srtParser = new SrtParser();
  private readonly logger = new Logger(TranslateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private readonly llmService: LlmService,
    private readonly currencyService: CurrencyService,
  ) { }

  async processTranslationInBackground(dto: TranslateDto, userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.balance < 2000) {
      throw new ConflictException('Required balance is at least 2000. Please top up your balance.');
    }

    // 1. Catat ke database dengan status 'PENDING'
    const translationRecord = await this.prisma.translation.create({
      data: {
        fileName: dto.fileName || 'Untitled',
        sourceLang: dto.sourceLang,
        targetLang: dto.targetLang,
        providerId: dto.providerId,
        userId: userId,
        batchSize: dto.batchSize || 50,
        glossaryId: dto.glossaryId || null,
        // status: 'PENDING' -> Pastikan kolom ini ditambahkan di schema Prisma
      },
      include: {
        provider: true,
      },
    });

    const parsedSrt = this.srtParser.fromSrt(dto.srtContent);

    const rowsData = parsedSrt.map((item) => ({
      translationId: translationRecord.id,
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

    // 2. Siapkan payload event
    const translationEvent = new TranslationProcessEvent();
    translationEvent.translation = translationRecord;

    // 3. Pancarkan (emit) event. Proses ini tidak ditunggu (non-blocking).
    this.eventEmitter.emit('translation.process', translationEvent);

    // 4. Langsung berikan respons ke user
    return {
      success: true,
      message: 'Translation started in background.',
      translationId: translationRecord.id,
    };
  }

  async processTranslationFromDriveInBackground(dto: TranslateFromDriveDto, userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.balance < 2000) {
      throw new ConflictException('Required balance is at least 2000. Please top up your balance.');
    }

    const translationRecord = await this.prisma.translation.create({
      data: {
        fileName: dto.fileName || 'Untitled',
        sourceLang: dto.sourceLang,
        targetLang: dto.targetLang,
        providerId: dto.providerId,
        userId: userId,
        batchSize: dto.batchSize || 50,
        glossaryId: dto.glossaryId || null,
        videoSource: dto.videoSource,
        status: 'TRANSCRIBING'
      },
      include: {
        provider: true,
      },
    });

    const translationEvent = new TranslationProcessEvent();
    translationEvent.translation = translationRecord;
    this.eventEmitter.emit('translation.drive.process', translationEvent);

    return {
      success: true,
      message: 'Translation started in background.',
      translationId: translationRecord.id
    }
  }

  async generateGlossaryRecommendations(
    translationId: number,
    userId: number,
  ) {
    this.logger.log(`Memproses rekomendasi glosarium untuk Translation ID: ${translationId}...`);

    // 1. Ambil data translation beserta relasi glossary-nya
    const translation = await this.prisma.translation.findUnique({
      where: { id: translationId, userId: userId },
      include: {
        user: true,
        provider: true,
        glossary: {
          include: {
            entries: { select: { id: true, source: true, target: true, detail: true } },
          },
        },
      },
    });

    if (!translation) {
      throw new Error(`Translation dengan ID ${translationId} tidak ditemukan.`);
    }

    if (translation.user.balance < 2000) {
      throw new ConflictException('Required balance is at least 2000. Please top up your balance.');
    }

    // 2. Ambil seluruh hasil terjemahan dari TranslationRow
    const translationRows = await this.prisma.translationRow.findMany({
      where: { translationId: translationId },
      orderBy: { sequence: 'asc' },
      select: { sourceText: true, targetText: true },
    });

    if (translationRows.length === 0) {
      return [];
    }

    // 3. Kumpulkan daftar istilah (source) yang SUDAH ADA di glossary agar tidak direkomendasikan ulang
    const existingGlossarySources = new Set<string>();
    if (translation.glossary && translation.glossary.entries) {
      translation.glossary.entries.forEach((entry) => {
        existingGlossarySources.add(entry.source.toLowerCase().trim());
      });
    }

    // 4. Siapkan teks hasil terjemahan untuk dianalisis oleh LLM
    const translatedCorpus = translationRows
      .map((row, idx) => `[Line ${idx + 1}] Sumber: ${row.sourceText} | Terjemahan: ${row.targetText || '-'}`)
      .join('\n');

    // 5. Susun Prompt untuk LLM
    const exclusionListText =
      existingGlossarySources.size > 0
        ? `PENTING: Jangan masukkan istilah-istilah berikut karena sudah terdaftar di glosarium utama:\n${JSON.stringify(Array.from(existingGlossarySources))}`
        : '';

    const systemPrompt = `Kamu adalah seorang Asisten AI Analis Terminologi Profesional. Tugasmu adalah menganalisis teks terjemahan subtitle dan mengekstrak istilah-istilah penting (seperti nama entitas, istilah khusus, klan, lokasi, atau istilah teknis/unik) yang sering muncul atau sangat krusial untuk konsistensi terjemahan.`;

    const userPrompt = `Analisis teks terjemahan subtitle berikut dari bahasa ${translation.sourceLang} ke bahasa ${translation.targetLang}.
    
${exclusionListText}

Aturan Ekstraksi:
- Cari istilah unik, nama karakter, organisasi, atau istilah penting yang sering muncul atau berulang.
- Kategorikan setiap istilah ke dalam salah satu tipe (Enum) berikut pada kolom 'detail':
  1. "CHARACTER" (Nama orang, julukan, entitas hidup)
  2. "LOCATION" (Nama tempat, negara, planet, bangunan)
  3. "ORGANIZATION" (Nama kelompok, faksi, sekte, perusahaan)
  4. "ITEM" (Nama benda, senjata, artefak, ramuan)
  5. "SKILL" (Nama jurus, sihir, teknik, kemampuan)
  6. "CULTURE" (Istilah budaya, hari raya, tradisi, konsep spesifik)
  7. "OTHER" (Jika tidak masuk ke kategori di atas)
  8. "CULTIVATION" (Tingkatan kekuatan dalam donghua)

Output HARUS berupa JSON Object dengan skema berikut tanpa teks markdown tambahan:
{"recommendations": [{"source": "istilah dalam bahasa sumber","target": "padanan istilah dalam bahasa target","detail": "PILIH_SALAH_SATU_ENUM_DI_ATAS"}]}

Pastikan JSON dapat diparse langsung menggunakan JSON.parse() tanpa modifikasi apa pun.

Teks Terjemahan:
${translatedCorpus}`;

    const chatHistory = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    // ==========================================
    // 6. EKSEKUSI LLM DENGAN RETRY (MAKSIMAL 3x)
    // ==========================================
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      this.logger.debug(`Mengambil rekomendasi glosarium dari LLM (Percobaan ${attempt}/${maxRetries})...`);

      try {
        const response = await this.llmService.processTranslation(
          translation.provider.name,
          chatHistory,
        );

        if (!response.status || !response.message) {
          throw new Error('Gagal mendapatkan respons valid dari LLM.');
        }

        let rawContent = response.message.trim();
        rawContent = rawContent.replace(/```(?:json)?/gi, '').trim();

        // Parse JSON
        const parsedData: any = JSON.parse(rawContent);

        if (!parsedData || typeof parsedData !== 'object' || !Array.isArray(parsedData.recommendations)) {
          throw new Error('Format balasan tidak valid. Harus berupa JSON Object yang memiliki array "recommendations".');
        }

        const recommendationsList = parsedData.recommendations;

        // Validasi isi array
        const isValidStructure = recommendationsList.every(
          (item) =>
            item &&
            typeof item === 'object' &&
            'source' in item &&
            'target' in item &&
            'detail' in item
        );

        if (!isValidStructure) {
          throw new Error('Struktur di dalam array "recommendations" tidak sesuai dengan GlosaryEntry (source, target, detail).');
        }

        // 7. Jika lolos validasi, Lakukan Filtering & Slicing
        const filteredRecommendations = (recommendationsList as GlosaryEntry[]).filter(
          (item) => !existingGlossarySources.has(item.source.toLowerCase().trim()),
        );

        // ==========================================
        // HITUNG BIAYA DAN KURANGI BALANCE USER
        // ==========================================
        let inputTokens = response.inputTokens || 0;
        let inputCacheTokens = response.inputCacheTokens || 0;
        let outputTokens = response.outputTokens || 0;

        const ONE_MILLION = 1_000_000;

        const inputCost = (inputTokens / ONE_MILLION) * translation.provider.inputPricing;
        const cacheCost = (inputCacheTokens / ONE_MILLION) * translation.provider.inputCachePricing;
        const outputCost = (outputTokens / ONE_MILLION) * translation.provider.outputPricing;

        let totalCost = inputCost + cacheCost + outputCost;

        // Tambahkan fee 5%
        totalCost = totalCost * 1.05;

        // Konversi USD ke IDR
        const cv = await this.currencyService.convert(totalCost, 'USD', 'IDR');

        // Kurangi balance user di database
        await this.prisma.user.update({
          where: { id: userId },
          data: { balance: { decrement: cv.result } },
        });

        await this.prisma.translation.update({
          where: { id: translationId },
          data: {
            totalToken: { increment: response.totalTokens || 0 },
            totalCost: { increment: cv.result }
          }
        });

        this.logger.log(`Sukses mendapatkan rekomendasi glosarium pada percobaan ke-${attempt}.`);
        return {
          translationId: translationId,
          glosary: translation.glossary,
          sourceLang: translation.sourceLang,
          targetLang: translation.targetLang,
          recommendations: filteredRecommendations
        };

      } catch (error) {
        this.logger.warn(`Percobaan ke-${attempt} gagal: ${error.message}`);

        if (attempt >= maxRetries) {
          this.logger.error(`Gagal mendapatkan rekomendasi glosarium setelah ${maxRetries} kali percobaan.`);
          throw new Error(`Gagal memproses rekomendasi glosarium karena format tidak valid setelah ${maxRetries}x percobaan.`);
        }

        // Jeda 2 detik sebelum mencoba lagi
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return [];
  }

  async getTranslationDetails(translationId: number, userId: number) {
    const translation = await this.prisma.translation.findUnique({
      where: { id: translationId, userId: userId },
      include: {
        rows: {
          orderBy: { sequence: 'asc' },
          omit: {
            createdAt: true,
            updatedAt: true
          }
        }
      },
      omit: {
        userId: true,
      }
    });
    return translation;
  }

  async updateTranslation(translationId: number, userId: number, dto: UpdateTranslationDto) {
    // Pastikan translation milik user
    const translation = await this.prisma.translation.findFirst({
      where: {
        id: translationId,
        userId,
      },
      include: {
        rows: true,
      },
    });

    if (!translation) {
      throw new NotFoundException('Translation not found.');
    }

    const oldRows = translation.rows;

    const updateRows = dto.lines.filter((x) => x.id > 0);
    const createRows = dto.lines.filter((x) => x.id < 0);

    const updateIds = updateRows.map((x) => x.id);

    const deleteIds = oldRows
      .filter((x) => !updateIds.includes(x.id))
      .map((x) => x.id);

    await this.prisma.$transaction(async (tx) => {
      // Update row lama
      await Promise.all(
        updateRows.map((row) =>
          tx.translationRow.update({
            where: { id: row.id },
            data: {
              sequence: row.sequence,
              startTime: row.start,
              endTime: row.end,
              sourceText: row.source,
              targetText: row.translated,
            },
          }),
        ),
      );

      // Tambah row baru
      if (createRows.length) {
        await tx.translationRow.createMany({
          data: createRows.map((row) => ({
            translationId,
            sequence: row.sequence,
            startTime: row.start,
            endTime: row.end,
            sourceText: row.source,
            targetText: row.translated,
          })),
        });
      }

      // Hapus row
      if (deleteIds.length) {
        await tx.translationRow.deleteMany({
          where: {
            id: {
              in: deleteIds,
            },
          },
        });
      }
    });

    return {
      success: true,
      message: 'Subtitle berhasil diperbarui.',
    };
  }

  async checkTranslationStatus(translationId: number, userId: number) {
    const translation = await this.prisma.translation.findUnique({
      where: { id: translationId, userId: userId },
      omit: {
        userId: true,
      }
    });

    return translation;
  }

  async generateSrtFile(translationId: number, userId: number): Promise<{ fileName: string; srtContent: string }> {
    const translation = await this.prisma.translation.findUnique({
      where: { id: translationId, userId: userId },
      include: {
        rows: {
          orderBy: { sequence: 'asc' }
        }
      }
    });

    if (!translation) throw new NotFoundException('Data terjemahan tidak ditemukan.');

    if (translation.status !== 'COMPLETED') throw new BadRequestException('File terjemahan belum selesai diproses.');

    let srtContent = '';

    for (const row of translation.rows) {
      srtContent += `${row.sequence}\n`;
      srtContent += `${row.startTime} --> ${row.endTime}\n`;
      // Gunakan targetText (hasil LLM) jika ada, jika kosong gunakan sourceText
      srtContent += `${row.targetText || `MISSING TRANSLATION : ${row.sourceText}`}\n\n`;
    }

    return {
      fileName: `translated_${translation.fileName}.srt`,
      srtContent: srtContent.trim()
    };
  }

  async generateSourceSrtFile(translationId: number, userId: number): Promise<{ fileName: string; srtContent: string }> {
    const translation = await this.prisma.translation.findUnique({
      where: { id: translationId, userId: userId },
      include: {
        rows: {
          orderBy: { sequence: 'asc' }
        }
      }
    });

    if (!translation) throw new NotFoundException('Data terjemahan tidak ditemukan.');

    if (translation.status !== 'COMPLETED' && translation.status !== 'PROCESSING') throw new BadRequestException('File terjemahan belum selesai diproses.');

    let srtContent = '';

    for (const row of translation.rows) {
      srtContent += `${row.sequence}\n`;
      srtContent += `${row.startTime} --> ${row.endTime}\n`;
      // Gunakan targetText (hasil LLM) jika ada, jika kosong gunakan sourceText
      srtContent += `${row.sourceText}\n\n`;
    }

    return {
      fileName: `source_${translation.fileName}.srt`,
      srtContent: srtContent.trim()
    };
  }

  async getUserTranslations(userId: number) {
    const translations = await this.prisma.translation.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        glossary: {
          select: {
            id: true,
            name: true
          },
        }
      }
    });
    return translations;
  }

  async saveGlossaryRecommendation(payload: SaveGlossaryRecommendationDto, userId: number) {
    const { glosaryId, translationId, name, sourceLanguage, targetLanguage, entries } = payload;

    const entriesToCreate = entries.filter((e) => !e.id || e.id < 0);
    const entriesToUpdate = entries.filter((e) => e.id && e.id > 0);

    if (!entries || entries.length === 0) {
      throw new BadRequestException('Glosary entries tidak boleh kosong.');
    }

    // ==========================================
    // SKENARIO 1: APPEND KE GLOSARIUM YANG SUDAH ADA
    // ==========================================
    if (glosaryId) {
      // 1. Verifikasi apakah glosarium ada dan milik user yang sedang login
      const existingGlossary = await this.prisma.glossary.findUnique({
        where: { id: glosaryId, userId: userId },
      });

      if (!existingGlossary) {
        throw new ForbiddenException(`Glossary with ID ${glosaryId} not found or access denied.`);
      }

      await this.prisma.$transaction(async (tx) => {
        if (entriesToCreate.length > 0) {
          await tx.glossaryEntry.createMany({
            data: entriesToCreate.map((entry) => ({
              glossaryId: glosaryId,
              source: entry.source,
              target: entry.target,
              detail: entry.detail || null,
            })),
            skipDuplicates: true,
          });
        }

        if (entriesToUpdate.length > 0) {
          for (const entry of entriesToUpdate) {
            await tx.glossaryEntry.update({
              where: { id: entry.id },
              data: {
                source: entry.source,
                target: entry.target,
                detail: entry.detail || null,
              },
            });
          }
        }
      });

      return { message: 'Successfully updated glossary.' };
    }

    // ==========================================
    // SKENARIO 2: BUAT GLOSARIUM BARU
    // ==========================================
    else {
      // Menggunakan $transaction agar jika salah satu gagal, semuanya di-rollback
      return await this.prisma.$transaction(async (tx) => {

        // 1. Buat Glosarium baru beserta entri-entrinya (Nested Writes Prisma)
        const newGlossary = await tx.glossary.create({
          data: {
            name: name,
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage,
            userId: userId,
            entries: {
              create: entriesToCreate.map((entry) => ({
                source: entry.source,
                target: entry.target,
                detail: entry.detail || null,
              })),
            },
          },
        });

        // 2. Jika ada translationId, tautkan glosarium baru ini ke tabel Translation
        if (translationId) {
          const translation = await tx.translation.findUnique({
            where: { id: translationId, userId: userId },
          });

          if (!translation) {
            throw new NotFoundException(`Translation dengan ID ${translationId} tidak ditemukan.`);
          }

          await tx.translation.update({
            where: { id: translationId },
            data: { glossaryId: newGlossary.id },
          });
        }

        return {
          message: 'Successfully created new glossary.',
          glossaryId: newGlossary.id,
          addedEntries: entries.length,
        };
      });
    }
  }
}