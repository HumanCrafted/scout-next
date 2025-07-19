import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Update map
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title } = await request.json();

    // Verify map exists
    const existingMap = await prisma.map.findUnique({
      where: { id }
    });

    if (!existingMap) {
      return NextResponse.json(
        { error: 'Map not found' },
        { status: 404 }
      );
    }

    // Update map
    const map = await prisma.map.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
      }
    });

    return NextResponse.json({
      map,
      message: 'Map updated successfully'
    });

  } catch (error) {
    console.error('Update map error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete map
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify map exists
    const existingMap = await prisma.map.findUnique({
      where: { id }
    });

    if (!existingMap) {
      return NextResponse.json(
        { error: 'Map not found' },
        { status: 404 }
      );
    }

    // Delete map (cascade will handle markers)
    await prisma.map.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Map deleted successfully'
    });

  } catch (error) {
    console.error('Delete map error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}