import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';

@Module({
  imports: [ConfigModule, PrismaModule, ActivityLogModule],
  controllers: [PaymentController],
  providers: [PaymentService]
})
export class PaymentModule {}
