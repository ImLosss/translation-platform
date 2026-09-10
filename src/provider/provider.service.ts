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

    if (providers.length === 0) return [];

    // 1. Ambil rate USD ke IDR CUKUP 1 KALI di luar loop
    const rateData = await this.currencyService.convert(1, 'USD', 'IDR');
    const rate = rateData.rate;

    // Konversi setiap harga dari USD ke IDR
    const providersWithIDR = await Promise.all(
      providers.map(async (provider) => {
        return {
          ...provider,
          inputPricingIDR: provider.inputPricing * rate,
          inputCachePricingIDR: provider.inputCachePricing * rate,
          outputPricingIDR: provider.outputPricing * rate,
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