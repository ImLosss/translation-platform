import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GlosaryEntryDto {
  @IsNumber()
  id!: number;

  @IsString()
  source!: string;

  @IsString()
  target!: string;

  @IsOptional()
  @IsString()
  detail?: string;
}

export class UpdateGlosaryEntryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GlosaryEntryDto)
  entries!: GlosaryEntryDto[];
}