import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class TranslateDto {
    @IsString()
    @IsNotEmpty()
    source_language: string;

    @IsString()
    @IsNotEmpty()
    target_language: string;

    @IsString()
    @IsIn(['openai', 'deepseek', 'gemini'])
    model: string;

}