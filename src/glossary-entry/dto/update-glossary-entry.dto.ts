import { PartialType } from '@nestjs/mapped-types';
import { CreateGlossaryEntryDto } from './create-glossary-entry.dto';

export class UpdateGlossaryEntryDto extends PartialType(CreateGlossaryEntryDto) {}