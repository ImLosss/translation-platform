import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { GlossaryEntryService } from './glossary-entry.service';
import { CreateGlossaryEntryDto } from './dto/create-glossary-entry.dto';
import { UpdateGlossaryEntryDto } from './dto/update-glossary-entry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard'; 

@UseGuards(JwtAuthGuard) 
@Controller('glossary-entry')
export class GlossaryEntryController {
  constructor(private readonly glossaryEntryService: GlossaryEntryService) {}

  @Post()
  create(@Body() createGlossaryEntryDto: CreateGlossaryEntryDto) {
    return this.glossaryEntryService.create(createGlossaryEntryDto);
  }

  @Get()
  findAll(@Query('glossaryId') glossaryId?: string) {
    // Memungkinkan pencarian seperti: GET /glossary-entry?glossaryId=1
    const parsedId = glossaryId ? parseInt(glossaryId, 10) : undefined;
    return this.glossaryEntryService.findAll(parsedId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.glossaryEntryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateGlossaryEntryDto: UpdateGlossaryEntryDto) {
    return this.glossaryEntryService.update(id, updateGlossaryEntryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.glossaryEntryService.remove(id);
  }
}