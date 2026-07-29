import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}