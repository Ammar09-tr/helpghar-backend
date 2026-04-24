import {
  IsEmail, IsString, IsNotEmpty, MinLength,
  IsEnum, IsOptional, Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType } from '../../technicians/schemas/technician.schema';

export class RegisterCustomerDto {
  @ApiProperty({ example: 'Ali Hassan' })
  @IsString() @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'ali@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+923001234567' })
  @IsString() @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Password@123', minLength: 6 })
  @IsString() @MinLength(6)
  password: string;
}

export class RegisterTechnicianDto extends RegisterCustomerDto {
  @ApiProperty({
    example: '36302-1234567-1',
    description: 'CNIC is mandatory for all technicians. Format: XXXXX-XXXXXXX-X',
  })
  @IsString() @IsNotEmpty()
  cnic: string;

  @ApiProperty({ enum: ServiceType, example: ServiceType.ELECTRICIAN })
  @IsEnum(ServiceType)
  skill: ServiceType;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  yearsOfExperience?: number;

  @ApiPropertyOptional({ example: 'Expert in 3-phase wiring and solar installation' })
  @IsOptional() @IsString()
  bio?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'ali@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password@123' })
  @IsString() @IsNotEmpty()
  password: string;
}

export class RegisterAdminDto extends RegisterCustomerDto {
  @ApiProperty({ description: 'Admin secret key from environment' })
  @IsString() @IsNotEmpty()
  secretKey: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'ali@email.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString() @IsNotEmpty()
  token: string;

  @ApiProperty({ minLength: 6 })
  @IsString() @MinLength(6)
  newPassword: string;
}
