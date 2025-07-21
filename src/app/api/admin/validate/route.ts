import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin-session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No admin session found' },
        { status: 401 }
      );
    }

    // For now, we just check if the cookie exists
    // In production, you might want to store sessions in database
    return NextResponse.json({
      success: true,
      authenticated: true,
    });

  } catch (error) {
    console.error('Admin validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}