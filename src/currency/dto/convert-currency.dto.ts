import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class ConvertCurrencyDto {
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  @Length(3, 3)
  @IsNotEmpty()
  from!: string;

  @IsString()
  @Length(3, 3)
  @IsNotEmpty()
  to!: string;
}