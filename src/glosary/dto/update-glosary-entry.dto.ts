import { IsArray, IsInt, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
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
  @IsOptional()
  creates!: GlosaryEntryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GlosaryEntryDto)
  @IsOptional()
  updates!: GlosaryEntryDto[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  deletes!: number[];
}