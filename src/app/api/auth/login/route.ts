import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { teamName, password } = await request.json();

    if (!teamName || !password) {
      return NextResponse.json(
        { error: 'Team name and password are required' },
        { status: 400 }
      );
    }

    // Find team by name
    const team = await prisma.team.findUnique({
      where: { name: teamName.toLowerCase().trim() }
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, team.passwordHash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save session to database
    await prisma.teamSession.create({
      data: {
        teamId: team.id,
        sessionToken,
        expiresAt,
        userIdentifier: `user-${Date.now()}`, // Simple user tracking
      }
    });

    return NextResponse.json({
      success: true,
      team: {
        name: team.name,
        displayName: team.displayName
      },
      sessionToken,
      expiresAt
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}