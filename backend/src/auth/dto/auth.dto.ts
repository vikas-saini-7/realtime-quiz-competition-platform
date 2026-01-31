import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(['HOST', 'USER'])
  @IsOptional()
  role?: 'HOST' | 'USER';
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
