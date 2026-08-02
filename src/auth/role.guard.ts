import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../generated/prisma/client'; // Sesuaikan path
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Ambil daftar role yang diizinkan dari decorator @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. Jika route tidak memiliki decorator @Roles, berarti bebas diakses (selama punya JWT)
    if (!requiredRoles) {
      return true;
    }

    // 3. Ambil object user hasil verifikasi JwtStrategy
    const { user } = context.switchToHttp().getRequest();

    // 4. Pastikan user ada dan role-nya termasuk dalam daftar requiredRoles
    const hasRole = user && requiredRoles.includes(user.role);
    
    if (!hasRole) {
      throw new ForbiddenException('Forbidden resource: You do not have the required role to access this resource.');
    }

    return true;
  }
}