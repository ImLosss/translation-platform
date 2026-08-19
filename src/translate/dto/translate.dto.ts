// src/translate/dto/translate.dto/translate.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { IsValidSrt } from './is-valid-srt.validator';
import { IsDifferentFrom } from './is-different.decorator';

export class TranslateDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsInt({ message: 'LLM Model must be a valid integer' })
  @IsNotEmpty({ message: 'LLM Model is required' })
  providerId!: number;

  @IsString()
  @IsNotEmpty({ message: 'Source Language is required' })
  @IsDifferentFrom('targetLang', { message: 'Source Language cannot be the same as Target Language' })
  sourceLang!: string;

  @IsString()
  @IsNotEmpty({ message: 'Target Language is required' })
  targetLang!: string;

  @IsString()
  @IsOptional()
  videoSource?: string;

  @IsString()
  @IsNotEmpty({ message: 'SRT Content is required' })
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