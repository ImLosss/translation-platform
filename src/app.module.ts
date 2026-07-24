import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TranslateModule } from './translate/translate.module';
import { GlosaryModule } from './glosary/glosary.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { GlossaryEntryModule } from './glossary-entry/glossary-entry.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    TranslateModule,
    GlosaryModule,
    AuthModule,
    PrismaModule,
    GlossaryEntryModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
