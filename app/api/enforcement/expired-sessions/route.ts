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
    const expiredSince = parseInt(searchParams.get('expired_since') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');

    const now = new Date();
    const cutoffTime = new Date(now.getTime() - (expiredSince * 60 * 1000));

    const where: any = {
      OR: [
        {
          status: 'ACTIVE',
          scheduledEndTime: { lt: cutoffTime }
        },
        {
          status: 'EXPIRED'
        }
      ]
    };

    if (zoneId) {
      where.zoneId = zoneId;
    }

    const sessions = await prisma.parkingSession.findMany({
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
      orderBy: { scheduledEndTime: 'asc' },
      take: Math.min(limit, 100),
    });

    const formattedSessions = sessions.map(session => {
      const endTime = new Date(session.scheduledEndTime);
      const expiredAt = session.status === 'EXPIRED' && session.endTime
        ? new Date(session.endTime)
        : endTime;

      const minutesExpired = Math.max(0, Math.floor((now.getTime() - endTime.getTime()) / (1000 * 60)));
      const violationEligible = minutesExpired >= 5; // 5 minute grace period

      return {
        session_id: session.id,
        license_plate: session.vehicle.licensePlate,
        state: session.vehicle.state,
        zone: {
          zone_number: session.zone.zoneNumber,
          zone_name: session.zone.zoneName,
          address: session.zone.address,
        },
        scheduled_end_time: session.scheduledEndTime.toISOString(),
        expired_at: expiredAt.toISOString(),
        minutes_expired: minutesExpired,
        violation_eligible: violationEligible,
        user: {
          name: session.user?.name || 'Unknown',
          phone: session.user?.phone || null,
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedSessions,
    });

  } catch (error: any) {
    console.error('GET /api/enforcement/expired-sessions error:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch expired sessions' },
      { status: 500 }
    );
  }
}