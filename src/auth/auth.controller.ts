import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google.login.dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    signup(@Body() dto: LoginDto) {
        return this.authService.signup(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
    
    @Post("google")
    googleLogin(@Body() dto: GoogleLoginDto) {
        return this.authService.googleLogin(dto);
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    getCurrentUser(@Req() req: any) {
        return req.user;
    }  
}
