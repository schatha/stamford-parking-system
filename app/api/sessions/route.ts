import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/helpers';
import { getUserSessions, createParkingSession } from '@/lib/db/sessions';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const filters = {
      status: searchParams.get('status') || undefined,
      zoneId: searchParams.get('zoneId') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      page: parseInt(searchParams.get('page') || '1'),
    };

    const sessions = await getUserSessions(user.id, filters);

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error: any) {
    console.error('GET /api/sessions error:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { vehicleId, zoneId, durationHours } = body;

    if (!vehicleId || !zoneId || !durationHours) {
      return NextResponse.json(
        { error: 'Vehicle ID, zone ID, and duration are required' },
        { status: 400 }
      );
    }

    const session = await createParkingSession(user.id, {
      vehicleId,
      zoneId,
      durationHours: parseFloat(durationHours),
    });

    return NextResponse.json({
      success: true,
      data: session,
      message: 'Parking session created successfully',
    });
  } catch (error: any) {
    console.error('POST /api/sessions error:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create parking session' },
      { status: 400 }
    );
  }
}