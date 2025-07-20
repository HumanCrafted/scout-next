import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function seedDefaultCategories() {
  console.log('Seeding default marker categories...');

  // Get all teams
  const teams = await prisma.team.findMany();

  for (const team of teams) {
    console.log(`Creating default categories for team: ${team.name}`);

    // Check if team already has categories
    const existingCategories = await prisma.markerCategory.findMany({
      where: { teamId: team.id }
    });

    if (existingCategories.length === 0) {
      // Create default categories matching current hardcoded ones
      const defaultCategories = [
        {
          name: 'Locations',
          icon: 'place',
          backgroundColor: 'dark',
          displayOrder: 0,
        },
        {
          name: 'Devices',
          icon: 'memory',
          backgroundColor: 'light',
          displayOrder: 1,
        },
        {
          name: 'Assets',
          icon: 'build',
          backgroundColor: 'light',
          displayOrder: 2,
        },
      ];

      for (const category of defaultCategories) {
        await prisma.markerCategory.create({
          data: {
            teamId: team.id,
            ...category,
          },
        });
      }

      console.log(`Created ${defaultCategories.length} categories for ${team.name}`);
    } else {
      console.log(`Team ${team.name} already has ${existingCategories.length} categories`);
    }
  }

  console.log('Default categories seeding completed!');
}

seedDefaultCategories()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });