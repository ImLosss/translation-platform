import { Body, Controller, Get, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google.login.dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { ActivityLogInterceptor } from 'src/activity-log/activity-log.interceptor';
import { LogActivity } from 'src/activity-log/log-activity.decorator';

@Controller('auth')
@UseInterceptors(ActivityLogInterceptor)
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    @LogActivity('Create User Account')
    signup(@Body() dto: LoginDto) {
        return this.authService.signup(dto);
    }

    @Post('login')
    @LogActivity('User Login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
    
    @Post("google")
    @LogActivity('Google Login')
    googleLogin(@Body() dto: GoogleLoginDto) {
        return this.authService.googleLogin(dto);
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    getCurrentUser(@Req() req: any) {
        return req.user;
    }  
}
