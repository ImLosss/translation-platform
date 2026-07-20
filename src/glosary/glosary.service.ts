import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGlosaryDto } from './dto/create-glosary.dto';
import { UpdateGlosaryDto } from './dto/update-glosary.dto';
import { PrismaService } from '../prisma/prisma.service';

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

  async findAll() {
    // Mengambil semua glosarium beserta daftar entry-nya
    return this.prisma.glossary.findMany({
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

  async remove(id: number) {
    await this.findOne(id);

    // Karena menggunakan onDelete: Cascade, menghapus Glossary 
    // akan otomatis menghapus semua GlossaryEntry yang terkait.
    return this.prisma.glossary.delete({
      where: { id },
    });
  }
}
