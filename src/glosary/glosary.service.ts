import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGlosaryDto } from './dto/create-glosary.dto';
import { UpdateGlosaryDto } from './dto/update-glosary.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateGlosaryEntryDto } from './dto/update-glosary-entry.dto';

@Injectable()
export class GlosaryService {
  constructor(private readonly prisma: PrismaService) {}
  
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
      where: { id, userId},
    });

    if (!glosary) {
      throw new NotFoundException(`Glossary not found or you do not have access.`);
    }

    return this.prisma.glossary.delete({
      where: { id, userId },
    });
  }

  async updateGlosary(glosaryId: number, userId: number, dto: UpdateGlosaryEntryDto) {
    // 1. Pastikan glosarium milik user dan temukan data lama
    const glosary = await this.prisma.glossary.findFirst({
      where: {
        id: glosaryId,
        userId,
      },
      include: {
        entries: true, // Sesuaikan dengan nama relasi tabel di Prisma-mu
      },
    });

    if (!glosary) {
      throw new NotFoundException('Glosarium tidak ditemukan atau Anda tidak memiliki akses.');
    }

    const oldRows = glosary.entries;

    // 2. Pisahkan data berdasarkan ID (Positif = Update, Negatif = Create)
    const updateRows = dto.entries.filter((x) => x.id > 0);
    const createRows = dto.entries.filter((x) => x.id < 0);

    const updateIds = updateRows.map((x) => x.id);

    // 3. Cari ID mana yang ada di DB lama tapi TIDAK ADA di payload baru (berarti dihapus)
    const deleteIds = oldRows
      .filter((x) => !updateIds.includes(x.id))
      .map((x) => x.id);

    // 4. Eksekusi Database dalam 1 Transaction
    await this.prisma.$transaction(async (tx) => {
      // A. Update row lama
      await Promise.all(
        updateRows.map((row) =>
          tx.glossaryEntry.update({
            where: { id: row.id },
            data: {
              source: row.source,
              target: row.target,
              detail: row.detail || null, // Tangani opsional detail
            },
          }),
        ),
      );

      // B. Tambah row baru
      if (createRows.length) {
        await tx.glossaryEntry.createMany({
          data: createRows.map((row) => ({
            glossaryId: glosary.id,
            source: row.source,
            target: row.target,
            detail: row.detail || null,
          })),
        });
      }

      // C. Hapus row yang di-delete
      if (deleteIds.length) {
        await tx.glossaryEntry.deleteMany({
          where: {
            id: {
              in: deleteIds,
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

  async generateGlosaryFile(glosaryId: number, userId: number): Promise<{ fileName: string; glosaryContent: string }> {
    const glosary = await this.prisma.glossary.findUnique({
      where: { id: glosaryId, userId: userId },
      include: {
        entries: {
          orderBy: { id: 'asc' }
        }
      }
    });

    if (!glosary) throw new NotFoundException('Glossary not found.');

    let glosaryContent = '';

    // send format csv
    for (const row of glosary.entries) {
      glosaryContent += `${row.source}\t${row.target}\t${row.detail || ''}\n`;
    }

    return {
      fileName: `translated_${glosary.name}.csv`,
      glosaryContent: glosaryContent.trim()
    };
  }
}
