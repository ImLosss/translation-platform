import { Body, Controller, Get, Header, Param, Patch, Post, Req, Res, StreamableFile, UseInterceptors } from '@nestjs/common';
import { TranslateService } from './translate.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { TranslateDto } from './dto/translate.dto';
import { UpdateTranslationDto } from './dto/update-subtitle-row.dto';
import { ActivityLogInterceptor } from 'src/activity-log/activity-log.interceptor';
import { LogActivity } from 'src/activity-log/log-activity.decorator';
import { TranslateFromDriveDto } from './dto/translate-from-drive.dto';
import { RolesGuard } from 'src/auth/role.guard';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/roles.decorator';
import { SaveGlossaryRecommendationDto } from './dto/save-glossary-recommendation.dto';

@Controller('translate')
@UseInterceptors(ActivityLogInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
export class TranslateController {
    constructor(private readonly translateService: TranslateService) {}

    @Post()
    @LogActivity('Create Translation Request')
    async translateText(@Body() translateDto: TranslateDto, @Req() req: any) {
        const userId = req.user.sub;
        return this.translateService.processTranslationInBackground(translateDto, userId); 
    }

    @Post('drive')
    @LogActivity('Create Translation Request from Drive')
    async translateFromDrive(@Body() translateFromDriveDto: TranslateFromDriveDto, @Req() req: any) {
        const userId = req.user.sub;
        return this.translateService.processTranslationFromDriveInBackground(translateFromDriveDto, userId); 
    }

    @Post('generate-glossary')
    @LogActivity('Generate Glossary Recommendations')
    async generateGlossaryRecommendations(@Body('translationId') translationId: number, @Req() req: any) {
        const userId = req.user.sub;
        return this.translateService.generateGlossaryRecommendations(translationId, userId);
    }

    @Post('save-recommendation')
    @LogActivity('Save Glossary Recommendations')
    async saveGlossaryRecommendations(@Body() payload: SaveGlossaryRecommendationDto, @Req() req: any) {
        const userId = req.user.sub;
        return this.translateService.saveGlossaryRecommendation(payload, userId);
    }

    @Get()
    @LogActivity('Get User Translations')
    async getUserTranslations(@Req() req: any) {
        const userId = req.user.sub;
        return this.translateService.getUserTranslations(userId);
    }

    @Get(':translationId')
    @LogActivity('Get Translation Details')
    async getTranslationDetails(@Param('translationId') translationId: string, @Req() req: any) {
        const userId = req.user.sub;
        return this.translateService.getTranslationDetails(Number(translationId), userId);
    }

    @Patch(':id')
    @LogActivity('Update Translation')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateTranslationDto,
        @Req() req: any,
    ) {
        return this.translateService.updateTranslation(Number(id), req.user.sub, dto);
    }

    @Get('check/:translateId')
    @LogActivity('Check Translation Status')
    async checkTranslationStatus(@Param('translateId') translateId: number, @Req() req: any) {
        const userId = req.user.sub;
        return this.translateService.checkTranslationStatus(translateId, userId);
    }

    @Get('download/:translationId')
    @LogActivity('Download Translation File')
    @Header('Content-Type', 'application/x-subrip') // MIME type untuk file SRT
    async downloadSrt(
        @Param('translationId') translationId: string,
        @Req() req: any,
    ): Promise<StreamableFile> {
        const userId = req.user.sub;
        
        // 1. Dapatkan string SRT dari service
        const { fileName, srtContent } = await this.translateService.generateSrtFile(Number(translationId), userId);

        // 2. Ubah string menjadi Buffer
        const buffer = Buffer.from(srtContent, 'utf-8');
        
        // 3. Kembalikan file dengan options internal dari StreamableFile
        return new StreamableFile(buffer, {
            type: 'application/x-subrip', // Menggantikan @Header
            disposition: `attachment; filename="${fileName}"`, // Menggantikan res.setHeader
        });
    }
}
