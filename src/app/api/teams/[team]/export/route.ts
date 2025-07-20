import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

type MapWithMarkers = {
  id: string;
  title: string;
  centerLat: number | null;
  centerLng: number | null;
  zoom: number | null;
  style: string | null;
  createdAt: Date;
  updatedAt: Date;
  markers: {
    id: string;
    label: string;
    lat: number;
    lng: number;
    type: string;
    zoneNumber: number | null;
    deviceIcon: string | null;
    assetIcon: string | null;
    locked: boolean;
    parentId: string | null;
    position: number | null;
    childPosition: number | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ team: string }> }
) {
  try {
    const { team: teamName } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // Find the team
    const team = await prisma.team.findUnique({
      where: { name: teamName },
      include: {
        maps: {
          include: {
            markers: {
              orderBy: [
                { position: 'asc' },
                { childPosition: 'asc' }
              ]
            }
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json(
        { message: 'Team not found' },
        { status: 404 }
      );
    }

    // Prepare export data
    const exportData: {
      teamName: string;
      exportDate: string;
      maps: MapWithMarkers[];
    } = {
      teamName: team.displayName,
      exportDate: new Date().toISOString(),
      maps: team.maps.map((map: MapWithMarkers) => ({
        id: map.id,
        title: map.title,
        centerLat: map.centerLat,
        centerLng: map.centerLng,
        zoom: map.zoom,
        style: map.style,
        createdAt: map.createdAt,
        updatedAt: map.updatedAt,
        markers: map.markers.map((marker) => ({
          id: marker.id,
          label: marker.label,
          lat: marker.lat,
          lng: marker.lng,
          type: marker.type,
          zoneNumber: marker.zoneNumber,
          deviceIcon: marker.deviceIcon,
          assetIcon: marker.assetIcon,
          locked: marker.locked,
          parentId: marker.parentId,
          position: marker.position,
          childPosition: marker.childPosition,
          createdAt: marker.createdAt,
          updatedAt: marker.updatedAt
        }))
      }))
    };

    // Format based on requested format
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Map Title', 'Marker Label', 'Latitude', 'Longitude', 'Type', 
        'Zone Number', 'Device Icon', 'Asset Icon', 'Locked', 'Parent ID',
        'Position', 'Child Position', 'Created At'
      ].join(',');

      const csvRows = exportData.maps.flatMap((map) =>
        map.markers.map((marker) => [
          `"${map.title}"`,
          `"${marker.label}"`,
          marker.lat,
          marker.lng,
          `"${marker.type}"`,
          marker.zoneNumber || '',
          `"${marker.deviceIcon || ''}"`,
          `"${marker.assetIcon || ''}"`,
          marker.locked,
          `"${marker.parentId || ''}"`,
          marker.position || '',
          marker.childPosition || '',
          `"${marker.createdAt}"`
        ].join(','))
      );

      const csvContent = [csvHeaders, ...csvRows].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="scout-${teamName}-export.csv"`
        }
      });

    } else if (format === 'geojson') {
      // Convert to GeoJSON format
      const features = exportData.maps.flatMap((map) =>
        map.markers.map((marker) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [marker.lng, marker.lat]
          },
          properties: {
            mapTitle: map.title,
            label: marker.label,
            type: marker.type,
            zoneNumber: marker.zoneNumber,
            deviceIcon: marker.deviceIcon,
            assetIcon: marker.assetIcon,
            locked: marker.locked,
            parentId: marker.parentId,
            position: marker.position,
            childPosition: marker.childPosition,
            createdAt: marker.createdAt,
            updatedAt: marker.updatedAt
          }
        }))
      );

      const geojson = {
        type: 'FeatureCollection',
        features
      };

      return NextResponse.json(geojson, {
        headers: {
          'Content-Disposition': `attachment; filename="scout-${teamName}-export.geojson"`
        }
      });

    } else {
      // Default JSON format
      return NextResponse.json(exportData, {
        headers: {
          'Content-Disposition': `attachment; filename="scout-${teamName}-export.json"`
        }
      });
    }

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}