import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ team: string; categoryId: string; iconId: string }> }
) {
  try {
    const { team: teamName, categoryId, iconId } = await params;
    const { name, icon, backgroundColor, isNumbered } = await request.json();

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

    // Find the icon
    const categoryIcon = await prisma.categoryIcon.findFirst({
      where: {
        id: iconId,
        categoryId: categoryId
      }
    });

    if (!categoryIcon) {
      return NextResponse.json(
        { message: 'Icon not found' },
        { status: 404 }
      );
    }

    // Check if new name conflicts with existing icons (excluding current one)
    if (name.trim() !== categoryIcon.name) {
      const existingIcon = await prisma.categoryIcon.findFirst({
        where: {
          categoryId: categoryId,
          name: name.trim(),
          id: { not: iconId }
        }
      });

      if (existingIcon) {
        return NextResponse.json(
          { message: 'Icon name already exists in this category' },
          { status: 400 }
        );
      }
    }

    // Update the icon
    const updatedIcon = await prisma.categoryIcon.update({
      where: { id: iconId },
      data: {
        name: name.trim(),
        icon,
        backgroundColor: backgroundColor || 'light',
        isNumbered: isNumbered || false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ icon: updatedIcon });

  } catch (error) {
    console.error('Update category icon error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ team: string; categoryId: string; iconId: string }> }
) {
  try {
    const { team: teamName, categoryId, iconId } = await params;

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

    // Find the icon
    const categoryIcon = await prisma.categoryIcon.findFirst({
      where: {
        id: iconId,
        categoryId: categoryId
      }
    });

    if (!categoryIcon) {
      return NextResponse.json(
        { message: 'Icon not found' },
        { status: 404 }
      );
    }

    // Delete the icon (markers using this icon will have categoryIconId set to null due to onDelete: SetNull)
    await prisma.categoryIcon.delete({
      where: { id: iconId }
    });

    return NextResponse.json({ message: 'Icon deleted successfully' });

  } catch (error) {
    console.error('Delete category icon error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}