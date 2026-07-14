import { Body, Controller, Get, Post } from '@nestjs/common';
import { TranslateService } from './translate.service';
import { TranslateDto } from './dto/translate.dto/translate.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@Controller('translate')
export class TranslateController {
    constructor(private readonly translateService: TranslateService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async translate(@Body() body: TranslateDto) {
        return this.translateService.translate(body);
    }
}
