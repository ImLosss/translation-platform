import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
    ) {}

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
        where: {
            email: dto.email,
        },
        });

        if (!user) {
            throw new UnauthorizedException('Email atau password salah');
        }

        if (!user.passwordHash) {
            throw new UnauthorizedException('Password tidak tersedia');
        }

        const valid = await bcrypt.compare(
        dto.password,
        user.passwordHash,
        );

        if (!valid) {
        throw new UnauthorizedException('Email atau password salah');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return {
        access_token: await this.jwt.signAsync(payload),
        };
    }
}
