import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req, Put, UseInterceptors, StreamableFile, Header } from '@nestjs/common';
import { GlosaryService } from './glosary.service';
import { CreateGlosaryDto } from './dto/create-glosary.dto';
import { UpdateGlosaryDto } from './dto/update-glosary.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { UpdateGlosaryEntryDto } from './dto/update-glosary-entry.dto';
import { ActivityLogInterceptor } from 'src/activity-log/activity-log.interceptor';
import { LogActivity } from 'src/activity-log/log-activity.decorator';

@Controller('glosary')
@UseInterceptors(ActivityLogInterceptor)
@UseGuards(JwtAuthGuard)
export class GlosaryController {
  constructor(private readonly glosaryService: GlosaryService) { }

  @Post()
  @LogActivity('Create Glosary')
  create(@Body() createGlosaryDto: CreateGlosaryDto, @Req() req: any) {
    const userId = req.user.sub;
    return this.glosaryService.create({ ...createGlosaryDto, userId });
  }

  @Get()
  @LogActivity('Get User Glosaries')
  findAll(@Req() req: any) {
    const userId = req.user.sub;
    return this.glosaryService.findAll(userId);
  }

  @Get(':id')
  @LogActivity('Get Glosary Details')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.glosaryService.findOne(id);
  }

  @Patch(':id')
  @LogActivity('Update Glosary')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGlosaryDto: UpdateGlosaryDto
  ) {
    return this.glosaryService.update(id, updateGlosaryDto);
  }

  @Delete(':id')
  @LogActivity('Delete Glosary')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.sub;
    return this.glosaryService.remove(id, userId);
  }

  @Put(':id/entries')
  @LogActivity('Update Glosary Entries')
  async updateGlosaryEntries(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGlosaryEntryDto,
    @Req() req: any
  ) {
    const userId = req.user.sub;
    return this.glosaryService.updateGlosary(id, userId, dto);
  }

  @Get('downloadglosary/:glosaryId')
  @LogActivity('Download Glosary File')
  @Header('Content-Type', 'application/csv')
  async downloadSourceSrt(
    @Param('glosaryId') glosaryId: string,
    @Req() req: any,
  ): Promise<StreamableFile> {
    const userId = req.user.sub;

    // 1. Dapatkan string CSV dari service
    const { fileName, glosaryContent } = await this.glosaryService.generateGlosaryFile(Number(glosaryId), userId);

    // 2. Ubah string menjadi Buffer
    const buffer = Buffer.from(glosaryContent, 'utf-8');

    // 3. Kembalikan file dengan options internal dari StreamableFile
    return new StreamableFile(buffer, {
      type: 'application/csv', // Menggantikan @Header
      disposition: `attachment; filename="${fileName}"`, // Menggantikan res.setHeader
    });
  }
}
