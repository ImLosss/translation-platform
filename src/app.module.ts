import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TranslateModule } from './translate/translate.module';
import { GlosaryModule } from './glosary/glosary.module';

@Module({
  imports: [TranslateModule, GlosaryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
