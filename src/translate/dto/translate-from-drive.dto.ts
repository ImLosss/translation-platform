import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, isString } from 'class-validator';

export enum AiModel {
  OPENAI = 'openai',
  DEEPSEEK = 'deepseek',
}

export class TranslateFromDriveDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsEnum(AiModel)
  @IsNotEmpty()
  model!: AiModel;

  @IsString()
  @IsNotEmpty()
  sourceLang!: string;

  @IsString()
  @IsNotEmpty()
  targetLang!: string;

  @IsString()
  @IsNotEmpty()
  videoSource!: string;

  @IsInt()
  @IsOptional()
  batchSize?: number; 

  @IsInt()
  @IsOptional()
  glossaryId?: number; 
}