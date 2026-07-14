import { Module } from '@nestjs/common';
import { GlosaryService } from './glosary.service';
import { GlosaryController } from './glosary.controller';

@Module({
  controllers: [GlosaryController],
  providers: [GlosaryService],
})
export class GlosaryModule {}
