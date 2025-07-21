import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Get markers for a map
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mapId = searchParams.get('mapId');

    if (!mapId) {
      return NextResponse.json(
        { error: 'Map ID is required' },
        { status: 400 }
      );
    }

    const markers = await prisma.marker.findMany({
      where: { mapId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ markers });

  } catch (error) {
    console.error('Get markers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new marker
export async function POST(request: NextRequest) {
  try {
    const { 
      mapId, 
      label, 
      lat, 
      lng, 
      type, 
      categoryId,
      categoryIconId,
      zoneNumber, 
      deviceIcon, 
      assetIcon, 
      parentId 
    } = await request.json();

    if (!mapId || !label || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: 'mapId, label, lat, and lng are required' },
        { status: 400 }
      );
    }

    // Verify map exists
    const map = await prisma.map.findUnique({
      where: { id: mapId }
    });

    if (!map) {
      return NextResponse.json(
        { error: 'Map not found' },
        { status: 404 }
      );
    }

    // Calculate position for new marker
    let position = null;
    let childPosition = null;
    
    if (parentId) {
      // This is a child marker - get next childPosition within the parent
      const maxChildPosition = await prisma.marker.findFirst({
        where: { parentId },
        orderBy: { childPosition: 'desc' },
        select: { childPosition: true }
      });
      childPosition = (maxChildPosition?.childPosition || -1) + 1;
    } else {
      // This is a root marker - get next position
      const maxPosition = await prisma.marker.findFirst({
        where: { 
          mapId,
          parentId: null 
        },
        orderBy: { position: 'desc' },
        select: { position: true }
      });
      position = (maxPosition?.position || -1) + 1;
    }

    // Create marker
    const marker = await prisma.marker.create({
      data: {
        mapId,
        label,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        type: type || 'marker', // Default type for backward compatibility
        categoryId,
        categoryIconId,
        zoneNumber: zoneNumber ? parseInt(zoneNumber) : null,
        deviceIcon,
        assetIcon,
        parentId,
        position,
        childPosition
      }
    });

    return NextResponse.json({
      marker,
      message: 'Marker created successfully'
    });

  } catch (error) {
    console.error('Create marker error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}