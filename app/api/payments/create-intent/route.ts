import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/helpers';
import { getSessionById } from '@/lib/db/sessions';
import { createPaymentIntent } from '@/lib/stripe/client';
import { createTransaction } from '@/lib/db/transactions';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await getSessionById(sessionId, user.id);

    if (!session) {
      return NextResponse.json(
        { error: 'Parking session not found' },
        { status: 404 }
      );
    }

    if (session.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Session is not available for payment' },
        { status: 400 }
      );
    }

    const paymentIntent = await createPaymentIntent(session.totalCost, {
      userId: user.id,
      sessionId: session.id,
      vehicleLicense: session.vehicle.licensePlate,
      zoneNumber: session.zone.zoneNumber,
    });

    const transaction = await createTransaction({
      userId: user.id,
      sessionId: session.id,
      amount: session.totalCost,
      stripeTransactionId: paymentIntent.id,
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        transactionId: transaction.id,
        amount: session.totalCost,
      },
    });
  } catch (error: any) {
    console.error('POST /api/payments/create-intent error:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}