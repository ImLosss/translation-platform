import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateGlossaryEntryDto {
  @IsString()
  @IsNotEmpty()
  source: string;

  @IsString()
  @IsNotEmpty()
  target: string;

  @IsString()
  @IsOptional()
  detail?: string;

  @IsInt()
  @IsNotEmpty()
  glossaryId: number; // ID dari glosarium induk
}