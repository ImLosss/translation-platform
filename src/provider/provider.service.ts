import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProviderService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProviderDto) {
    return this.prisma.provider.create({ data });
  }

  async findAll() {
    return this.prisma.provider.findMany({
      orderBy: { id: 'desc' }
    });
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