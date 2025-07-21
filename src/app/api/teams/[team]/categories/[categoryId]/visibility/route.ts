import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Update category visibility
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ team: string; categoryId: string }> }
) {
  try {
    const { team: teamName, categoryId } = await params;
    const { isVisible } = await request.json();

    if (typeof isVisible !== 'boolean') {
      return NextResponse.json(
        { message: 'isVisible must be a boolean' },
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

    // Verify the category belongs to this team
    const category = await prisma.markerCategory.findFirst({
      where: {
        id: categoryId,
        teamId: team.id
      }
    });

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    // Update visibility
    const updatedCategory = await prisma.markerCategory.update({
      where: { id: categoryId },
      data: { isVisible },
      include: {
        icons: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    return NextResponse.json({
      category: updatedCategory,
      message: 'Category visibility updated successfully'
    });

  } catch (error) {
    console.error('Update category visibility error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}