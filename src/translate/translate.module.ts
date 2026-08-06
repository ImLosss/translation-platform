import { Module } from '@nestjs/common';
import { TranslateController } from './translate.controller';
import { TranslateService } from './translate.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TranslateListener } from './translate.listener';
import { LlmModule } from '../llm/llm.module';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { DriveModule } from 'src/drive/drive.module';
import { CurrencyModule } from 'src/currency/currency.module';

@Module({
  imports: [PrismaModule, LlmModule, ActivityLogModule, DriveModule, CurrencyModule],
  controllers: [TranslateController],
  providers: [TranslateService, TranslateListener]
})
export class TranslateModule {}
