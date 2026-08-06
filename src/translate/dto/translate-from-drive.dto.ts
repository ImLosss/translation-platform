import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, isString } from 'class-validator';

export class TranslateFromDriveDto {
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
  videoSource!: string;

  @IsInt()
  @IsOptional()
  batchSize?: number; 

  @IsInt()
  @IsOptional()
  glossaryId?: number; 
}