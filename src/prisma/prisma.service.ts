import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(
    private config: ConfigService,
  ) {
    // const adapter = new PrismaPg({
    //   connectionString: config.getOrThrow<string>('DATABASE_URL'),
    // });
    const adapter = new PrismaMariaDb(config.getOrThrow<string>('DATABASE_URL'));

    super({
      adapter,
    });
  }
}