import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const resolvedParams = await params;
    const sessionId = resolvedParams.id;

    // Return default notification preferences (demo mode)
    return NextResponse.json({
      success: true,
      preferences: {
        email: true,
        sms: false,
        push: true,
        warningTimes: [15, 5],
      },
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { preferences } = await request.json();
    const resolvedParams = await params;
    const sessionId = resolvedParams.id;

    // Validate the parking session exists and belongs to user
    const parkingSession = await prisma.parkingSession.findUnique({
      where: { id: sessionId },
      select: { userId: true, status: true },
    });

    if (!parkingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (parkingSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Validate preferences
    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Invalid preferences format' },
        { status: 400 }
      );
    }

    const { email, sms, push, warningTimes } = preferences;

    if (typeof email !== 'boolean' || typeof sms !== 'boolean' || typeof push !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid notification method preferences' },
        { status: 400 }
      );
    }

    if (!Array.isArray(warningTimes) || !warningTimes.every(t => typeof t === 'number' && t > 0)) {
      return NextResponse.json(
        { error: 'Invalid warning times format' },
        { status: 400 }
      );
    }

    // Save preferences (demo mode - just return success)
    return NextResponse.json({
      success: true,
      data: { email, sms, push, warningTimes },
      message: 'Notification preferences saved successfully',
    });
  } catch (error) {
    console.error('Save notification preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Demo notification functions (simplified for demo mode)
export async function simulateNotification(sessionId: string, warningMinutes: number) {
  console.log(`Demo notification: Session ${sessionId} expires in ${warningMinutes} minutes`);
  // In production, this would send actual notifications
}