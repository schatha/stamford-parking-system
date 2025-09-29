import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/helpers';
import { getSessionById } from '@/lib/db/sessions';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await requireAuth();
    const { sessionId } = params;

    const session = await getSessionById(sessionId, user.id);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    console.error('GET /api/sessions/[sessionId] error:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await requireAuth();
    const { sessionId } = params;
    const body = await request.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    const session = await getSessionById(sessionId, user.id);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Session is not available for confirmation' },
        { status: 400 }
      );
    }

    // Update session status to ACTIVE and update transaction with Stripe payment intent ID
    const updatedSession = await prisma.parkingSession.update({
      where: { id: sessionId },
      data: { status: 'ACTIVE' },
      include: {
        vehicle: true,
        zone: true,
        user: true,
        transactions: true
      }
    });

    // Update the transaction with Stripe payment intent ID
    if (updatedSession.transactions.length > 0) {
      await prisma.transaction.update({
        where: { id: updatedSession.transactions[0].id },
        data: {
          stripeTransactionId: paymentIntentId,
          status: 'COMPLETED'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedSession,
    });

  } catch (error: any) {
    console.error('POST /api/sessions/[sessionId] error:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to confirm session' },
      { status: 500 }
    );
  }
}