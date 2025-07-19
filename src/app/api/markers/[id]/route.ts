import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Update marker
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { 
      label, 
      lat, 
      lng, 
      type, 
      zoneNumber, 
      deviceIcon, 
      assetIcon, 
      locked, 
      parentId 
    } = await request.json();

    // Verify marker exists
    const existingMarker = await prisma.marker.findUnique({
      where: { id }
    });

    if (!existingMarker) {
      return NextResponse.json(
        { error: 'Marker not found' },
        { status: 404 }
      );
    }

    // Update marker
    const marker = await prisma.marker.update({
      where: { id },
      data: {
        ...(label !== undefined && { label }),
        ...(lat !== undefined && { lat: parseFloat(lat) }),
        ...(lng !== undefined && { lng: parseFloat(lng) }),
        ...(type !== undefined && { type }),
        ...(zoneNumber !== undefined && { zoneNumber: zoneNumber ? parseInt(zoneNumber) : null }),
        ...(deviceIcon !== undefined && { deviceIcon }),
        ...(assetIcon !== undefined && { assetIcon }),
        ...(locked !== undefined && { locked }),
        ...(parentId !== undefined && { parentId })
      }
    });

    return NextResponse.json({
      marker,
      message: 'Marker updated successfully'
    });

  } catch (error) {
    console.error('Update marker error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete marker
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify marker exists
    const existingMarker = await prisma.marker.findUnique({
      where: { id }
    });

    if (!existingMarker) {
      return NextResponse.json(
        { error: 'Marker not found' },
        { status: 404 }
      );
    }

    // Delete marker (cascade will handle children)
    await prisma.marker.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Marker deleted successfully'
    });

  } catch (error) {
    console.error('Delete marker error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}