import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function verifyAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin-session')?.value;
  return !!sessionToken;
}

export async function GET(_request: NextRequest) {
  try {
    // Verify admin authentication
    if (!(await verifyAdminAuth())) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    // Get overview statistics
    const [
      totalTeams,
      totalMaps,
      totalMarkers,
      totalCategories,
      activeSessions
    ] = await Promise.all([
      prisma.team.count(),
      prisma.map.count(),
      prisma.marker.count(),
      prisma.markerCategory.count(),
      prisma.teamSession.count({
        where: {
          expiresAt: {
            gt: new Date()
          }
        }
      })
    ]);

    // Get team statistics
    const teams = await prisma.team.findMany({
      include: {
        _count: {
          select: {
            maps: true,
            markerCategories: true,
            sessions: {
              where: {
                expiresAt: {
                  gt: new Date()
                }
              }
            }
          }
        },
        maps: {
          include: {
            _count: {
              select: {
                markers: true
              }
            }
          }
        },
        sessions: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const teamStats = teams.map(team => ({
      id: team.id,
      name: team.name,
      displayName: team.displayName,
      maps: team._count.maps,
      markers: team.maps.reduce((total, map) => total + map._count.markers, 0),
      categories: team._count.markerCategories,
      sessions: team._count.sessions,
      lastActivity: team.sessions[0]?.createdAt || null,
      createdAt: team.createdAt,
    }));

    // Get popular categories
    const categories = await prisma.markerCategory.groupBy({
      by: ['name'],
      _count: {
        name: true
      },
      orderBy: {
        _count: {
          name: 'desc'
        }
      },
      take: 10
    });

    const popularCategories = await Promise.all(
      categories.map(async (category) => {
        const teamCount = await prisma.markerCategory.groupBy({
          by: ['teamId'],
          where: {
            name: category.name
          }
        });

        return {
          name: category.name,
          count: category._count.name,
          teams: teamCount.length
        };
      })
    );

    // Get recent activity (simulated - you might want to add an audit log table)
    const recentMaps = await prisma.map.findMany({
      include: {
        team: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    const recentMarkers = await prisma.marker.findMany({
      include: {
        map: {
          include: {
            team: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Combine and sort recent activity
    const recentActivity = [
      ...recentMaps.map(map => ({
        id: map.id,
        teamName: map.team.name,
        teamDisplayName: map.team.displayName,
        action: 'Map Created',
        timestamp: map.createdAt,
        details: map.title
      })),
      ...recentMarkers.map(marker => ({
        id: marker.id,
        teamName: marker.map.team.name,
        teamDisplayName: marker.map.team.displayName,
        action: 'Marker Added',
        timestamp: marker.createdAt,
        details: marker.label
      }))
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    return NextResponse.json({
      success: true,
      overview: {
        totalTeams,
        totalMaps,
        totalMarkers,
        totalCategories,
        activeSessions
      },
      teamStats,
      recentActivity,
      popularCategories
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}