import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { WishlistItemsService } from './wishlist-items.service';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { UpdateWishlistItemDto } from './dto/update-wishlist-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('wishlist-items')
@Controller('wishlist-items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class WishlistItemsController {
  constructor(private readonly wishlistItemsService: WishlistItemsService) {}

  @ApiOperation({ summary: 'Add item to wishlist' })
  @ApiResponse({ status: 201, description: 'Item added to wishlist successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Product already in wishlist' })
  @Post()
  create(
    @CurrentUser() user,
    @Body() createWishlistItemDto: CreateWishlistItemDto,
  ) {
    return this.wishlistItemsService.create(user.id, createWishlistItemDto);
  }

  @ApiOperation({ summary: 'Get all items in wishlist' })
  @ApiResponse({ status: 200, description: 'Returns all wishlist items' })
  @Get()
  findAll(
    @CurrentUser() user,
    @Query() query: PaginationQueryDto,
  ) {
    return this.wishlistItemsService.findAll(user.id, query);
  }

  @ApiOperation({ summary: 'Get wishlist item by ID' })
  @ApiResponse({ status: 200, description: 'Returns the wishlist item' })
  @ApiResponse({ status: 404, description: 'Wishlist item not found' })
  @Get(':id')
  findOne(
    @CurrentUser() user,
    @Param('id') id: string,
  ) {
    return this.wishlistItemsService.findOne(user.id, id);
  }

  @ApiOperation({ summary: 'Update wishlist item' })
  @ApiResponse({ status: 200, description: 'Wishlist item updated successfully' })
  @ApiResponse({ status: 404, description: 'Wishlist item not found' })
  @Patch(':id')
  update(
    @CurrentUser() user,
    @Param('id') id: string,
    @Body() updateWishlistItemDto: UpdateWishlistItemDto,
  ) {
    return this.wishlistItemsService.update(user.id, id, updateWishlistItemDto);
  }

  @ApiOperation({ summary: 'Remove item from wishlist' })
  @ApiResponse({ status: 200, description: 'Item removed from wishlist successfully' })
  @ApiResponse({ status: 404, description: 'Wishlist item not found' })
  @Delete(':id')
  remove(
    @CurrentUser() user,
    @Param('id') id: string,
  ) {
    return this.wishlistItemsService.remove(user.id, id);
  }
}
