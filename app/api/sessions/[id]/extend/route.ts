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

    const { additionalHours } = await request.json();
    const sessionId = params.id;

    // Validate input
    if (!additionalHours || additionalHours <= 0) {
      return NextResponse.json(
        { error: 'Additional hours must be greater than 0' },
        { status: 400 }
      );
    }

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

    // Check if session can be extended
    if (parkingSession.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Only active sessions can be extended' },
        { status: 400 }
      );
    }

    // Check if session has expired
    const now = new Date();
    if (now > parkingSession.scheduledEndTime) {
      return NextResponse.json(
        { error: 'Cannot extend expired session' },
        { status: 400 }
      );
    }

    // Check zone duration limits
    const newTotalDuration = parkingSession.durationHours + additionalHours;
    if (newTotalDuration > parkingSession.zone.maxDurationHours) {
      return NextResponse.json(
        {
          error: `Total duration would exceed zone maximum of ${parkingSession.zone.maxDurationHours} hours`,
          maxAdditionalHours: parkingSession.zone.maxDurationHours - parkingSession.durationHours
        },
        { status: 400 }
      );
    }

    // Calculate extension cost
    const rate = getRateForLocationType(parkingSession.zone.locationType);
    const extensionCost = calculateParkingCost(rate, additionalHours);

    // Create payment intent for the extension
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(extensionCost.totalCost * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        type: 'session_extension',
        sessionId: parkingSession.id,
        additionalHours: additionalHours.toString(),
      },
    });

    // For demo purposes, we'll simulate automatic payment success
    // In production, this would wait for payment confirmation
    const mockPaymentSuccess = true;

    if (mockPaymentSuccess) {
      // Calculate new end time
      const newEndTime = new Date(parkingSession.scheduledEndTime);
      newEndTime.setTime(newEndTime.getTime() + additionalHours * 60 * 60 * 1000);

      // Update the parking session
      const updatedSession = await prisma.parkingSession.update({
        where: { id: sessionId },
        data: {
          durationHours: newTotalDuration,
          scheduledEndTime: newEndTime,
          baseCost: parkingSession.baseCost + extensionCost.baseCost,
          taxAmount: parkingSession.taxAmount + extensionCost.taxAmount,
          processingFee: parkingSession.processingFee + extensionCost.processingFee,
          totalCost: parkingSession.totalCost + extensionCost.totalCost,
          status: 'EXTENDED',
          updatedAt: now,
        },
        include: {
          user: true,
          vehicle: true,
          zone: true,
          transactions: true,
        },
      });

      // Create transaction record for the extension
      await prisma.transaction.create({
        data: {
          userId: session.user.id,
          sessionId: parkingSession.id,
          stripeTransactionId: paymentIntent.id,
          amount: extensionCost.totalCost,
          status: 'COMPLETED',
        },
      });

      // Log the extension activity
      await prisma.sessionActivity.create({
        data: {
          sessionId: parkingSession.id,
          type: 'EXTENDED',
          description: `Session extended by ${additionalHours} hour(s)`,
          metadata: {
            additionalHours,
            extensionCost: extensionCost.totalCost,
            newEndTime: newEndTime.toISOString(),
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedSession,
        extension: {
          additionalHours,
          cost: extensionCost,
          newEndTime,
        },
        message: 'Session extended successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Payment failed for session extension' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Session extension error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}