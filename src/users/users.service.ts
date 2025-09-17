import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Check if user with email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create the new user
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash: hashedPassword,
        name: createUserDto.name,
      },
    });

    // Return user without the password hash
    const { passwordHash, ...result } = user;
    return result;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async getUserStats(userId: string) {
    // Get counts of wishlist items and collections
    const [
      wishlistCount,
      collectionsCount,
      topCategories
    ] = await Promise.all([
      this.prisma.wishlistItem.count({
        where: { userId },
      }),
      this.prisma.collection.count({
        where: { userId },
      }),
      // Get top 3 categories from user's wishlist
      this.prisma.$queryRaw`
        SELECT c.name, c.id, COUNT(wi.id) as count
        FROM "WishlistItem" wi
        JOIN "Product" p ON wi."productId" = p.id
        JOIN "Category" c ON p."categoryId" = c.id
        WHERE wi."userId" = ${userId}
        GROUP BY c.id, c.name
        ORDER BY count DESC
        LIMIT 3
      `,
    ]);

    return {
      wishlistCount,
      collectionsCount,
      topCategories,
    };
  }
}
