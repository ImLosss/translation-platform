import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateGlosaryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  sourceLanguage: string;

  @IsString()
  @IsNotEmpty()
  targetLanguage: string;
}