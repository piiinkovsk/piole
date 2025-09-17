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
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AddToCollectionDto } from './dto/add-to-collection.dto';

@ApiTags('collections')
@Controller('collections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @ApiOperation({ summary: 'Create a new collection' })
  @ApiResponse({ status: 201, description: 'Collection created successfully' })
  @ApiResponse({ status: 409, description: 'Collection with this name already exists' })
  @Post()
  create(
    @CurrentUser() user,
    @Body() createCollectionDto: CreateCollectionDto,
  ) {
    return this.collectionsService.create(user.id, createCollectionDto);
  }

  @ApiOperation({ summary: 'Get all collections with pagination and search' })
  @ApiResponse({ status: 200, description: 'Returns all collections' })
  @Get()
  findAll(
    @CurrentUser() user,
    @Query() query: PaginationQueryDto,
  ) {
    return this.collectionsService.findAll(user.id, query);
  }

  @ApiOperation({ summary: 'Get collection by ID' })
  @ApiResponse({ status: 200, description: 'Returns the collection with its items' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  @Get(':id')
  findOne(
    @CurrentUser() user,
    @Param('id') id: string,
  ) {
    return this.collectionsService.findOne(user.id, id);
  }

  @ApiOperation({ summary: 'Update collection' })
  @ApiResponse({ status: 200, description: 'Collection updated successfully' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  @ApiResponse({ status: 409, description: 'Collection with this name already exists' })
  @Patch(':id')
  update(
    @CurrentUser() user,
    @Param('id') id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(user.id, id, updateCollectionDto);
  }

  @ApiOperation({ summary: 'Delete collection' })
  @ApiResponse({ status: 200, description: 'Collection deleted successfully' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  @Delete(':id')
  remove(
    @CurrentUser() user,
    @Param('id') id: string,
  ) {
    return this.collectionsService.remove(user.id, id);
  }

  @ApiOperation({ summary: 'Add product to collection' })
  @ApiResponse({ status: 201, description: 'Product added to collection successfully' })
  @ApiResponse({ status: 404, description: 'Collection or product not found' })
  @ApiResponse({ status: 409, description: 'Product already in collection' })
  @Post(':id/items')
  addToCollection(
    @CurrentUser() user,
    @Param('id') id: string,
    @Body() addToCollectionDto: AddToCollectionDto,
  ) {
    return this.collectionsService.addToCollection(user.id, id, addToCollectionDto);
  }

  @ApiOperation({ summary: 'Remove product from collection' })
  @ApiResponse({ status: 200, description: 'Product removed from collection successfully' })
  @ApiResponse({ status: 404, description: 'Collection or item not found' })
  @Delete(':id/items/:itemId')
  removeFromCollection(
    @CurrentUser() user,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.collectionsService.removeFromCollection(user.id, id, itemId);
  }

  @ApiOperation({ summary: 'Get products in a collection' })
  @ApiResponse({ status: 200, description: 'Returns all products in the collection' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  @Get(':id/products')
  getCollectionProducts(
    @CurrentUser() user,
    @Param('id') id: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.collectionsService.getCollectionProducts(user.id, id, query);
  }
}
