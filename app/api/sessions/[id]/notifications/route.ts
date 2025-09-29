import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const sessionId = params.id;

    // Get notification preferences for this session
    const preferences = await prisma.notificationPreference.findFirst({
      where: {
        userId: session.user.id,
        sessionId: sessionId,
      },
    });

    return NextResponse.json({
      success: true,
      preferences: preferences || {
        email: true,
        sms: false,
        push: true,
        warningTimes: [15, 5],
      },
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { preferences } = await request.json();
    const sessionId = params.id;

    // Validate the parking session exists and belongs to user
    const parkingSession = await prisma.parkingSession.findUnique({
      where: { id: sessionId },
      select: { userId: true, status: true },
    });

    if (!parkingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (parkingSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Validate preferences
    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Invalid preferences format' },
        { status: 400 }
      );
    }

    const { email, sms, push, warningTimes } = preferences;

    if (typeof email !== 'boolean' || typeof sms !== 'boolean' || typeof push !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid notification method preferences' },
        { status: 400 }
      );
    }

    if (!Array.isArray(warningTimes) || !warningTimes.every(t => typeof t === 'number' && t > 0)) {
      return NextResponse.json(
        { error: 'Invalid warning times format' },
        { status: 400 }
      );
    }

    // Upsert notification preferences
    const savedPreferences = await prisma.notificationPreference.upsert({
      where: {
        userId_sessionId: {
          userId: session.user.id,
          sessionId: sessionId,
        },
      },
      update: {
        email,
        sms,
        push,
        warningTimes,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        sessionId: sessionId,
        email,
        sms,
        push,
        warningTimes,
      },
    });

    // Schedule notifications for active sessions
    if (parkingSession.status === 'ACTIVE' || parkingSession.status === 'EXTENDED') {
      await scheduleNotifications(sessionId, savedPreferences);
    }

    return NextResponse.json({
      success: true,
      data: savedPreferences,
      message: 'Notification preferences saved successfully',
    });
  } catch (error) {
    console.error('Save notification preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to schedule notifications
async function scheduleNotifications(sessionId: string, preferences: any) {
  try {
    // Get the parking session
    const session = await prisma.parkingSession.findUnique({
      where: { id: sessionId },
      select: { scheduledEndTime: true, userId: true },
    });

    if (!session) return;

    // Clear existing scheduled notifications for this session
    await prisma.scheduledNotification.deleteMany({
      where: { sessionId: sessionId },
    });

    // Schedule new notifications based on preferences
    const endTime = new Date(session.scheduledEndTime);
    const now = new Date();

    for (const warningMinutes of preferences.warningTimes) {
      const notificationTime = new Date(endTime.getTime() - warningMinutes * 60 * 1000);

      // Only schedule if notification time is in the future
      if (notificationTime > now) {
        await prisma.scheduledNotification.create({
          data: {
            sessionId: sessionId,
            userId: session.userId,
            type: 'EXPIRY_WARNING',
            scheduledFor: notificationTime,
            warningMinutes: warningMinutes,
            email: preferences.email,
            sms: preferences.sms,
            push: preferences.push,
            status: 'SCHEDULED',
          },
        });
      }
    }

    // In a production environment, you would trigger a background job
    // to process these scheduled notifications
    // Notifications scheduled successfully
  } catch (error) {
    console.error('Schedule notifications error:', error);
  }
}

// Demo function to simulate sending notifications
export async function simulateNotification(sessionId: string, warningMinutes: number) {
  try {
    // Get session and user details
    const session = await prisma.parkingSession.findUnique({
      where: { id: sessionId },
      include: {
        user: true,
        vehicle: true,
        zone: true,
      },
    });

    if (!session) return;

    // Get notification preferences
    const preferences = await prisma.notificationPreference.findFirst({
      where: {
        userId: session.userId,
        sessionId: sessionId,
      },
    });

    if (!preferences) return;

    // Create notification record
    await prisma.notification.create({
      data: {
        userId: session.userId,
        sessionId: sessionId,
        type: 'EXPIRY_WARNING',
        title: 'Parking Session Expiring Soon',
        message: `Your parking session in Zone ${session.zone.zoneNumber} expires in ${warningMinutes} minutes.`,
        email: preferences.email,
        sms: preferences.sms,
        push: preferences.push,
        status: 'SENT',
      },
    });

    // In production, this would actually send emails/SMS/push notifications
    // Demo notification sent successfully
  } catch (error) {
    console.error('Simulate notification error:', error);
  }
}