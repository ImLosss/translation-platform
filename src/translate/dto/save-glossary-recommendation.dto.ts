import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, isString, Max, Min, ValidateNested, IsArray } from 'class-validator';
import { IsDifferentFrom } from './is-different.decorator';
import { Type } from 'class-transformer';

class GlossaryEntryDto {
    @IsInt()
    @IsOptional()
    id?: number;

    @IsString()
    @IsNotEmpty()
    source!: string;

    @IsString()
    @IsNotEmpty()
    target!: string;

    @IsString()
    @IsOptional()
    detail!: string;
}

export class SaveGlossaryRecommendationDto {
    @IsInt()
    @IsOptional()
    glosaryId?: number;

    @IsInt()
    @IsOptional()
    translationId?: number;

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

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GlossaryEntryDto) // Penting agar NestJS bisa memvalidasi objek di dalam array
    entries!: GlossaryEntryDto[];
}