import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { CurrencyService } from 'src/currency/currency.service';

@Injectable()
export class ProviderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currencyService: CurrencyService,
  ) {}

  async create(data: CreateProviderDto) {
    return this.prisma.provider.create({ data });
  }

  async findAll() {
    const providers = await this.prisma.provider.findMany({
      orderBy: { id: 'desc' },
    });

    // Konversi setiap harga dari USD ke IDR
    const providersWithIDR = await Promise.all(
      providers.map(async (provider) => {
        const inputPricingIDR = await this.currencyService.convert(provider.inputPricing, 'USD', 'IDR');
        const inputCachePricingIDR = await this.currencyService.convert(provider.inputCachePricing, 'USD', 'IDR');
        const outputPricingIDR = await this.currencyService.convert(provider.outputPricing, 'USD', 'IDR');

        return {
          ...provider,
          inputPricingIDR,
          inputCachePricingIDR,
          outputPricingIDR,
        };
      }),
    );

    return providersWithIDR;
  }

  async findOne(id: number) {
    const provider = await this.prisma.provider.findUnique({ where: { id } });
    if (!provider) throw new NotFoundException('Provider tidak ditemukan');
    return provider;
  }

  async update(id: number, data: UpdateProviderDto) {
    await this.findOne(id); // Validasi keberadaan
    return this.prisma.provider.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.provider.delete({ where: { id } });
  }
}