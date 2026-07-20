import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { GlosaryService } from './glosary.service';
import { CreateGlosaryDto } from './dto/create-glosary.dto';
import { UpdateGlosaryDto } from './dto/update-glosary.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@Controller('glosary')
@UseGuards(JwtAuthGuard)
export class GlosaryController {
  constructor(private readonly glosaryService: GlosaryService) {}

  @Post()
  create(@Body() createGlosaryDto: CreateGlosaryDto, @Req() req: any) {
    const userId = req.user.sub; 
    return this.glosaryService.create({ ...createGlosaryDto, userId });
  }

  @Get()
  findAll() {
    return this.glosaryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.glosaryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateGlosaryDto: UpdateGlosaryDto
  ) {
    return this.glosaryService.update(id, updateGlosaryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.glosaryService.remove(id);
  }
}
