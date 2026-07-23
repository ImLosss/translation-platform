import { Module } from '@nestjs/common';
import { TranslateController } from './translate.controller';
import { TranslateService } from './translate.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TranslateListener } from './translate.listener';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [PrismaModule, LlmModule],
  controllers: [TranslateController],
  providers: [TranslateService, TranslateListener]
})
export class TranslateModule {}
