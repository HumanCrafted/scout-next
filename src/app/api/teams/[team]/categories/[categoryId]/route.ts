import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ team: string; categoryId: string }> }
) {
  try {
    const { team: teamName, categoryId } = await params;
    const { name } = await request.json();

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
        updatedAt: new Date()
      },
      include: {
        icons: {
          orderBy: { displayOrder: 'asc' }
        }
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

    // Prevent deletion of the default "Area" category
    if (category.name === 'Area') {
      return NextResponse.json(
        { message: 'Cannot delete the default Area category' },
        { status: 400 }
      );
    }

    // Check if any markers are using this category
    const markersUsingCategory = await prisma.marker.findMany({
      where: { categoryId: categoryId },
      select: {
        id: true,
        label: true
      }
    });

    if (markersUsingCategory.length > 0) {
      return NextResponse.json(
        { 
          message: `Cannot delete category "${category.name}" because it has ${markersUsingCategory.length} marker${markersUsingCategory.length === 1 ? '' : 's'} on the map. Please remove all markers using this category first.`,
          markersInUse: markersUsingCategory.map(m => m.label)
        },
        { status: 400 }
      );
    }

    // Delete the category (safe to delete since no markers are using it)
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