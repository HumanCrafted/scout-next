import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ team: string; categoryId: string }> }
) {
  try {
    const { team: teamName, categoryId } = await params;

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

    // Find the category and verify it belongs to this team
    const category = await prisma.markerCategory.findFirst({
      where: {
        id: categoryId,
        teamId: team.id
      },
      include: {
        icons: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      icons: category.icons
    });

  } catch (error) {
    console.error('Get category icons error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ team: string; categoryId: string }> }
) {
  try {
    const { team: teamName, categoryId } = await params;
    const { name, icon, backgroundColor, isNumbered, displayOrder } = await request.json();

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

    // Find the category and verify it belongs to this team
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

    // Check if icon name already exists in this category
    const existingIcon = await prisma.categoryIcon.findFirst({
      where: {
        categoryId: categoryId,
        name: name.trim()
      }
    });

    if (existingIcon) {
      return NextResponse.json(
        { message: 'Icon name already exists in this category' },
        { status: 400 }
      );
    }

    // Create the icon
    const categoryIcon = await prisma.categoryIcon.create({
      data: {
        categoryId: categoryId,
        name: name.trim(),
        icon,
        backgroundColor: backgroundColor || 'light',
        isNumbered: isNumbered || false,
        displayOrder: displayOrder ?? 0,
      }
    });

    return NextResponse.json({ icon: categoryIcon }, { status: 201 });

  } catch (error) {
    console.error('Create category icon error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}