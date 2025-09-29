import { prisma } from '@/lib/db';
import { Transaction } from '@/types';

export async function createTransaction(data: {
  userId: string;
  sessionId: string;
  amount: number;
  stripeTransactionId?: string;
}): Promise<Transaction> {
  return prisma.transaction.create({
    data: {
      userId: data.userId,
      sessionId: data.sessionId,
      amount: data.amount,
      stripeTransactionId: data.stripeTransactionId || null,
      status: 'PENDING',
    },
  });
}

export async function updateTransactionStatus(
  id: string,
  status: 'COMPLETED' | 'FAILED' | 'REFUNDED',
  stripeTransactionId?: string,
  failureReason?: string
): Promise<Transaction> {
  const updateData: any = { status };

  if (stripeTransactionId) {
    updateData.stripeTransactionId = stripeTransactionId;
  }

  if (failureReason) {
    updateData.failureReason = failureReason;
  }

  return prisma.transaction.update({
    where: { id },
    data: updateData,
  });
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  return prisma.transaction.findUnique({
    where: { id },
    include: {
      user: true,
      session: {
        include: {
          vehicle: true,
          zone: true,
        },
      },
    },
  });
}

export async function getTransactionByStripeId(
  stripeTransactionId: string
): Promise<Transaction | null> {
  return prisma.transaction.findFirst({
    where: { stripeTransactionId },
    include: {
      user: true,
      session: {
        include: {
          vehicle: true,
          zone: true,
        },
      },
    },
  });
}

export async function getUserTransactions(
  userId: string,
  limit: number = 50
): Promise<Transaction[]> {
  return prisma.transaction.findMany({
    where: { userId },
    include: {
      session: {
        include: {
          vehicle: true,
          zone: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getSessionTransactions(sessionId: string): Promise<Transaction[]> {
  return prisma.transaction.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTotalRevenue(
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  const where: any = {
    status: 'COMPLETED',
  };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const result = await prisma.transaction.aggregate({
    where,
    _sum: {
      amount: true,
    },
  });

  return result._sum.amount || 0;
}