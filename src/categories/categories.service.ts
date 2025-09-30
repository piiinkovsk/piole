import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

// Mock data
const mockCategories = [
  {
    id: '1',
    name: 'Foundation',
    description: 'Face makeup products that create an even skin tone base',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Eyeshadow',
    description: 'Products for coloring the eyelids',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Lipstick',
    description: 'Lip color products',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  private categories = [...mockCategories];

  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: createCategoryDto,
      });
    } catch (error) {
      this.logger.warn('Using mock data for create operation', error.message);
      const newCategory = {
        id: Date.now().toString(),
        name: createCategoryDto.name,
        description: createCategoryDto.description || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.categories.push(newCategory);
      return newCategory;
    }
  }

  async findAll() {
    try {
      return await this.prisma.category.findMany();
    } catch (error) {
      this.logger.warn('Using mock data for findAll operation', error.message);
      return this.categories;
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      return category;
    } catch (error) {
      this.logger.warn('Using mock data for findOne operation', error.message);
      const category = this.categories.find((c) => c.id === id);

      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      return category;
    }
  }
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      return await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });
    } catch (error) {
      this.logger.warn('Using mock data for update operation', error.message);
      const index = this.categories.findIndex((c) => c.id === id);

      if (index === -1) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      const updatedCategory = {
        ...this.categories[index],
        ...updateCategoryDto,
        updatedAt: new Date(),
      };

      this.categories[index] = updatedCategory;
      return updatedCategory;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.category.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.warn('Using mock data for remove operation', error.message);
      const index = this.categories.findIndex((c) => c.id === id);

      if (index === -1) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      const deletedCategory = this.categories[index];
      this.categories.splice(index, 1);
      return deletedCategory;
    }
  }
}
