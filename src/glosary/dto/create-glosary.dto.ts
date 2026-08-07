import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { IsDifferentFrom } from './is-different.decorator';

export class CreateGlosaryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @IsDifferentFrom('targetLanguage')
  sourceLanguage!: string;

  @IsString()
  @IsNotEmpty()
  targetLanguage!: string;
}