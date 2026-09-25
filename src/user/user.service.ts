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

  /**
   * Mengambil data usage harian (jumlah terjemahan, biaya, dan token)
   * untuk kebutuhan chart/diagram pada dashboard.
   */
  async getUsageStats(userId: number, days: number = 30) {
    const timeZone = 'Asia/Makassar';
    const safeDays = Math.min(Math.max(Number(days) || 30, 1), 90);

    // Tentukan awal hari ini berdasarkan WITA
    const now = toZonedTime(new Date(), timeZone);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Mundur (safeDays - 1) hari ke belakang
    const startDate = new Date(startOfToday);
    startDate.setDate(startDate.getDate() - (safeDays - 1));

    const endDate = new Date(startOfToday);
    endDate.setDate(endDate.getDate() + 1);

    // Konversi kembali ke UTC untuk query Prisma
    const startUtc = fromZonedTime(startDate, timeZone);
    const endUtc = fromZonedTime(endDate, timeZone);

    const translations = await this.prisma.translation.findMany({
      where: {
        userId,
        createdAt: { gte: startUtc, lt: endUtc },
      },
      select: {
        createdAt: true,
        totalCost: true,
        totalToken: true,
        status: true,
      },
    });

    // Siapkan bucket kosong untuk setiap hari agar chart tetap rapi
    const monthLabels = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
    ];

    const buckets = new Map<
      string,
      {
        date: string;
        label: string;
        fullLabel: string;
        translations: number;
        completed: number;
        cost: number;
        tokens: number;
      }
    >();

    for (let i = 0; i < safeDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      buckets.set(key, {
        date: key,
        label: `${d.getDate()} ${monthLabels[d.getMonth()]}`,
        fullLabel: `${d.getDate()} ${monthLabels[d.getMonth()]} ${d.getFullYear()}`,
        translations: 0,
        completed: 0,
        cost: 0,
        tokens: 0,
      });
    }

    for (const t of translations) {
      const local = toZonedTime(t.createdAt, timeZone);
      const key = `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`;

      const bucket = buckets.get(key);
      if (!bucket) continue;

      bucket.translations += 1;
      if (t.status === 'COMPLETED') bucket.completed += 1;
      bucket.cost += t.totalCost || 0;
      bucket.tokens += t.totalToken || 0;
    }

    const data = Array.from(buckets.values());

    return {
      days: safeDays,
      timeZone,
      data,
      summary: {
        translations: data.reduce((acc, d) => acc + d.translations, 0),
        cost: data.reduce((acc, d) => acc + d.cost, 0),
        tokens: data.reduce((acc, d) => acc + d.tokens, 0),
      },
    };
  }
}
