import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export enum Priority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
}

export class CreateWishlistItemDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ enum: Priority, example: Priority.MEDIUM, default: Priority.LOW })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority = Priority.LOW;

  @ApiProperty({ example: 'I want this in the next sale', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
