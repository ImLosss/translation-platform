import { IsString, IsNotEmpty, IsOptional, IsInt, ValidateNested, IsArray } from 'class-validator';
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

    // Pisahkan menjadi Creates, Updates, dan Deletes
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GlossaryEntryDto)
    @IsOptional()
    creates!: GlossaryEntryDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GlossaryEntryDto)
    @IsOptional()
    updates!: GlossaryEntryDto[];

    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    deletes!: number[];
}