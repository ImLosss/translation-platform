import { Injectable, BadRequestException } from '@nestjs/common';
import { DeepseekService } from './providers/deepseek.service';
import { GptLunaService } from './providers/gpt-luna.service';
import { NineInferenceService } from './providers/nine-inference.service';
import { PrismaService } from 'src/prisma/prisma.service';
// import { GeminiService } from './providers/gemini.service';

@Injectable()
export class LlmService {
  constructor(
    private readonly deepseekService: DeepseekService,
    private readonly gptLunaService: GptLunaService,
    private readonly nineInferenceService: NineInferenceService,
    private readonly prisma: PrismaService,
  ) {}

  async processTranslation(modelName: string, chatHistory: any[]): Promise<any> {
    const provider = await this.prisma.provider.findFirst({
      where: {
        name: modelName, 
      },
    });

    if (!provider) throw new BadRequestException(`Model '${modelName}' not found.`);

    return this.nineInferenceService.generateTranslation(chatHistory, true, modelName);


    // switch (modelName.toLowerCase()) {
    //   case 'deepseek':
    //     return this.nineInferenceService.generateTranslation(chatHistory, true);
    //   case 'gpt-luna':
    //     return this.gptLunaService.generateTranslation(chatHistory, true);
    //   case '9inference':
    //     return this.nineInferenceService.generateTranslation(chatHistory, true, modelName);
    //   default:
    //     throw new BadRequestException(`Model LLM '${modelName}' tidak didukung.`);
    // }
  }
}