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
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    if (!team) {
      return NextResponse.json(
        { message: 'Team not found' },
        { status: 404 }
      );
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
    const { name, icon, backgroundColor, displayOrder } = await request.json();

    if (!name || !icon) {
      return NextResponse.json(
        { message: 'Name and icon are required' },
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
        icon,
        backgroundColor: backgroundColor || 'light',
        displayOrder: displayOrder ?? 0,
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