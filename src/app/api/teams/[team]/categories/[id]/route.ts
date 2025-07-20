import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ team: string; id: string }> }
) {
  try {
    const { team: teamName, id: categoryId } = await params;
    const { name, icon, backgroundColor } = await request.json();

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

    // Find the category
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

    // Check if new name conflicts with existing categories (excluding current one)
    if (name.trim() !== category.name) {
      const existingCategory = await prisma.markerCategory.findFirst({
        where: {
          teamId: team.id,
          name: name.trim(),
          id: { not: categoryId }
        }
      });

      if (existingCategory) {
        return NextResponse.json(
          { message: 'Category name already exists' },
          { status: 400 }
        );
      }
    }

    // Update the category
    const updatedCategory = await prisma.markerCategory.update({
      where: { id: categoryId },
      data: {
        name: name.trim(),
        icon,
        backgroundColor: backgroundColor || 'light',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ category: updatedCategory });

  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ team: string; id: string }> }
) {
  try {
    const { team: teamName, id: categoryId } = await params;

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

    // Find the category
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

    // Delete the category (markers using this category will have categoryId set to null due to onDelete: SetNull)
    await prisma.markerCategory.delete({
      where: { id: categoryId }
    });

    return NextResponse.json({ message: 'Category deleted successfully' });

  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}