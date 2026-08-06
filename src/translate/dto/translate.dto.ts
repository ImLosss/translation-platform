// src/translate/dto/translate.dto/translate.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt } from 'class-validator';
import { IsValidSrt } from './is-valid-srt.validator';

export class TranslateDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsInt()
  @IsNotEmpty()
  providerId!: number;

  @IsString()
  @IsNotEmpty()
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
  batchSize?: number; 

  @IsInt()
  @IsOptional()
  glossaryId?: number; 
}