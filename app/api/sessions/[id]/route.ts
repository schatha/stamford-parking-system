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

    const parkingSession = await prisma.parkingSession.findUnique({
      where: { id: sessionId },
      include: {
        user: true,
        vehicle: true,
        zone: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!parkingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify ownership
    if (parkingSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: parkingSession,
    });

  } catch (error) {
    console.error('GET /api/sessions/[id] error:', error);
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
    console.log('POST /api/sessions/[id] - Session user:', session?.user?.id);

    if (!session?.user?.id) {
      console.error('POST /api/sessions/[id] - No authentication');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const resolvedParams = await params;
    const sessionId = resolvedParams.id;
    const { paymentIntentId } = await request.json();

    console.log('POST /api/sessions/[id] - Session ID:', sessionId, 'Payment Intent:', paymentIntentId);

    if (!paymentIntentId) {
      console.error('POST /api/sessions/[id] - Missing payment intent ID');
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    const parkingSession = await prisma.parkingSession.findUnique({
      where: { id: sessionId },
      include: {
        user: true,
        vehicle: true,
        zone: true,
        transactions: true,
      },
    });

    if (!parkingSession) {
      console.error('POST /api/sessions/[id] - Session not found:', sessionId);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    console.log('POST /api/sessions/[id] - Found session, user:', parkingSession.userId);

    // Verify ownership
    if (parkingSession.userId !== session.user.id) {
      console.error('POST /api/sessions/[id] - Access denied. Session user:', parkingSession.userId, 'Logged in user:', session.user.id);
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update session to active status
    const actualStartTime = new Date();
    const scheduledEndTime = new Date(actualStartTime.getTime() + parkingSession.durationHours * 60 * 60 * 1000);

    console.log('POST /api/sessions/[id] - Updating session to ACTIVE');

    const updatedSession = await prisma.parkingSession.update({
      where: { id: sessionId },
      data: {
        status: 'ACTIVE',
        startTime: actualStartTime,
        scheduledEndTime: scheduledEndTime,
        stripePaymentIntentId: paymentIntentId,
        updatedAt: new Date(),
      },
      include: {
        user: true,
        vehicle: true,
        zone: true,
        transactions: true,
      },
    });

    console.log('POST /api/sessions/[id] - Session updated, creating transaction');

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        sessionId: parkingSession.id,
        stripeTransactionId: paymentIntentId,
        amount: parkingSession.totalCost,
        status: 'COMPLETED',
      },
    });

    console.log('POST /api/sessions/[id] - Success!');

    return NextResponse.json({
      success: true,
      data: updatedSession,
    });

  } catch (error) {
    console.error('POST /api/sessions/[id] error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}