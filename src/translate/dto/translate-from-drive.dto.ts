import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, isString, Max, Min } from 'class-validator';
import { IsDifferentFrom } from './is-different.decorator';

export class TranslateFromDriveDto {
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
  videoSource!: string;

  @IsInt()
  @IsOptional()
  @Min(5)
  @Max(50)
  batchSize?: number; 

  @IsInt()
  @IsOptional()
  glossaryId?: number; 
}