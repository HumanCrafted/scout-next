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
      zoneNumber, 
      deviceIcon, 
      assetIcon, 
      parentId 
    } = await request.json();

    if (!mapId || !label || lat === undefined || lng === undefined || !type) {
      return NextResponse.json(
        { error: 'mapId, label, lat, lng, and type are required' },
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

    // Create marker
    const marker = await prisma.marker.create({
      data: {
        mapId,
        label,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        type,
        zoneNumber: zoneNumber ? parseInt(zoneNumber) : null,
        deviceIcon,
        assetIcon,
        parentId
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