import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('currency')
@UseGuards(JwtAuthGuard)
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post('convert')
  async convert(
    @Body() dto: ConvertCurrencyDto,
  ) {
    return this.currencyService.convert(
      dto.amount,
      dto.from,
      dto.to,
    );
  }
}
