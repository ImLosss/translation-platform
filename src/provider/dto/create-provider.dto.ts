import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ProviderStatus } from "generated/prisma/enums";

export class CreateProviderDto {
    @IsString()
    name!: string;

    @IsString()
    model!: string;

    @IsNumber()
    @IsOptional()
    inputPricing?: number;

    @IsNumber()
    @IsOptional()
    inputCachePricing?: number;

    @IsNumber()
    @IsOptional()
    outputPricing?: number;

    @IsEnum(ProviderStatus)
    @IsOptional()
    status?: ProviderStatus;
}
