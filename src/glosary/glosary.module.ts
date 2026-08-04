import { Module } from '@nestjs/common';
import { GlosaryService } from './glosary.service';
import { GlosaryController } from './glosary.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';

@Module({
  imports: [PrismaModule, ActivityLogModule],
  controllers: [GlosaryController],
  providers: [GlosaryService],
})
export class GlosaryModule {}
