// src/translate/dto/translate.dto/translate.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt } from 'class-validator';
import { IsValidSrt } from './is-valid-srt.validator';

export enum AiModel {
  OPENAI = 'openai',
  DEEPSEEK = 'deepseek',
}

export class TranslateDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsEnum(AiModel)
  @IsNotEmpty()
  model: AiModel;

  @IsString()
  @IsNotEmpty()
  sourceLang: string;

  @IsString()
  @IsNotEmpty()
  targetLang: string;

  @IsString()
  @IsNotEmpty()
  @IsValidSrt()
  srtContent: string;

  @IsInt()
  @IsOptional()
  batchProcessingSize?: number; 

  @IsInt()
  @IsOptional()
  glossaryId?: number; 
}