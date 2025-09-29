import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/helpers';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Check if user has enforcement role
    if (user.role !== 'ENFORCEMENT' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Enforcement access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { license_plate, state, zone_number } = body;

    if (!license_plate || !state || !zone_number) {
      return NextResponse.json(
        { error: 'license_plate, state, and zone_number are required' },
        { status: 400 }
      );
    }

    // Find the zone
    const zone = await prisma.parkingZone.findFirst({
      where: { zoneNumber: zone_number.toUpperCase() }
    });

    if (!zone) {
      return NextResponse.json({
        success: true,
        valid_session: false,
        error: 'Zone not found'
      });
    }

    // Find active session for this vehicle in this zone
    const session = await prisma.parkingSession.findFirst({
      where: {
        vehicle: {
          licensePlate: license_plate.toUpperCase(),
          state: state.toUpperCase()
        },
        zoneId: zone.id,
        status: { in: ['ACTIVE', 'PENDING'] }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          }
        },
        vehicle: true,
        zone: true,
      },
      orderBy: { startTime: 'desc' }
    });

    if (!session) {
      return NextResponse.json({
        success: true,
        valid_session: false,
        message: 'No active parking session found'
      });
    }

    const now = new Date();
    const endTime = new Date(session.scheduledEndTime);
    const timeRemainingMs = endTime.getTime() - now.getTime();
    const timeRemainingMinutes = Math.max(0, Math.floor(timeRemainingMs / (1000 * 60)));

    const isValid = session.status === 'ACTIVE' && timeRemainingMs > 0;

    return NextResponse.json({
      success: true,
      valid_session: isValid,
      session: {
        session_id: session.id,
        status: session.status,
        start_time: session.startTime.toISOString(),
        scheduled_end_time: session.scheduledEndTime.toISOString(),
        time_remaining_minutes: timeRemainingMinutes,
        paid_amount: session.totalCost
      },
      user: {
        name: session.user?.name || 'Unknown',
        phone: session.user?.phone || null,
        email: session.user?.email || null,
      }
    });

  } catch (error: any) {
    console.error('POST /api/enforcement/validate-session error:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to validate session' },
      { status: 500 }
    );
  }
}