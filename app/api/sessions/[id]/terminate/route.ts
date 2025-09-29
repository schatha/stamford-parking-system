import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateParkingCost, getRateForLocationType } from '@/lib/utils/calculations';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const sessionId = params.id;
    const now = new Date();

    // Get the parking session with related data
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
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify ownership
    if (parkingSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if session can be terminated
    if (parkingSession.status !== 'ACTIVE' && parkingSession.status !== 'EXTENDED') {
      return NextResponse.json(
        { error: 'Only active sessions can be terminated early' },
        { status: 400 }
      );
    }

    // Check if session has already ended
    if (now > parkingSession.scheduledEndTime) {
      return NextResponse.json(
        { error: 'Session has already expired' },
        { status: 400 }
      );
    }

    // Calculate actual time used and refund
    const startTime = new Date(parkingSession.startTime);
    const timeUsedMs = now.getTime() - startTime.getTime();
    const timeUsedHours = Math.max(0, timeUsedMs / (1000 * 60 * 60));

    // Minimum charge is 30 minutes (0.5 hours)
    const chargeableHours = Math.max(0.5, timeUsedHours);

    // Calculate what should be charged vs what was paid
    const rate = getRateForLocationType(parkingSession.zone.locationType);
    const shouldPayCost = calculateParkingCost(rate, chargeableHours);

    // Calculate refund (base cost + tax only, processing fee is non-refundable)
    const paidSubtotal = parkingSession.baseCost + parkingSession.taxAmount;
    const shouldPaySubtotal = shouldPayCost.baseCost + shouldPayCost.taxAmount;
    const refundAmount = Math.max(0, paidSubtotal - shouldPaySubtotal);

    // Process refund if applicable
    let refundTransactionId = null;
    if (refundAmount > 0) {
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        // Find the original payment transaction
        const originalTransaction = parkingSession.transactions.find(
          t => t.status === 'COMPLETED' && t.stripeTransactionId
        );

        if (originalTransaction?.stripeTransactionId) {
          // Create refund in Stripe
          const refund = await stripe.refunds.create({
            payment_intent: originalTransaction.stripeTransactionId,
            amount: Math.round(refundAmount * 100), // Convert to cents
            metadata: {
              type: 'early_termination',
              sessionId: parkingSession.id,
              timeUsedHours: timeUsedHours.toString(),
            },
          });

          refundTransactionId = refund.id;

          // Create refund transaction record
          await prisma.transaction.create({
            data: {
              userId: session.user.id,
              sessionId: parkingSession.id,
              stripeTransactionId: refund.id,
              amount: -refundAmount, // Negative amount for refund
              status: 'COMPLETED',
              type: 'REFUND',
            },
          });
        }
      } catch (stripeError) {
        console.error('Stripe refund error:', stripeError);
        // Continue with session termination even if refund fails
        // In production, you might want to handle this differently
      }
    }

    // Update the parking session
    const updatedSession = await prisma.parkingSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        endTime: now,
        actualDurationHours: timeUsedHours,
        updatedAt: now,
      },
      include: {
        user: true,
        vehicle: true,
        zone: true,
        transactions: true,
      },
    });

    // Log the termination activity
    await prisma.sessionActivity.create({
      data: {
        sessionId: parkingSession.id,
        type: 'TERMINATED',
        description: `Session terminated early by user`,
        metadata: {
          timeUsedHours,
          chargeableHours,
          refundAmount,
          refundTransactionId,
          terminatedAt: now.toISOString(),
        },
      },
    });

    // Calculate session summary
    const sessionSummary = {
      originalDuration: parkingSession.durationHours,
      actualTimeUsed: Math.round(timeUsedHours * 100) / 100,
      chargeableTime: chargeableHours,
      originalCost: parkingSession.totalCost,
      finalCost: parkingSession.totalCost - refundAmount,
      refundAmount: Math.round(refundAmount * 100) / 100,
      timeSaved: Math.round((parkingSession.durationHours - timeUsedHours) * 100) / 100,
    };

    return NextResponse.json({
      success: true,
      data: updatedSession,
      summary: sessionSummary,
      message: refundAmount > 0
        ? `Session terminated. Refund of ${refundAmount.toFixed(2)} will be processed.`
        : 'Session terminated successfully.',
    });
  } catch (error) {
    console.error('Session termination error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}