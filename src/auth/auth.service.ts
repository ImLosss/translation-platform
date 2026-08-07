import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthProvider, User } from '../../generated/prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
    ) { }

    async signup(dto: LoginDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (existingUser) {
            throw new UnauthorizedException('Email sudah digunakan');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                username: dto.username,
                provider: AuthProvider.LOCAL,
            },
        });

        return {
            access_token: await this.createToken(user),
        };
    }

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

        return {
            access_token: await this.createToken(user),
        };
    }

    async googleLogin(dto: { accessToken: string }) {
        // Verifikasi access token ke Google
        const response = await fetch(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            {
                headers: {
                    Authorization: `Bearer ${dto.accessToken}`,
                },
            },
        );

        if (!response.ok) {
            throw new UnauthorizedException('Google token tidak valid');
        }

        const googleUser = await response.json();

        if (!googleUser.email || !googleUser.sub) {
            throw new UnauthorizedException(
                'Data akun Google tidak lengkap',
            );
        }

        // ===========================
        // 1. Cari berdasarkan Google ID
        // ===========================
        let user = await this.prisma.user.findUnique({
            where: {
                googleId: googleUser.sub,
            },
        });

        // ===========================
        // 2. Kalau tidak ada
        // ===========================
        if (!user) {
            // Cari berdasarkan email
            const existing = await this.prisma.user.findUnique({
                where: {
                    email: googleUser.email,
                },
            });

            // ===========================
            // 3. Email sudah ada
            // ===========================
            if (existing) {
                user = await this.prisma.user.update({
                    where: {
                        id: existing.id,
                    },
                    data: {
                        googleId: googleUser.sub,
                        provider: AuthProvider.GOOGLE,
                        avatar: googleUser.picture,
                        username:
                            existing.username ??
                            googleUser.name,
                    },
                });
            } else {
                // ===========================
                // 4. User baru
                // ===========================
                user = await this.prisma.user.create({
                    data: {
                        email: googleUser.email,
                        username: googleUser.name,
                        avatar: googleUser.picture,
                        googleId: googleUser.sub,
                        provider: AuthProvider.GOOGLE,
                    },
                });
            }
        } else {
            // Update avatar & username bila berubah
            user = await this.prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    avatar: googleUser.picture,
                    username: googleUser.name,
                },
            });
        }

        // ===========================
        // 5. Buat JWT aplikasi
        // ===========================
        const accessToken = await this.createToken(user);

        return {
            access_token: accessToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
                role: user.role,
            },
        };
    }

    private async createToken(user: Pick<User, 'id' | 'email' | 'role' | 'username' | 'avatar'>) {
        const payload = {
            sub: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
        };

        return this.jwt.signAsync(payload);
    }
}
