import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function verifyAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin-session')?.value;
  return !!sessionToken;
}

export async function GET() {
  try {
    // Verify admin authentication
    if (!(await verifyAdminAuth())) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    // Get all teams with counts
    const teams = await prisma.team.findMany({
      include: {
        _count: {
          select: {
            maps: true,
            sessions: {
              where: {
                expiresAt: {
                  gt: new Date()
                }
              }
            },
            markerCategories: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      teams: teams,
    });

  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    if (!(await verifyAdminAuth())) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const { name, displayName, password } = await request.json();

    if (!name || !displayName || !password) {
      return NextResponse.json(
        { error: 'Name, display name, and password are required' },
        { status: 400 }
      );
    }

    // Validate team name format (URL-safe)
    if (!/^[a-z0-9-]+$/.test(name)) {
      return NextResponse.json(
        { error: 'Team name must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Check if team name already exists
    const existingTeam = await prisma.team.findUnique({
      where: { name }
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: 'Team name already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create team
    const team = await prisma.team.create({
      data: {
        name,
        displayName,
        passwordHash,
      }
    });

    // Create default "Area" category with numbered icons
    const areaCategory = await prisma.markerCategory.create({
      data: {
        teamId: team.id,
        name: 'Area',
        displayOrder: 0,
      }
    });

    // Create numbered Area icon (1-10)
    await prisma.categoryIcon.create({
      data: {
        categoryId: areaCategory.id,
        name: 'Area',
        icon: 'location_on',
        backgroundColor: 'dark',
        isNumbered: true,
        displayOrder: 0,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Team created successfully',
      team: {
        id: team.id,
        name: team.name,
        displayName: team.displayName,
        createdAt: team.createdAt,
      },
    });

  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}