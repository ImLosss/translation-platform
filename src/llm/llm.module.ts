import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LlmService } from './llm.service';
import { DeepseekService } from './providers/deepseek.service';
import { GptLunaService } from './providers/gpt-luna.service';
import { NineInferenceService } from './providers/nine-inference.service';
// import { GeminiService } from './providers/gemini.service';

@Module({
  imports: [
    HttpModule
  ],
  providers: [
    LlmService,
    DeepseekService,
    GptLunaService,
    NineInferenceService,
  ],
  exports: [
    LlmService, 
  ],
})
export class LlmModule {}