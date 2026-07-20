import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGlossaryEntryDto } from './dto/create-glossary-entry.dto';
import { UpdateGlossaryEntryDto } from './dto/update-glossary-entry.dto';
import { PrismaService } from '../prisma/prisma.service'; // Sesuaikan path

@Injectable()
export class GlossaryEntryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGlossaryEntryDto) {
    // Validasi eksistensi glosarium induk
    const glossaryExists = await this.prisma.glossary.findUnique({
      where: { id: dto.glossaryId },
    });

    if (!glossaryExists) {
      throw new NotFoundException(`Glosarium dengan ID ${dto.glossaryId} tidak ditemukan`);
    }

    return this.prisma.glossaryEntry.create({
      data: dto,
    });
  }

  async findAll(glossaryId?: number) {
    // Opsional: Jika glossaryId dikirim, filter berdasarkan ID tersebut
    return this.prisma.glossaryEntry.findMany({
      where: glossaryId ? { glossaryId } : undefined,
    });
  }

  async findOne(id: number) {
    const entry = await this.prisma.glossaryEntry.findUnique({
      where: { id },
      include: { glossary: true }, // Menampilkan info glosarium induknya
    });

    if (!entry) {
      throw new NotFoundException(`Entri dengan ID ${id} tidak ditemukan`);
    }

    return entry;
  }

  async update(id: number, dto: UpdateGlossaryEntryDto) {
    await this.findOne(id); // Memastikan entri ada sebelum diupdate

    return this.prisma.glossaryEntry.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Memastikan entri ada sebelum dihapus

    return this.prisma.glossaryEntry.delete({
      where: { id },
    });
  }
}