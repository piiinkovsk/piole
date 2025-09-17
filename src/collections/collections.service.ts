import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AddToCollectionDto } from './dto/add-to-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createCollectionDto: CreateCollectionDto) {
    // Check if user already has collection with this name
    const existingCollection = await this.prisma.collection.findUnique({
      where: {
        userId_name: {
          userId,
          name: createCollectionDto.name,
        },
      },
    });

    if (existingCollection) {
      throw new ConflictException(`Collection with name "${createCollectionDto.name}" already exists`);
    }

    return this.prisma.collection.create({
      data: {
        ...createCollectionDto,
        userId,
      },
    });
  }
  async findAll(userId: string, query: PaginationQueryDto) {
    const { limit = 10, offset = 0, search } = query;
    
    const where = {
      userId,
      ...(search ? {
        name: { contains: search, mode: 'insensitive' as const },
      } : {}),
    };
    
    const [data, total] = await Promise.all([
      this.prisma.collection.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.collection.count({ where }),
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
    const collection = await this.prisma.collection.findFirst({
      where: { 
        id,
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    return collection;
  }

  async update(userId: string, id: string, updateCollectionDto: UpdateCollectionDto) {
    // Check if collection exists and belongs to user
    const existingCollection = await this.prisma.collection.findFirst({
      where: { 
        id,
        userId,
      },
    });

    if (!existingCollection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    // If name is being updated, check for conflicts
    if (updateCollectionDto.name && updateCollectionDto.name !== existingCollection.name) {
      const nameExists = await this.prisma.collection.findUnique({
        where: {
          userId_name: {
            userId,
            name: updateCollectionDto.name,
          },
        },
      });

      if (nameExists) {
        throw new ConflictException(`Collection with name "${updateCollectionDto.name}" already exists`);
      }
    }

    return this.prisma.collection.update({
      where: { id },
      data: updateCollectionDto,
    });
  }

  async remove(userId: string, id: string) {
    // Check if collection exists and belongs to user
    const existingCollection = await this.prisma.collection.findFirst({
      where: { 
        id,
        userId,
      },
    });

    if (!existingCollection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    return this.prisma.collection.delete({
      where: { id },
    });
  }

  async addToCollection(userId: string, collectionId: string, addToCollectionDto: AddToCollectionDto) {
    // Check if collection exists and belongs to user
    const collection = await this.prisma.collection.findFirst({
      where: { 
        id: collectionId,
        userId,
      },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${collectionId} not found`);
    }

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: addToCollectionDto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${addToCollectionDto.productId} not found`);
    }

    // Check if product is already in collection
    const existingItem = await this.prisma.collectionItem.findUnique({
      where: {
        collectionId_productId: {
          collectionId,
          productId: addToCollectionDto.productId,
        },
      },
    });

    if (existingItem) {
      throw new ConflictException('This product is already in the collection');
    }

    return this.prisma.collectionItem.create({
      data: {
        collectionId,
        productId: addToCollectionDto.productId,
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

  async removeFromCollection(userId: string, collectionId: string, itemId: string) {
    // Check if collection exists and belongs to user
    const collection = await this.prisma.collection.findFirst({
      where: { 
        id: collectionId,
        userId,
      },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${collectionId} not found`);
    }

    // Check if item exists and belongs to collection
    const item = await this.prisma.collectionItem.findFirst({
      where: { 
        id: itemId,
        collectionId,
      },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found in collection`);
    }

    return this.prisma.collectionItem.delete({
      where: { id: itemId },
    });
  }
  async getCollectionProducts(userId: string, collectionId: string, query: PaginationQueryDto) {
    const { limit = 10, offset = 0, search } = query;
    
    // Check if collection exists and belongs to user
    const collection = await this.prisma.collection.findFirst({
      where: { 
        id: collectionId,
        userId,
      },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${collectionId} not found`);
    }
    
    // First, get the collection items to find product IDs
    const collectionItems = await this.prisma.collectionItem.findMany({
      where: { collectionId },
      select: { productId: true },
    });
    
    const productIds = collectionItems.map(item => item.productId);
    
    // Now find products with those IDs
    let where: any = { id: { in: productIds } };
    
    // Add search if provided
    if (search) {
      where = {
        ...where,
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      };
    }
    
    const [products, total] = await Promise.all([
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
      data: products,
      meta: { 
        total, 
        limit, 
        offset 
      } 
    };
  }
}
