import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/helpers';
import { extendParkingSession } from '@/lib/db/sessions';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await requireAuth();
    const { sessionId } = params;
    const body = await request.json();
    const { additionalHours } = body;

    if (!additionalHours || additionalHours <= 0) {
      return NextResponse.json(
        { error: 'Additional hours must be a positive number' },
        { status: 400 }
      );
    }

    const extendedSession = await extendParkingSession(
      sessionId,
      user.id,
      additionalHours
    );

    return NextResponse.json({
      success: true,
      data: extendedSession,
      message: 'Parking session extended successfully',
    });
  } catch (error: any) {
    console.error('POST /api/sessions/[sessionId]/extend error:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to extend parking session' },
      { status: 400 }
    );
  }
}