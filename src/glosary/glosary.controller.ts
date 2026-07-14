import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GlosaryService } from './glosary.service';
import { CreateGlosaryDto } from './dto/create-glosary.dto';
import { UpdateGlosaryDto } from './dto/update-glosary.dto';

@Controller('glosary')
export class GlosaryController {
  constructor(private readonly glosaryService: GlosaryService) {}

  @Post()
  create(@Body() createGlosaryDto: CreateGlosaryDto) {
    return this.glosaryService.create(createGlosaryDto);
  }

  @Get()
  findAll() {
    return this.glosaryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.glosaryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGlosaryDto: UpdateGlosaryDto) {
    return this.glosaryService.update(+id, updateGlosaryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.glosaryService.remove(+id);
  }
}
