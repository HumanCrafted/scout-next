const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function resetMasenTeam() {
  console.log('Resetting Masen team to completely fresh state...');
  
  try {
    // Find the Masen team
    const team = await prisma.team.findUnique({
      where: { name: 'masen' },
      include: {
        maps: true,
        markerCategories: {
          include: {
            icons: true
          }
        }
      }
    });

    if (!team) {
      console.log('Masen team not found!');
      return;
    }

    console.log(`Found Masen team with ${team.maps.length} maps and ${team.markerCategories.length} categories`);

    // Delete all maps (this will cascade delete all markers due to foreign key constraints)
    if (team.maps.length > 0) {
      console.log('Deleting all maps and their markers...');
      await prisma.map.deleteMany({
        where: {
          teamId: team.id
        }
      });
      console.log(`  Deleted ${team.maps.length} maps and all their markers`);
    }

    // Delete all custom marker categories and their icons
    if (team.markerCategories.length > 0) {
      console.log('Deleting all marker categories and icons...');
      
      // Delete all category icons first (foreign key constraint)
      for (const category of team.markerCategories) {
        if (category.icons.length > 0) {
          await prisma.categoryIcon.deleteMany({
            where: {
              categoryId: category.id
            }
          });
          console.log(`  Deleted ${category.icons.length} icons from category "${category.name}"`);
        }
      }
      
      // Delete all categories
      await prisma.markerCategory.deleteMany({
        where: {
          teamId: team.id
        }
      });
      console.log(`  Deleted ${team.markerCategories.length} categories`);
    }

    // Verify the cleanup
    const cleanTeam = await prisma.team.findUnique({
      where: { name: 'masen' },
      include: {
        maps: true,
        markerCategories: {
          include: {
            icons: true
          }
        }
      }
    });

    console.log('\n✅ Masen team reset complete!');
    console.log(`Maps remaining: ${cleanTeam.maps.length}`);
    console.log(`Categories remaining: ${cleanTeam.markerCategories.length}`);
    console.log('\nThe team will get a fresh "Areas" category with numbered icons when they next access the app.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetMasenTeam();