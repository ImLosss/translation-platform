import { Body, Controller, Get, Header, Param, Post, Req, Res, StreamableFile } from '@nestjs/common';
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

    @Get('check/:translateId')
    async checkTranslationStatus(@Param('translateId') translateId: number, @Req() req: any) {
        const userId = req.user.sub;
        return this.translateService.checkTranslationStatus(translateId, userId);
    }

    @Get('download/:translationId')
    @Header('Content-Type', 'application/x-subrip') // MIME type untuk file SRT
    async downloadSrt(
        @Param('translationId') translationId: string,
        @Req() req: any,
    ): Promise<StreamableFile> {
        const userId = req.user.sub;
        
        // 1. Dapatkan string SRT dari service
        const srtContent = await this.translateService.generateSrtFile(Number(translationId), userId);

        // 2. Ubah string menjadi Buffer
        const buffer = Buffer.from(srtContent, 'utf-8');

        // 3. Set nama file secara dinamis
        const fileName = `translated_${translationId}.srt`;
        
        // 4. Kembalikan file dengan options internal dari StreamableFile
        return new StreamableFile(buffer, {
            type: 'application/x-subrip', // Menggantikan @Header
            disposition: `attachment; filename="${fileName}"`, // Menggantikan res.setHeader
        });
    }
}
