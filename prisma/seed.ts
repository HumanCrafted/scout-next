import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Masen team
  const hashedPassword = await bcrypt.hash('masen2025', 12);
  
  const masenTeam = await prisma.team.upsert({
    where: { name: 'masen' },
    update: {},
    create: {
      name: 'masen',
      displayName: 'Masen Team',
      passwordHash: hashedPassword,
    },
  });

  console.log(`Created team: ${masenTeam.name}`);

  // Create a default map for Masen team
  const defaultMap = await prisma.map.upsert({
    where: { id: 'default-masen-map' },
    update: {},
    create: {
      id: 'default-masen-map',
      teamId: masenTeam.id,
      title: 'Masen Team Map',
      centerLat: 40.0,
      centerLng: -74.5,
      zoom: 9.0,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
    },
  });

  console.log(`Created default map: ${defaultMap.title}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });