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
import { RecommendationEvent } from './events/recommendation.event';

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
        videoSource: dto.videoSource || null,
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
    const recommendationEvent = new RecommendationEvent();
    recommendationEvent.translationId = translationId;
    recommendationEvent.userId = userId;
    this.eventEmitter.emit('glossary.recommendation', recommendationEvent);

    return {
      success: true,
      message: 'Glossary recommendation process started in background.',
    };
  }

  async checkGlossaryRecommendations(translationId: number, userId: number) {
    const translation = await this.prisma.translation.findUnique({
      where: { id: translationId, userId: userId },
      select: {
        recommendations: true,
        glossaryId: true,
        sourceLang: true,
        targetLang: true,
        glossary: {
          select: {
            id: true,
            name: true,
            sourceLanguage: true,
            targetLanguage: true,
            entries: true, 
          }
        }
      },
    });

    return {
      success: true,
      data: translation
    };
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
    // Validasi kepemilikan translation
    const translation = await this.prisma.translation.findFirst({
      where: {
        id: translationId,
        userId,
      },
    });

    if (!translation) throw new NotFoundException('Translation not found.');

    const createdIdsMapping: { tempId: number; realId: number }[] = [];

    await this.prisma.$transaction(async (tx) => {
      // 1. Update row yang berubah saja
      if (dto.updates && dto.updates.length > 0) {
        await Promise.all(
          dto.updates.map((row) =>
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
      }

      // 2. Tambah row baru
      if (dto.creates && dto.creates.length > 0) {
        await tx.translationRow.createMany({
          data: dto.creates.map((row) => ({
            translationId,
            sequence: row.sequence,
            startTime: row.start,
            endTime: row.end,
            sourceText: row.source,
            targetText: row.translated,
          })),
        });

        const newSequences = dto.creates.map(r => r.sequence);
            
        const newlyCreatedRows = await tx.translationRow.findMany({
            where: {
                translationId: translationId,
                sequence: { in: newSequences }
            },
            select: { id: true, sequence: true }
        });

        dto.creates.forEach(tempRow => {
            const dbRow = newlyCreatedRows.find(db => db.sequence === tempRow.sequence);
            if (dbRow) {
                createdIdsMapping.push({ tempId: tempRow.id, realId: dbRow.id });
            }
        });
      }

      // 3. Hapus row yang di-delete
      if (dto.deletes && dto.deletes.length > 0) {
        await tx.translationRow.deleteMany({
          where: {
            id: {
              in: dto.deletes,
            },
          },
        });
      }
    });

    return {
      success: true,
      message: 'Subtitle berhasil diperbarui.',
      createdIdsMapping,
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
    const {
      glosaryId, translationId, name, sourceLanguage, targetLanguage,
      creates = [], updates = [], deletes = []
    } = payload;

    // ==========================================
    // SKENARIO 1: APPEND KE GLOSARIUM YANG SUDAH ADA
    // ==========================================
    if (glosaryId) {
      const existingGlossary = await this.prisma.glossary.findUnique({
        where: { id: glosaryId, userId: userId },
      });

      if (!existingGlossary) {
        throw new ForbiddenException(`Glossary with ID ${glosaryId} not found or access denied.`);
      }

      await this.prisma.$transaction(async (tx) => {
        // A. Create data baru (termasuk rekomendasi AI)
        if (creates.length > 0) {
          await tx.glossaryEntry.createMany({
            data: creates.map((entry) => ({
              glossaryId: glosaryId,
              source: entry.source,
              target: entry.target,
              detail: entry.detail || null,
            })),
            skipDuplicates: true,
          });
        }

        // B. Update data lama
        if (updates.length > 0) {
          await Promise.all(
            updates.map((entry) =>
              tx.glossaryEntry.update({
                where: { id: entry.id },
                data: {
                  source: entry.source,
                  target: entry.target,
                  detail: entry.detail || null,
                },
              })
            )
          );
        }

        // C. Hapus data yang dihapus user di UI
        if (deletes.length > 0) {
          await tx.glossaryEntry.deleteMany({
            where: {
              id: { in: deletes }
            }
          });
        }

        // hapus data ddi kolom recommendations di tabel Translation karena sudah disimpan ke glossary
        await tx.translation.update({
          where: { id: translationId },
          data: { recommendations: [] },
        });
      });
      

      return { message: 'Successfully updated glossary.' };
    }

    // ==========================================
    // SKENARIO 2: BUAT GLOSARIUM BARU
    // ==========================================
    else {
      return await this.prisma.$transaction(async (tx) => {

        if (!creates || creates.length === 0) {
          throw new BadRequestException('Glosary entries tidak boleh kosong saat membuat glossary baru.');
        }

        // 1. Buat Glosarium baru beserta entri-entrinya (semua jadi 'creates')
        const newGlossary = await tx.glossary.create({
          data: {
            name: name,
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage,
            userId: userId,
            entries: {
              create: creates.map((entry) => ({
                source: entry.source,
                target: entry.target,
                detail: entry.detail || null,
              })),
            },
          },
        });

        // 2. Tautkan glosarium baru ini ke tabel Translation
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
          addedEntries: creates.length,
        };
      });
    }
  }
}