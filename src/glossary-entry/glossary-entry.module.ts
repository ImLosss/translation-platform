import { Module } from '@nestjs/common';
import { GlossaryEntryService } from './glossary-entry.service';
import { GlossaryEntryController } from './glossary-entry.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GlossaryEntryController],
  providers: [GlossaryEntryService],
})
export class GlossaryEntryModule {}
