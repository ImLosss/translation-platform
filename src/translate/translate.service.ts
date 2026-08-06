// src/translate/translate.service.ts
import { Injectable, BadRequestException, NotFoundException, Logger, NotImplementedException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { TranslationProcessEvent } from './events/translate.event';
import SrtParser from 'srt-parser-2';
import { TranslateDto } from './dto/translate.dto';
import { UpdateTranslationDto } from './dto/update-subtitle-row.dto';
import { TranslateFromDriveDto } from './dto/translate-from-drive.dto';

export interface SrtBlock {
  line: number;
  timestamp: string;
  content: string;
}

@Injectable()
export class TranslateService {
  private srtParser = new SrtParser();
  private readonly logger = new Logger(TranslateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) { }

  async processTranslationInBackground(dto: TranslateDto, userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if(user.balance < 2000) {
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
    const translationRecord = await this.prisma.translation.create({
      data: {
        fileName: dto.fileName || 'Untitled',
        sourceLang: dto.sourceLang,
        targetLang: dto.targetLang,
        providerId: dto.providerId,
        userId: userId,
        batchSize: dto.batchSize || 50,
        glossaryId: dto.glossaryId || null,
        videoSource: dto.videoSource
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

  async getUserTranslations(userId: number) {
    const translations = await this.prisma.translation.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });
    return translations;
  }

  
}