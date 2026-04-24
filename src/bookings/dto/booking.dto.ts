import {
  IsString, IsNotEmpty, IsNumber, IsOptional,
  IsEnum, Min, Max, ValidateNested, IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType } from '../../technicians/schemas/technician.schema';

export class LocationDto {
  @ApiProperty({ example: 74.3587 }) @IsNumber() longitude: number;
  @ApiProperty({ example: 31.5204 }) @IsNumber() latitude: number;
  @ApiProperty({ example: 'House 12, Street 5, Gulberg III' }) @IsString() address: string;
  @ApiProperty({ example: 'Lahore' }) @IsString() city: string;
}

export class CreateBookingDto {
  @ApiProperty({ enum: ServiceType }) @IsEnum(ServiceType) serviceType: ServiceType;
  @ApiProperty({ example: 'Fan stopped working, sparking from socket in bedroom', minLength: 10 })
  @IsString() @IsNotEmpty() problemDescription: string;
  @ApiPropertyOptional() @IsOptional() @IsString() customerNote?: string;
  @ApiPropertyOptional() @IsOptional() scheduledFor?: Date;
  @ApiProperty({ type: LocationDto }) @ValidateNested() @Type(() => LocationDto) customerLocation: LocationDto;
}

export class SubmitOfferDto {
  @ApiProperty({ example: 1500, description: 'Quoted price in PKR' })
  @IsNumber() @Min(1) price: number;
  @ApiPropertyOptional({ example: 'I can fix it within 1 hour' })
  @IsOptional() @IsString() note?: string;
}

export class SelectOfferDto {
  @ApiProperty({ description: 'Offer _id to accept' }) @IsString() @IsNotEmpty() offerId: string;
}

export class SetPriceDto {
  @ApiProperty({ example: 1500 }) @IsNumber() @Min(1) quotedPrice: number;
  @ApiPropertyOptional() @IsOptional() @IsString() technicianNote?: string;
}

export class ConfirmCompletionDto {
  @ApiProperty({ example: 1500 }) @IsNumber() @Min(1) finalPrice: number;
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 }) @IsNumber() @Min(1) @Max(5) rating: number;
  @ApiPropertyOptional() @IsOptional() @IsString() review?: string;
}

export class CancelBookingDto {
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}
