import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/helpers';
import { prisma } from '@/lib/db';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const [
      totalRevenue,
      todaysRevenue,
      activeSessions,
      totalSessions,
      recentSessions,
    ] = await Promise.all([
      // Total revenue from completed transactions
      prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),

      // Today's revenue
      prisma.transaction.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
        _sum: { amount: true },
      }),

      // Active sessions count
      prisma.parkingSession.count({
        where: {
          status: { in: ['PENDING', 'ACTIVE'] },
        },
      }),

      // Total sessions count
      prisma.parkingSession.count(),

      // Recent sessions for display
      prisma.parkingSession.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          vehicle: true,
          zone: true,
          transactions: true,
        },
      }),
    ]);

    const stats = {
      totalRevenue: totalRevenue._sum.amount || 0,
      todaysRevenue: todaysRevenue._sum.amount || 0,
      activeSessions,
      totalSessions,
      recentSessions,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('GET /api/admin/stats error:', error);

    if (error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}