import { prisma } from '@/lib/db';
import { ParkingSession, ParkingSessionWithDetails, CreateParkingSessionInput, SessionFilters } from '@/types';
import { calculateParkingCost } from '@/lib/utils/calculations';
import { checkZoneRestrictions } from '@/lib/utils/restrictions';
import { addHours } from 'date-fns';

export async function getUserSessions(
  userId: string,
  filters?: SessionFilters
): Promise<ParkingSessionWithDetails[]> {
  const where: any = { userId };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.zoneId) {
    where.zoneId = filters.zoneId;
  }

  return prisma.parkingSession.findMany({
    where,
    include: {
      user: true,
      vehicle: true,
      zone: true,
      transactions: true,
    },
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 50,
    skip: filters?.page ? (filters.page - 1) * (filters.limit || 50) : 0,
  });
}

export async function getSessionById(
  id: string,
  userId?: string
): Promise<ParkingSessionWithDetails | null> {
  const where: any = { id };
  if (userId) {
    where.userId = userId;
  }

  return prisma.parkingSession.findFirst({
    where,
    include: {
      user: true,
      vehicle: true,
      zone: true,
      transactions: true,
    },
  });
}

export async function createParkingSession(
  userId: string,
  data: CreateParkingSessionInput
): Promise<ParkingSession> {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: data.vehicleId, userId },
  });

  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  const zone = await prisma.parkingZone.findUnique({
    where: { id: data.zoneId },
  });

  if (!zone || !zone.isActive) {
    throw new Error('Invalid or inactive parking zone');
  }

  if (data.durationHours > zone.maxDurationHours) {
    throw new Error(`Maximum duration for this zone is ${zone.maxDurationHours} hours`);
  }

  // Check if this specific vehicle already has an active or recent pending session
  const activeSession = await prisma.parkingSession.findFirst({
    where: {
      vehicleId: data.vehicleId,
      status: { in: ['PENDING', 'ACTIVE', 'EXTENDED'] },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (activeSession) {
    if (activeSession.status === 'ACTIVE' || activeSession.status === 'EXTENDED') {
      throw new Error('This vehicle already has an active parking session. Please end the current session before starting a new one.');
    } else if (activeSession.status === 'PENDING') {
      // Check if pending session is recent (within last 10 minutes) or old/abandoned
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      if (activeSession.createdAt > tenMinutesAgo) {
        throw new Error('This vehicle has a pending payment. Please complete or cancel the current session before starting a new one.');
      }
      // If pending session is older than 10 minutes, automatically cancel it
      await prisma.parkingSession.update({
        where: { id: activeSession.id },
        data: { status: 'CANCELLED' },
      });
    }
  }

  // Check zone restrictions
  const startTime = new Date();
  const restrictionCheck = checkZoneRestrictions(zone, startTime, data.durationHours);

  if (!restrictionCheck.canPark) {
    const restrictionMessages = restrictionCheck.restrictions
      .map(r => r.description)
      .join('; ');
    throw new Error(`Cannot park due to restrictions: ${restrictionMessages}`);
  }

  const costs = calculateParkingCost(zone.ratePerHour, data.durationHours);
  const scheduledEndTime = addHours(startTime, data.durationHours);

  return prisma.parkingSession.create({
    data: {
      userId,
      vehicleId: data.vehicleId,
      zoneId: data.zoneId,
      startTime,
      scheduledEndTime,
      durationHours: data.durationHours,
      baseCost: costs.baseCost,
      taxAmount: costs.taxAmount,
      processingFee: costs.processingFee,
      totalCost: costs.totalCost,
      status: 'PENDING',
    },
  });
}

export async function extendParkingSession(
  sessionId: string,
  userId: string,
  additionalHours: number
): Promise<ParkingSession> {
  const session = await prisma.parkingSession.findFirst({
    where: { id: sessionId, userId },
    include: { zone: true },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.status !== 'ACTIVE') {
    throw new Error('Can only extend active sessions');
  }

  const newTotalHours = session.durationHours + additionalHours;
  if (newTotalHours > session.zone.maxDurationHours) {
    throw new Error(`Total duration cannot exceed ${session.zone.maxDurationHours} hours`);
  }

  const additionalCosts = calculateParkingCost(session.zone.ratePerHour, additionalHours);
  const newScheduledEndTime = addHours(session.scheduledEndTime, additionalHours);

  return prisma.parkingSession.update({
    where: { id: sessionId },
    data: {
      durationHours: newTotalHours,
      scheduledEndTime: newScheduledEndTime,
      baseCost: session.baseCost + additionalCosts.baseCost,
      taxAmount: session.taxAmount + additionalCosts.taxAmount,
      processingFee: session.processingFee + additionalCosts.processingFee,
      totalCost: session.totalCost + additionalCosts.totalCost,
      status: 'EXTENDED',
    },
  });
}

export async function updateSessionStatus(
  sessionId: string,
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'
): Promise<ParkingSession> {
  const updateData: any = { status };

  if (status === 'ACTIVE') {
    updateData.startTime = new Date();
  } else if (status === 'COMPLETED' || status === 'EXPIRED') {
    updateData.endTime = new Date();
  }

  return prisma.parkingSession.update({
    where: { id: sessionId },
    data: updateData,
  });
}

export async function getActiveSessions(): Promise<ParkingSessionWithDetails[]> {
  return prisma.parkingSession.findMany({
    where: {
      status: { in: ['PENDING', 'ACTIVE'] },
    },
    include: {
      user: true,
      vehicle: true,
      zone: true,
      transactions: true,
    },
    orderBy: { startTime: 'desc' },
  });
}

export async function getExpiredSessions(): Promise<ParkingSession[]> {
  const now = new Date();

  return prisma.parkingSession.findMany({
    where: {
      status: 'ACTIVE',
      scheduledEndTime: { lt: now },
    },
  });
}

export async function markExpiredSessions(): Promise<number> {
  const expiredSessions = await getExpiredSessions();

  if (expiredSessions.length === 0) {
    return 0;
  }

  await prisma.parkingSession.updateMany({
    where: {
      id: { in: expiredSessions.map(s => s.id) },
    },
    data: {
      status: 'EXPIRED',
      endTime: new Date(),
    },
  });

  return expiredSessions.length;
}