import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateWishlistItemDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ 
    example: 1, 
    description: 'Priority level (0 = low, 1 = medium, 2 = high)', 
    default: 0,
    required: false 
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(2)
  priority?: number;

  @ApiProperty({ 
    example: 'I really want this for my birthday', 
    required: false 
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
