import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { TranslateService } from './translate.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { TranslateDto } from './dto/translate.dto';

@Controller('translate')
@UseGuards(JwtAuthGuard)
export class TranslateController {
    constructor(private readonly translateService: TranslateService) {}

    @Post()
    async translateText(@Body() translateDto: TranslateDto, @Req() req: any) {
        const userId = req.user.sub;
        return this.translateService.processTranslationInBackground(translateDto, userId); 
    }
}
