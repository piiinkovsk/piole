import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Prisma } from '@prisma/client';

// Extended pagination query with category filter
export interface ProductQueryDto extends PaginationQueryDto {
  categoryId?: string;
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    // Check if category exists
    const categoryExists = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!categoryExists) {
      throw new NotFoundException(`Category with ID ${createProductDto.categoryId} not found`);
    }

    return this.prisma.product.create({
      data: createProductDto,
      include: {
        category: true,
      },
    });
  }
  async findAll(query: PaginationQueryDto & { categoryId?: string }) {
    const { limit = 10, offset = 0, search, categoryId } = query;
    
    // Build the where condition
    let where: any = {};
    
    // Add search if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Add category filter if provided
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
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

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // If categoryId is provided, check if category exists
    if (updateProductDto.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });

      if (!categoryExists) {
        throw new NotFoundException(`Category with ID ${updateProductDto.categoryId} not found`);
      }
    }

    try {
      return await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
        include: {
          category: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async findTopProducts(limit = 10) {
    // Get products sorted by number of times they appear in wishlists
    const productsWithCount = await this.prisma.$queryRaw`
      SELECT p.*, COUNT(wi."productId") as wishlist_count
      FROM "Product" p
      LEFT JOIN "WishlistItem" wi ON p.id = wi."productId"
      GROUP BY p.id
      ORDER BY wishlist_count DESC
      LIMIT ${limit}
    `;

    return productsWithCount;
  }
}
