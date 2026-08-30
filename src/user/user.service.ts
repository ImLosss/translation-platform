import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from 'generated/prisma/enums';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        // Jangan mengembalikan passwordHash demi keamanan
        select: {
          id: true,
          email: true,
          username: true,
          avatar: true,
          balance: true,
          provider: true,
          role: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        balance: true,
        provider: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');
    return user;
  }

  async update(id: number, data: { username?: string; role?: Role; balance?: number }) {
    // Pastikan user ada sebelum di-update
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        username: data.username,
        role: data.role,
        balance: Number(data.balance),
      },
      select: { id: true, email: true, username: true, role: true, balance: true }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // Hapus user (pastikan onDelete: Cascade di schema prisma jika ada relasi yang terkait)
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getUserDashboardStats(userId: number) {
    const timeZone = 'Asia/Makassar';

    // Awal & akhir hari berdasarkan WITA
    const now = toZonedTime(new Date(), timeZone);

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Konversi kembali ke UTC untuk query Prisma
    const today = fromZonedTime(startOfDay, timeZone);
    const tomorrow = fromZonedTime(endOfDay, timeZone);

    const [user, todayStats, processingCount] = await this.prisma.$transaction([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          balance: true,
          role: true,
          _count: {
            select: {
              translations: true,
            },
          },
        },
      }),

      this.prisma.translation.aggregate({
        where: {
          userId,
          status: 'COMPLETED',
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        _sum: {
          totalCost: true,
          totalToken: true,
        },
        _count: {
          id: true,
        },
      }),

      this.prisma.translation.count({
        where: {
          userId,
          status: 'PROCESSING',
        },
      }),
    ]);

    if (!user) {
      throw new UnauthorizedException();
    }

    // 2. (Opsional tapi sering dibutuhkan) Mengambil agregat jumlah token atau biaya 
    // dari seluruh transaksi terjemahan milik user ini
    const translationStats = await this.prisma.translation.aggregate({
      where: { userId: userId },
      _sum: {
        totalCost: true,
      },
      // Anda juga bisa menambahkan _avg, _min, atau _max jika diperlukan
    });

    // 3. Format dan kembalikan data agar mudah dibaca oleh Frontend
    return {
      profile: {
        balance: user.balance,
        role: user.role,
      },
      statistics: {
        totalTranslations: user._count.translations || 0,
        totalCostToday: todayStats._sum.totalCost || 0,
        processing: processingCount || 0,
      },
    };
  }
}
