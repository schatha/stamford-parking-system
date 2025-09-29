import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Check if user has enforcement role
    if (user.role !== 'ENFORCEMENT' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Enforcement access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get('zone_id');
    const licensePlate = searchParams.get('license_plate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {
      status: { in: ['ACTIVE', 'PENDING'] },
    };

    if (zoneId) {
      where.zoneId = zoneId;
    }

    if (licensePlate) {
      where.vehicle = {
        licensePlate: { contains: licensePlate.toUpperCase(), mode: 'insensitive' }
      };
    }

    const [sessions, total] = await Promise.all([
      prisma.parkingSession.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
            }
          },
          vehicle: true,
          zone: true,
        },
        orderBy: { startTime: 'desc' },
        take: Math.min(limit, 100),
        skip: offset,
      }),
      prisma.parkingSession.count({ where })
    ]);

    const formattedSessions = sessions.map(session => {
      const now = new Date();
      const endTime = new Date(session.scheduledEndTime);
      const timeRemainingMs = endTime.getTime() - now.getTime();
      const timeRemainingMinutes = Math.max(0, Math.floor(timeRemainingMs / (1000 * 60)));

      return {
        session_id: session.id,
        license_plate: session.vehicle.licensePlate,
        state: session.vehicle.state,
        zone: {
          zone_number: session.zone.zoneNumber,
          zone_name: session.zone.zoneName,
          address: session.zone.address,
        },
        start_time: session.startTime.toISOString(),
        scheduled_end_time: session.scheduledEndTime.toISOString(),
        status: session.status,
        time_remaining_minutes: timeRemainingMinutes,
        cost_paid: session.totalCost,
        user: {
          name: session.user?.name || 'Unknown',
          phone: session.user?.phone || null,
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedSessions,
      pagination: {
        total,
        limit,
        offset
      }
    });

  } catch (error: any) {
    console.error('GET /api/enforcement/active-sessions error:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch active sessions' },
      { status: 500 }
    );
  }
}