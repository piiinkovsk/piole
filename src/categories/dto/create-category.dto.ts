import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Lipstick' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'All types of lip color products', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
