import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding production database with essential data only...');

  // Create categories - essential data that should be in production
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

  console.log('Production database seeded with categories!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
