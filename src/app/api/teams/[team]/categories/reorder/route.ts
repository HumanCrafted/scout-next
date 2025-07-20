import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ team: string }> }
) {
  try {
    const { team: teamName } = await params;
    const { categories } = await request.json();

    if (!Array.isArray(categories)) {
      return NextResponse.json(
        { message: 'Categories array is required' },
        { status: 400 }
      );
    }

    // Find the team
    const team = await prisma.team.findUnique({
      where: { name: teamName }
    });

    if (!team) {
      return NextResponse.json(
        { message: 'Team not found' },
        { status: 404 }
      );
    }

    // Update all categories' display orders in a transaction
    await prisma.$transaction(
      categories.map(({ id, displayOrder }) =>
        prisma.markerCategory.update({
          where: { 
            id,
            teamId: team.id // Ensure category belongs to this team
          },
          data: { displayOrder }
        })
      )
    );

    return NextResponse.json({ message: 'Categories reordered successfully' });

  } catch (error) {
    console.error('Reorder categories error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}