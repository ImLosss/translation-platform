// src/translate/dto/translate.dto/translate.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { IsValidSrt } from './is-valid-srt.validator';
import { IsDifferentFrom } from './is-different.decorator';

export class TranslateDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsInt()
  @IsNotEmpty()
  providerId!: number;

  @IsString()
  @IsNotEmpty()
  @IsDifferentFrom('targetLang')
  sourceLang!: string;

  @IsString()
  @IsNotEmpty()
  targetLang!: string;

  @IsString()
  @IsNotEmpty()
  @IsValidSrt()
  srtContent!: string;

  @IsInt()
  @IsOptional()
  @Min(5)
  @Max(50)
  batchSize?: number; 

  @IsInt()
  @IsOptional()
  glossaryId?: number; 
}