// src/translate/dto/translate.dto/translate.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { IsValidSrt } from './is-valid-srt.validator';
import { IsDifferentFrom } from './is-different.decorator';

export class TranslateDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsNotEmpty({ message: 'LLM Model is required' })
  @IsInt()
  providerId!: number;

  @IsNotEmpty({ message: 'Source Language is required' })
  @IsString()
  @IsDifferentFrom('targetLang', { message: 'Source Language cannot be the same as Target Language' })
  sourceLang!: string;

  @IsNotEmpty({ message: 'Target Language is required' })
  @IsString()
  targetLang!: string;

  @IsString()
  @IsOptional()
  videoSource?: string;

  @IsNotEmpty({ message: 'SRT Content is required' })
  @IsString()
  @IsValidSrt()
  srtContent!: string;

  @IsNotEmpty({ message: 'Batch Size is required' })
  @IsInt()
  @Min(5)
  @Max(50)
  batchSize!: number; 

  @IsInt()
  @IsOptional()
  glossaryId?: number; 
}