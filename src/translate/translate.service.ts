// src/translate/translate.service.ts
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { TranslateDto } from './dto/translate.dto';
import { TranslationProcessEvent } from './events/translate.event';

@Injectable()
export class TranslateService {
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
}