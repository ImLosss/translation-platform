// src/translate/dto/translate.dto/translate.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt } from 'class-validator';

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

  @IsInt()
  @IsOptional()
  glossaryId?: number; // Konteks tambahan untuk prompt engineering agar terjemahan lebih akurat
}