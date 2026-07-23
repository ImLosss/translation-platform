import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LlmService } from './llm.service';
import { DeepseekService } from './providers/deepseek.service';
// import { GeminiService } from './providers/gemini.service';

@Module({
  imports: [
    HttpModule
  ],
  providers: [
    LlmService,
    DeepseekService,
  ],
  exports: [
    LlmService, 
  ],
})
export class LlmModule {}