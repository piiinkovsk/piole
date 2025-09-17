import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class PaginationQueryDto {
  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  offset?: number = 0;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  cursor?: string;
}
