import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSubtitleRowDto {
  @IsInt()
  id!: number;

  @IsNumber()
  sequence!: number;

  @IsString()
  @IsNotEmpty()
  start!: string;

  @IsString()
  @IsNotEmpty()
  end!: string;

  @IsString()
  @IsNotEmpty()
  source!: string;

  @IsString()
  @IsNotEmpty()
  translated!: string;
}

export class UpdateTranslationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSubtitleRowDto)
  lines!: UpdateSubtitleRowDto[];
}