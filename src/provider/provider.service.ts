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
      orderBy: [
        { status: 'asc' }, 
        { id: 'desc' },   
      ],
    });

    if (providers.length === 0) return [];

    // 1. Ambil rate USD ke IDR CUKUP 1 KALI di luar loop
    const rateData = await this.currencyService.convert(1, 'USD', 'IDR');
    const rate = rateData.rate;

    const feePercentage = parseFloat(process.env.FEE_PERCENT || '0');
    const feeMultiplier = 1 + (feePercentage / 100);

    // Konversi setiap harga dari USD ke IDR
    const providersWithIDR = await Promise.all(
      providers.map(async (provider) => {
        return {
          ...provider,
          inputPricingIDR: provider.inputPricing * rate * feeMultiplier,
          inputCachePricingIDR: provider.inputCachePricing * rate * feeMultiplier,
          outputPricingIDR: provider.outputPricing * rate * feeMultiplier,
          inputPricingUSD: provider.inputPricing * feeMultiplier,
          inputCachePricingUSD: provider.inputCachePricing * feeMultiplier,
          outputPricingUSD: provider.outputPricing * feeMultiplier,
        };
      }),
    );

    return providersWithIDR;
  }

  async landing() {
    const providers = await this.prisma.provider.findMany({
      orderBy: [
        { status: 'asc' }, 
        { id: 'desc' },   
      ],
      select: {
        id: true,
        model: true,
        status: true,
      }
    });

    if (providers.length === 0) return [];

    return providers;
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