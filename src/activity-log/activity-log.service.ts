import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Sesuaikan path

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  // Fungsi untuk menyimpan log
  async logAction(data: {
    userId?: number;
    action: string;
    method: string;
    url: string;
    details?: any;
    ipAddress?: string;
    statusCode?: number;
  }) {
    // Kita gunakan fire-and-forget (tanpa await di controller) agar tidak memperlambat response
    return this.prisma.activityLog.create({
      data,
    }).catch(err => console.error('Gagal menyimpan activity log:', err));
  }

  // Fungsi untuk Admin menampilkan log (beserta pagination)
  async getLogs(
    page: number = 1, 
    limit: number = 20,
    filters: { method?: string; status?: string; startDate?: string; endDate?: string } = {}
  ) {
    const skip = (page - 1) * limit;
    
    // Objek untuk menampung kondisi query Prisma
    const where: any = {};

    // 1. Filter Method (GET, POST, dll)
    if (filters.method) {
      where.method = filters.method;
    }

    // 2. Filter Status (Success/Error)
    if (filters.status) {
      if (filters.status === 'success') {
        where.statusCode = { gte: 200, lt: 400 }; // 2xx dan 3xx
      } else if (filters.status === 'error') {
        where.statusCode = { gte: 400 }; // 4xx dan 5xx
      } else if (!isNaN(Number(filters.status))) {
        where.statusCode = Number(filters.status);
      }
    }

    // 3. Filter Tanggal
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // Set ke akhir hari tersebut
        where.createdAt.lte = endDate;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where, // 👈 Masukkan kondisi where di sini
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, username: true, email: true } } },
      }),
      this.prisma.activityLog.count({ where }), // 👈 Hitung total berdasarkan filter
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
}