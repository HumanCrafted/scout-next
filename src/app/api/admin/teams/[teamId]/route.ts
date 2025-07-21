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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    // Verify admin authentication
    if (!(await verifyAdminAuth())) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const { teamId } = await params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        _count: {
          select: {
            maps: true,
            sessions: true,
            markerCategories: true,
          }
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
      success: true,
      team: team,
    });

  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    // Verify admin authentication
    if (!(await verifyAdminAuth())) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const { teamId } = await params;
    const { displayName, password } = await request.json();

    if (!displayName) {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      );
    }

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!existingTeam) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: { displayName: string; passwordHash?: string } = {
      displayName,
    };

    // If password is provided, hash it
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    // Update team
    const team = await prisma.team.update({
      where: { id: teamId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Team updated successfully',
      team: {
        id: team.id,
        name: team.name,
        displayName: team.displayName,
        updatedAt: team.updatedAt,
      },
    });

  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    // Verify admin authentication
    if (!(await verifyAdminAuth())) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const { teamId } = await params;

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!existingTeam) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Delete team (this will cascade delete all related data)
    await prisma.team.delete({
      where: { id: teamId }
    });

    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}