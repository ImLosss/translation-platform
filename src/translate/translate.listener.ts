// src/translate/translate.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { TranslationProcessEvent } from './events/translate.event';

@Injectable()
export class TranslateListener {
  private readonly logger = new Logger(TranslateListener.name);

  constructor(private readonly prisma: PrismaService) {}

  // Menangkap event yang dipancarkan oleh Service
  @OnEvent('translation.process', { async: true })
  async handleTranslationProcessEvent(payload: TranslationProcessEvent) {
    this.logger.log(`Memulai proses translasi untuk ID: ${payload.translationId}...`);
    
    try {
      let resultText = '';

      // Logika pemanggilan AI berdasarkan payload.dto.model
      if (payload.dto.model === 'openai') {
        resultText = await this.callOpenAi(payload.dto);
      } else if (payload.dto.model === 'deepseek') {
        resultText = await this.callDeepSeek(payload.dto);
      }

      // Update status database menjadi sukses
      await this.prisma.translation.update({
        where: { id: payload.translationId },
        data: {
          status: 'COMPLETED',
          // Tulis hasil resultText ke TranslationRow di sini
        },
      });

      this.logger.log(`Translasi ID ${payload.translationId} selesai!`);
    } catch (error) {
      this.logger.error(`Translasi ID ${payload.translationId} gagal:`, error.message);
      
      // Update database dengan status gagal
      await this.prisma.translation.update({
        where: { id: payload.translationId },
        data: {
          // status: 'FAILED'
        },
      });
    }
  }

  private async callOpenAi(dto: any) {
    // Simulasi proses lama
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return "Terjemahan OpenAI";
  }

  private async callDeepSeek(dto: any) {
    // Simulasi proses lama
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return "Terjemahan DeepSeek";
  }
}