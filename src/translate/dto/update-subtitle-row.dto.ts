import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSubtitleRowDto {
  @IsInt()
  id!: number;

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