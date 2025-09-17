import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Ruby Woo Lipstick' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'MAC' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: 'Matte red lipstick', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 19.99, required: false })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 'USD', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 'https://example.com/product', required: false })
  @IsString()
  @IsOptional()
  productUrl?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}
