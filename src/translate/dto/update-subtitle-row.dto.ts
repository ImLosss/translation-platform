import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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
  @IsNotEmpty() // Hapus @IsNotEmpty jika translasi boleh dikosongkan
  translated!: string;
}

export class UpdateTranslationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSubtitleRowDto)
  @IsOptional()
  creates!: UpdateSubtitleRowDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSubtitleRowDto)
  @IsOptional()
  updates!: UpdateSubtitleRowDto[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  deletes!: number[];
}