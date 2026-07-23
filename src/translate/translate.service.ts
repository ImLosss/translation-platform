// src/translate/translate.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { TranslateDto } from './dto/translate.dto';
import { TranslationProcessEvent } from './events/translate.event';
import SrtParser from 'srt-parser-2';

export interface SrtBlock {
  line: number;
  timestamp: string;
  content: string;
}

@Injectable()
export class TranslateService {
  private srtParser = new SrtParser();

  constructor(
    private readonly prisma: PrismaService,
    private eventEmitter: EventEmitter2, // Injeksi Event Emitter
  ) {}

  async processTranslationInBackground(dto: TranslateDto, userId: number) {
    // 1. Catat ke database dengan status 'PENDING'
    const translationRecord = await this.prisma.translation.create({
      data: {
        fileName: dto.fileName || 'Untitled',
        sourceLang: dto.sourceLang,
        targetLang: dto.targetLang,
        userId: userId,
        // status: 'PENDING' -> Pastikan kolom ini ditambahkan di schema Prisma
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
    translationEvent.translationId = translationRecord.id;
    translationEvent.dto = dto;

    // 3. Pancarkan (emit) event. Proses ini tidak ditunggu (non-blocking).
    this.eventEmitter.emit('translation.process', translationEvent);

    // 4. Langsung berikan respons ke user
    return {
      message: 'File sedang diterjemahkan di latar belakang.',
      translationId: translationRecord.id,
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
}