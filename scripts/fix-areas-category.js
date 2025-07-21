const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function fixAreasCategory() {
  console.log('Fixing AREAS category to have single numbered icon instead of multiple...');
  
  try {
    // Find all teams with Areas category
    const teams = await prisma.team.findMany({
      include: {
        markerCategories: {
          where: { name: 'Areas' },
          include: {
            icons: true
          }
        }
      }
    });
    
    for (const team of teams) {
      if (team.markerCategories.length > 0) {
        const areasCategory = team.markerCategories[0];
        console.log(`Fixing Areas category for team: ${team.name}`);
        
        // Delete all existing icons in this category
        await prisma.categoryIcon.deleteMany({
          where: {
            categoryId: areasCategory.id
          }
        });
        
        console.log(`  Deleted ${areasCategory.icons.length} old icons`);
        
        // Create single Area icon
        await prisma.categoryIcon.create({
          data: {
            categoryId: areasCategory.id,
            name: 'Area',
            icon: 'location_on',
            backgroundColor: 'dark',
            isNumbered: true,
            displayOrder: 0,
          }
        });
        
        console.log(`  Created single Area icon for ${team.name}`);
      }
    }
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAreasCategory();