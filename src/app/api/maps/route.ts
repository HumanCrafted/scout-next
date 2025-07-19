import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Get team's maps
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamName = searchParams.get('team');

    if (!teamName) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      );
    }

    // Find team
    const team = await prisma.team.findUnique({
      where: { name: teamName },
      include: {
        maps: {
          include: {
            markers: {
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { updatedAt: 'desc' }
        }
      }
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      maps: team.maps
    });

  } catch (error) {
    console.error('Get maps error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new map
export async function POST(request: NextRequest) {
  try {
    const { teamName, title, centerLat, centerLng, zoom, style } = await request.json();

    if (!teamName || !title) {
      return NextResponse.json(
        { error: 'Team name and title are required' },
        { status: 400 }
      );
    }

    // Find team
    const team = await prisma.team.findUnique({
      where: { name: teamName }
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Create map
    const map = await prisma.map.create({
      data: {
        teamId: team.id,
        title,
        centerLat: centerLat || 40.0,
        centerLng: centerLng || -74.5,
        zoom: zoom || 9.0,
        style: style || 'mapbox://styles/mapbox/satellite-streets-v12'
      },
      include: {
        markers: true
      }
    });

    return NextResponse.json({
      map,
      message: 'Map created successfully'
    });

  } catch (error) {
    console.error('Create map error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}