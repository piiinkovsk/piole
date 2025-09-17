import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCollectionDto {
  @ApiProperty({ example: 'Summer Favorites' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Products I love for summer', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
