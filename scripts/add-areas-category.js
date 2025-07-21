const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function addAreasCategory() {
  console.log('Adding AREAS category to teams that need it...');
  
  try {
    // Find all teams
    const teams = await prisma.team.findMany({
      include: {
        markerCategories: true
      }
    });
    
    for (const team of teams) {
      console.log(`Checking team: ${team.name}`);
      
      // Check if team already has Areas category
      const hasAreas = team.markerCategories.some(cat => cat.name === 'Areas');
      
      if (!hasAreas) {
        console.log(`  Creating Areas category for team ${team.name}...`);
        
        // Create Areas category
        const areasCategory = await prisma.markerCategory.create({
          data: {
            teamId: team.id,
            name: 'Areas',
            displayOrder: 0,
          }
        });
        
        // Create numbered icons 1-10
        for (let i = 1; i <= 10; i++) {
          await prisma.categoryIcon.create({
            data: {
              categoryId: areasCategory.id,
              name: `Area ${i}`,
              icon: 'location_on',
              backgroundColor: 'dark',
              isNumbered: true,
              displayOrder: i - 1,
            }
          });
        }
        
        console.log(`  Created Areas category with 10 numbered icons for ${team.name}`);
      } else {
        console.log(`  Team ${team.name} already has Areas category`);
      }
    }
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAreasCategory();