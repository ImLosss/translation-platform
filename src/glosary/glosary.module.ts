import { Module } from '@nestjs/common';
import { GlosaryService } from './glosary.service';
import { GlosaryController } from './glosary.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GlosaryController],
  providers: [GlosaryService],
})
export class GlosaryModule {}
