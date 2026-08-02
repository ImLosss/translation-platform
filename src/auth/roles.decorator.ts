import { SetMetadata } from '@nestjs/common';
import { Role } from '../../generated/prisma/client'; // Sesuaikan path dengan lokasi import Prisma kamu

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);