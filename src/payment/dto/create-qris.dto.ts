// src/payment/dto/create-qris.dto.ts
import { IsNumber, IsNotEmpty, Min, IsString, IsIn } from 'class-validator';

export class CreateQrisDto {
    @IsNumber()
    @IsNotEmpty()
    @Min(10000)
    amount!: number;

    @IsString()
    @IsNotEmpty()
    @IsIn(['qris', 'cc'])
    method!: string;
}