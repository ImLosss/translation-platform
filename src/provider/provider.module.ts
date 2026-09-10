import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { CurrencyModule } from 'src/currency/currency.module';

@Module({
  imports: [CurrencyModule],
  controllers: [ProviderController],
  providers: [ProviderService],
})
export class ProviderModule {}
