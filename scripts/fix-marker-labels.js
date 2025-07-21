const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function fixMarkerLabels() {
  console.log('Fixing marker labels with incorrect format...');
  
  try {
    // Find markers with labels like "Area 2 1" (should be "Area 1")
    const badMarkers = await prisma.marker.findMany({
      where: {
        label: {
          contains: 'Area'
        }
      }
    });
    
    for (const marker of badMarkers) {
      // Check if label has format "Area X Y" (should be "Area Y")
      const match = marker.label.match(/^Area\s+(\d+)\s+(\d+)$/);
      if (match) {
        const correctLabel = `Area ${match[2]}`;
        console.log(`Fixing: "${marker.label}" -> "${correctLabel}"`);
        
        await prisma.marker.update({
          where: { id: marker.id },
          data: { label: correctLabel }
        });
      } else {
        console.log(`Marker label OK: "${marker.label}"`);
      }
    }
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMarkerLabels();