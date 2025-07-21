import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ team: string }> }
) {
  try {
    const { team: teamName } = await params;

    // Find the team
    const team = await prisma.team.findUnique({
      where: { name: teamName },
      include: {
        markerCategories: {
          orderBy: { displayOrder: 'asc' },
          include: {
            icons: {
              orderBy: { displayOrder: 'asc' }
            }
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json(
        { message: 'Team not found' },
        { status: 404 }
      );
    }

    // If team has no categories, create default "Areas" category
    if (team.markerCategories.length === 0) {
      const defaultCategory = await prisma.markerCategory.create({
        data: {
          teamId: team.id,
          name: 'Areas',
          displayOrder: 0,
        },
        include: {
          icons: {
            orderBy: { displayOrder: 'asc' }
          }
        }
      });

      // Create default numbered icons for Areas (1-10)
      for (let i = 1; i <= 10; i++) {
        await prisma.categoryIcon.create({
          data: {
            categoryId: defaultCategory.id,
            name: `Area ${i}`,
            icon: 'location_on',
            backgroundColor: 'dark',
            isNumbered: true,
            displayOrder: i - 1,
          }
        });
      }

      // Refetch the team with the new category and icons
      const updatedTeam = await prisma.team.findUnique({
        where: { name: teamName },
        include: {
          markerCategories: {
            orderBy: { displayOrder: 'asc' },
            include: {
              icons: {
                orderBy: { displayOrder: 'asc' }
              }
            }
          }
        }
      });

      return NextResponse.json({
        categories: updatedTeam?.markerCategories || []
      });
    }

    return NextResponse.json({
      categories: team.markerCategories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ team: string }> }
) {
  try {
    const { team: teamName } = await params;
    const { name, displayOrder } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: 'Category name is required' },
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

    // Check if category name already exists for this team
    const existingCategory = await prisma.markerCategory.findFirst({
      where: {
        teamId: team.id,
        name: name.trim()
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: 'Category name already exists' },
        { status: 400 }
      );
    }

    // Create the category
    const category = await prisma.markerCategory.create({
      data: {
        teamId: team.id,
        name: name.trim(),
        displayOrder: displayOrder ?? 0,
      },
      include: {
        icons: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    return NextResponse.json({ category }, { status: 201 });

  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}