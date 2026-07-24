import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getUserDashboardStats(userId: number) {
    // 1. Mengambil data user sekaligus menghitung total relasi terjemahannya (Total Translate)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        _count: {
          select: { translations: true }, // Prisma akan melakukan query COUNT() di belakang layar
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // 2. (Opsional tapi sering dibutuhkan) Mengambil agregat jumlah token atau biaya 
    // dari seluruh transaksi terjemahan milik user ini
    const translationStats = await this.prisma.translation.aggregate({
      where: { userId: userId },
      _sum: {
        totalTokens: true,
        totalCost: true,
      },
      // Anda juga bisa menambahkan _avg, _min, atau _max jika diperlukan
    });

    // 3. Format dan kembalikan data agar mudah dibaca oleh Frontend
    return {
      profile: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      statistics: {
        totalTranslations: user._count.translations || 0,
        totalTokensUsed: translationStats._sum.totalTokens || 0,
        totalCost: translationStats._sum.totalCost || 0,
      },
    };
  }
}
