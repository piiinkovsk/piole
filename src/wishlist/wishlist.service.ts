import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { UpdateWishlistItemDto } from './dto/update-wishlist-item.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createWishlistItemDto: CreateWishlistItemDto) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: createWishlistItemDto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${createWishlistItemDto.productId} not found`);
    }

    // Check if product is already in user's wishlist
    const existingItem = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: createWishlistItemDto.productId,
        },
      },
    });

    if (existingItem) {
      throw new ConflictException('This product is already in your wishlist');
    }

    return this.prisma.wishlistItem.create({
      data: {
        ...createWishlistItemDto,
        userId,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, query: PaginationQueryDto) {
    const { limit = 10, offset = 0, search } = query;
    
    // Base where clause with user ID
    let where: any = { userId };
    
    // Add search functionality if search term is provided
    if (search) {
      where = {
        ...where,
        product: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      };
    }
    
    const [data, total] = await Promise.all([
      this.prisma.wishlistItem.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      this.prisma.wishlistItem.count({ where }),
    ]);

    return { 
      data, 
      meta: { 
        total, 
        limit, 
        offset 
      } 
    };
  }

  async findOne(userId: string, id: string) {
    const wishlistItem = await this.prisma.wishlistItem.findFirst({
      where: { 
        id,
        userId,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!wishlistItem) {
      throw new NotFoundException(`Wishlist item with ID ${id} not found`);
    }

    return wishlistItem;
  }

  async update(userId: string, id: string, updateWishlistItemDto: UpdateWishlistItemDto) {
    // Check if wishlist item exists and belongs to user
    const existingItem = await this.prisma.wishlistItem.findFirst({
      where: { 
        id,
        userId,
      },
    });

    if (!existingItem) {
      throw new NotFoundException(`Wishlist item with ID ${id} not found`);
    }

    // If updating product ID, check if new product exists
    if (updateWishlistItemDto.productId) {
      // Check if product exists
      const product = await this.prisma.product.findUnique({
        where: { id: updateWishlistItemDto.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${updateWishlistItemDto.productId} not found`);
      }

      // Check if product is already in user's wishlist
      const duplicateCheck = await this.prisma.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: updateWishlistItemDto.productId,
          },
        },
      });

      if (duplicateCheck && duplicateCheck.id !== id) {
        throw new ConflictException('This product is already in your wishlist');
      }
    }

    return this.prisma.wishlistItem.update({
      where: { id },
      data: updateWishlistItemDto,
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async remove(userId: string, id: string) {
    // Check if wishlist item exists and belongs to user
    const existingItem = await this.prisma.wishlistItem.findFirst({
      where: { 
        id,
        userId,
      },
    });

    if (!existingItem) {
      throw new NotFoundException(`Wishlist item with ID ${id} not found`);
    }

    return this.prisma.wishlistItem.delete({
      where: { id },
    });
  }
}
