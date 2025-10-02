import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateParkingCost, getRateForLocationType } from '@/lib/utils/calculations';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { additionalHours } = await request.json();
    const resolvedParams = await params;
    const sessionId = resolvedParams.id;

    // Validate input
    console.log('Extension request:', { sessionId, additionalHours });
    if (!additionalHours || additionalHours <= 0) {
      console.log('Invalid additional hours:', additionalHours);
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
      console.log('Session not found:', sessionId);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    console.log('Session found:', {
      id: parkingSession.id,
      status: parkingSession.status,
      userId: parkingSession.userId,
      currentUserId: session.user.id,
      durationHours: parkingSession.durationHours,
      maxDurationHours: parkingSession.zone.maxDurationHours,
      scheduledEndTime: parkingSession.scheduledEndTime
    });

    // Verify ownership
    if (parkingSession.userId !== session.user.id) {
      console.log('Access denied: userId mismatch');
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if session can be extended (allow both ACTIVE and EXTENDED sessions)
    if (parkingSession.status !== 'ACTIVE' && parkingSession.status !== 'EXTENDED') {
      console.log('Session cannot be extended, status:', parkingSession.status);
      return NextResponse.json(
        { error: 'Only active or extended sessions can be extended' },
        { status: 400 }
      );
    }

    // Check if session has expired (demo mode - allow extension up to 24 hours after expiry)
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hour grace period for demo
    console.log('Time check:', {
      now: now.toISOString(),
      scheduledEndTime: parkingSession.scheduledEndTime.toISOString(),
      isExpired: now > parkingSession.scheduledEndTime,
      gracePeriodExpired: parkingSession.scheduledEndTime < twentyFourHoursAgo
    });

    // Allow extending sessions in demo mode - very lenient grace period
    if (parkingSession.scheduledEndTime < twentyFourHoursAgo) {
      console.log('Session has expired beyond demo grace period, cannot extend');
      return NextResponse.json(
        { error: 'Cannot extend session - please start a new parking session' },
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

    // Create payment intent for the extension (demo mode compatible)
    let paymentIntent = null;
    const mockPaymentSuccess = true; // Demo mode - skip real payments

    if (process.env.STRIPE_SECRET_KEY && !mockPaymentSuccess) {
      // Production mode: create real Stripe payment intent
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(extensionCost.totalCost * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          type: 'session_extension',
          sessionId: parkingSession.id,
          additionalHours: additionalHours.toString(),
        },
      });
    } else {
      // Demo mode: create mock payment intent
      paymentIntent = {
        id: `demo_pi_${Date.now()}`,
        status: 'succeeded',
        amount: Math.round(extensionCost.totalCost * 100),
        currency: 'usd',
      };
      console.log('Demo mode: skipping real Stripe payment, using mock payment intent');
    }

    if (mockPaymentSuccess) {
      // Calculate new end time
      // If session has expired, extend from current time; otherwise extend from scheduled end time
      const baseTime = now > parkingSession.scheduledEndTime ? now : parkingSession.scheduledEndTime;
      const newEndTime = new Date(baseTime);
      newEndTime.setTime(newEndTime.getTime() + additionalHours * 60 * 60 * 1000);

      console.log('Extension calculation:', {
        baseTime: baseTime.toISOString(),
        additionalHours,
        newEndTime: newEndTime.toISOString()
      });

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

      // Log the extension activity (removed sessionActivity table dependency)
      console.log('Session extended:', {
        sessionId: parkingSession.id,
        additionalHours,
        extensionCost: extensionCost.totalCost,
        newEndTime: newEndTime.toISOString(),
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