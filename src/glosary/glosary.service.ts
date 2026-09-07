import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGlosaryDto } from './dto/create-glosary.dto';
import { UpdateGlosaryDto } from './dto/update-glosary.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateGlosaryEntryDto } from './dto/update-glosary-entry.dto';

@Injectable()
export class GlosaryService {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: CreateGlosaryDto & { userId: number }) {
    return this.prisma.glossary.create({
      data: {
        name: data.name,
        sourceLanguage: data.sourceLanguage,
        targetLanguage: data.targetLanguage,
        userId: data.userId,
      },
    });
  }

  async findAll(userId: number) {
    // Mengambil semua glosarium beserta daftar entry-nya
    return this.prisma.glossary.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: number) {
    const glosary = await this.prisma.glossary.findUnique({
      where: { id },
      include: {
        entries: true,
      },
    });

    if (!glosary) {
      throw new NotFoundException(`Glosarium dengan ID ${id} tidak ditemukan`);
    }

    return glosary;
  }

  async update(id: number, updateGlosaryDto: UpdateGlosaryDto) {
    // Pastikan data ada sebelum di-update
    await this.findOne(id);

    return this.prisma.glossary.update({
      where: { id },
      data: updateGlosaryDto,
    });
  }

  async remove(id: number, userId: number) {
    const glosary = await this.prisma.glossary.findUnique({
      where: { id, userId },
    });

    if (!glosary) {
      throw new NotFoundException(`Glossary not found or you do not have access.`);
    }

    return this.prisma.glossary.delete({
      where: { id, userId },
    });
  }

  async updateGlosary(glosaryId: number, userId: number, dto: UpdateGlosaryEntryDto) {
    // 1. Pastikan glosarium milik user
    const glosary = await this.prisma.glossary.findFirst({
      where: {
        id: glosaryId,
        userId,
      },
    });

    if (!glosary) {
      throw new NotFoundException('Glosarium tidak ditemukan atau Anda tidak memiliki akses.');
    }

    // 2. Eksekusi Database dalam 1 Transaction
    await this.prisma.$transaction(async (tx) => {

      // A. Update row lama
      if (dto.updates && dto.updates.length > 0) {
        await Promise.all(
          dto.updates.map((row) =>
            tx.glossaryEntry.update({
              where: { id: row.id },
              data: {
                source: row.source,
                target: row.target,
                detail: row.detail || null,
              },
            }),
          ),
        );
      }

      // B. Tambah row baru
      if (dto.creates && dto.creates.length > 0) {
        await tx.glossaryEntry.createMany({
          data: dto.creates.map((row) => ({
            glossaryId: glosary.id,
            source: row.source,
            target: row.target,
            detail: row.detail || null,
          })),
        });
      }

      // C. Hapus row yang di-delete
      if (dto.deletes && dto.deletes.length > 0) {
        await tx.glossaryEntry.deleteMany({
          where: {
            id: {
              in: dto.deletes,
            },
          },
        });
      }
    });

    return {
      success: true,
      message: 'Glosarium berhasil diperbarui.',
    };
  }

  async generateGlosaryFile(
    glosaryId: number,
    userId: number
  ): Promise<{ fileName: string; glosaryContent: string }> {
    const glosary = await this.prisma.glossary.findUnique({
      where: {
        id: glosaryId,
        userId: userId,
      },
      include: {
        entries: {
          orderBy: {
            id: 'asc',
          },
        },
      },
    });

    if (!glosary) {
      throw new NotFoundException('Glossary not found.');
    }

    if (!glosary.entries || glosary.entries.length === 0) {
      throw new BadRequestException('Glossary has no entries to download.');
    }

    const escapeCsv = (value: string | null | undefined): string => {
      const str = value ?? '';

      // Escape tanda kutip dengan menggandakannya
      const escaped = str.replace(/"/g, '""');

      // Field CSV dibungkus dengan tanda kutip
      return `"${escaped}"`;
    };

    const rows = [
      ['source', 'target', 'detail'],
      ...glosary.entries.map((row) => [
        row.source,
        row.target,
        row.detail ?? '',
      ]),
    ];

    const glosaryContent = rows
      .map((row) => row.map(escapeCsv).join(','))
      .join('\n');

    return {
      fileName: `${glosary.name}.csv`,
      glosaryContent,
    };
  }
}
