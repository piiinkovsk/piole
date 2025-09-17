import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create categories
  const categories = [
    { name: 'Lipstick', description: 'All types of lip color products' },
    { name: 'Foundation', description: 'Face base makeup' },
    { name: 'Eyeshadow', description: 'Eye color products' },
    { name: 'Mascara', description: 'Products for eyelashes' },
    { name: 'Blush', description: 'Cheek color products' },
    { name: 'Skincare', description: 'Products for skin health' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // Create demo user
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash: hashedPassword,
      name: 'Demo User',
    },
  });

  console.log('Seeded demo user:', demoUser.email);
  console.log('Demo password:', password);
  
  // Create some products
  const products = [
    {
      name: 'Ruby Woo',
      brand: 'MAC',
      description: 'Matte red lipstick',
      price: 19.99,
      categoryName: 'Lipstick',
      imageUrl: 'https://via.placeholder.com/300',
    },
    {
      name: 'Double Wear',
      brand: 'Estée Lauder',
      description: 'Long-wearing foundation',
      price: 43.00,
      categoryName: 'Foundation',
      imageUrl: 'https://via.placeholder.com/300',
    },
    {
      name: 'Modern Renaissance',
      brand: 'Anastasia Beverly Hills',
      description: 'Eyeshadow palette',
      price: 45.00,
      categoryName: 'Eyeshadow',
      imageUrl: 'https://via.placeholder.com/300',
    },
    {
      name: 'Better Than Sex',
      brand: 'Too Faced',
      description: 'Volumizing mascara',
      price: 27.00,
      categoryName: 'Mascara',
      imageUrl: 'https://via.placeholder.com/300',
    },
    {
      name: 'Orgasm',
      brand: 'NARS',
      description: 'Peachy pink blush with golden shimmer',
      price: 30.00,
      categoryName: 'Blush',
      imageUrl: 'https://via.placeholder.com/300',
    },
  ];

  for (const product of products) {
    const category = await prisma.category.findUnique({
      where: { name: product.categoryName },
    });

    if (category) {
      await prisma.product.create({
        data: {
          name: product.name,
          brand: product.brand,
          description: product.description,
          price: product.price,
          categoryId: category.id,
          imageUrl: product.imageUrl,
        },
      });
    }
  }

  console.log('Database seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
