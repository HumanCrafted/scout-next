import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ team: string }> }
) {
  try {
    const { team: teamName } = await params;
    const { displayName } = await request.json();

    if (!displayName || displayName.trim().length === 0) {
      return NextResponse.json(
        { message: 'Team name is required' },
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

    // Update team display name
    const updatedTeam = await prisma.team.update({
      where: { id: team.id },
      data: { 
        displayName: displayName.trim(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(
      { 
        message: 'Team name updated successfully',
        team: {
          name: updatedTeam.name,
          displayName: updatedTeam.displayName
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Update team settings error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}