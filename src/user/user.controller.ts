import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/role.guard';
import { ActivityLogInterceptor } from 'src/activity-log/activity-log.interceptor';
import { LogActivity } from 'src/activity-log/log-activity.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ActivityLogInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    // Ubah string dari query params menjadi angka sebelum dikirim ke service
    return this.userService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { username?: string; role?: Role; balance?: number }
  ) {
    return this.userService.update(id, body);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  @Get('profile-stats')
  async getProfileStats(@Req() req: any) {
    // req.user.sub biasanya berisi ID user yang di-decode dari token JWT
    const userId = Number(req.user.sub); 
    
    return await this.userService.getUserDashboardStats(userId);
  }

  @Get('me')
  @LogActivity('Create Translation Request')
  async getMe(@Req() req: any) {
    const userId = Number(req.user.sub);
    return await this.userService.findOne(userId);
  }
}
