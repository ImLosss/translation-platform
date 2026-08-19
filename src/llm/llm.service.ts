import { Injectable, BadRequestException } from '@nestjs/common';
import { DeepseekService } from './providers/deepseek.service';
import { GptLunaService } from './providers/gpt-luna.service';
// import { GeminiService } from './providers/gemini.service';

@Injectable()
export class LlmService {
  constructor(
    private readonly deepseekService: DeepseekService,
    private readonly gptLunaService: GptLunaService,
  ) {}

  async processTranslation(modelName: string, chatHistory: any[]): Promise<any> {
    switch (modelName.toLowerCase()) {
      case 'deepseek':
        return this.deepseekService.generateTranslation(chatHistory, true);
      case 'gpt-luna':
        return this.gptLunaService.generateTranslation(chatHistory, true);
      default:
        throw new BadRequestException(`Model LLM '${modelName}' tidak didukung.`);
    }
  }
}