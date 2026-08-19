import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, isString, Max, Min } from 'class-validator';
import { IsDifferentFrom } from './is-different.decorator';

export class TranslateFromDriveDto {
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
  @IsNotEmpty({ message: 'Video Source is required' })
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