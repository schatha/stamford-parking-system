import { ParkingSessionWithDetails } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

export interface ParkingAnalytics {
  totalSpent: number;
  totalSessions: number;
  totalHours: number;
  averageCostPerSession: number;
  averageDurationPerSession: number;
  mostUsedZones: Array<{
    zoneId: string;
    zoneNumber: string;
    zoneName: string;
    sessionsCount: number;
    totalSpent: number;
    percentage: number;
  }>;
  monthlySpending: Array<{
    month: string;
    amount: number;
    sessions: number;
    hours: number;
  }>;
  weeklyPattern: Array<{
    dayOfWeek: string;
    sessions: number;
    avgDuration: number;
    totalSpent: number;
  }>;
  hourlyPattern: Array<{
    hour: number;
    sessions: number;
    percentage: number;
  }>;
  costSavings?: {
    comparedToDaily: number;
    comparedToMonthly: number;
    message: string;
  };
}

export function calculateParkingAnalytics(sessions: ParkingSessionWithDetails[]): ParkingAnalytics {
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED' || s.status === 'EXPIRED');

  // Basic totals
  const totalSpent = completedSessions.reduce((sum, session) => sum + session.totalCost, 0);
  const totalSessions = completedSessions.length;
  const totalHours = completedSessions.reduce((sum, session) => sum + session.durationHours, 0);

  // Averages
  const averageCostPerSession = totalSessions > 0 ? totalSpent / totalSessions : 0;
  const averageDurationPerSession = totalSessions > 0 ? totalHours / totalSessions : 0;

  // Most used zones
  const zoneUsage = new Map();
  completedSessions.forEach(session => {
    const key = session.zoneId;
    if (!zoneUsage.has(key)) {
      zoneUsage.set(key, {
        zoneId: session.zoneId,
        zoneNumber: session.zone.zoneNumber,
        zoneName: session.zone.zoneName,
        sessionsCount: 0,
        totalSpent: 0
      });
    }
    const zone = zoneUsage.get(key);
    zone.sessionsCount++;
    zone.totalSpent += session.totalCost;
  });

  const mostUsedZones = Array.from(zoneUsage.values())
    .map(zone => ({
      ...zone,
      percentage: totalSessions > 0 ? (zone.sessionsCount / totalSessions) * 100 : 0
    }))
    .sort((a, b) => b.sessionsCount - a.sessionsCount)
    .slice(0, 5);

  // Monthly spending (last 6 months)
  const monthlySpending = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    const monthSessions = completedSessions.filter(session =>
      isWithinInterval(new Date(session.startTime), { start: monthStart, end: monthEnd })
    );

    monthlySpending.push({
      month: format(monthDate, 'MMM yyyy'),
      amount: monthSessions.reduce((sum, s) => sum + s.totalCost, 0),
      sessions: monthSessions.length,
      hours: monthSessions.reduce((sum, s) => sum + s.durationHours, 0)
    });
  }

  // Weekly pattern (day of week analysis)
  const weeklyPattern = Array.from({ length: 7 }, (_, dayIndex) => {
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
    const daySessions = completedSessions.filter(session =>
      new Date(session.startTime).getDay() === dayIndex
    );

    return {
      dayOfWeek: dayName,
      sessions: daySessions.length,
      avgDuration: daySessions.length > 0
        ? daySessions.reduce((sum, s) => sum + s.durationHours, 0) / daySessions.length
        : 0,
      totalSpent: daySessions.reduce((sum, s) => sum + s.totalCost, 0)
    };
  });

  // Hourly pattern
  const hourlyUsage = new Array(24).fill(0);
  completedSessions.forEach(session => {
    const hour = new Date(session.startTime).getHours();
    hourlyUsage[hour]++;
  });

  const hourlyPattern = hourlyUsage.map((count, hour) => ({
    hour,
    sessions: count,
    percentage: totalSessions > 0 ? (count / totalSessions) * 100 : 0
  }));

  // Cost savings calculation
  const costSavings = calculateCostSavings(completedSessions, totalSpent, totalHours);

  return {
    totalSpent,
    totalSessions,
    totalHours,
    averageCostPerSession,
    averageDurationPerSession,
    mostUsedZones,
    monthlySpending,
    weeklyPattern,
    hourlyPattern,
    costSavings
  };
}

function calculateCostSavings(
  sessions: ParkingSessionWithDetails[],
  totalSpent: number,
  totalHours: number
): ParkingAnalytics['costSavings'] {
  if (sessions.length === 0) return undefined;

  // Estimate costs for alternative parking methods
  const averageHourlyRate = 4.00; // Average street parking rate
  const dailyGarageRate = 25.00; // Average daily garage rate
  const monthlyGarageRate = 200.00; // Average monthly garage rate

  // Calculate what user would have spent on daily rates
  const sessionsInMonth = sessions.length;
  const comparedToDaily = (sessionsInMonth * dailyGarageRate) - totalSpent;

  // Calculate compared to monthly pass (assuming user parks frequently)
  const uniqueMonths = new Set(sessions.map(s =>
    format(new Date(s.startTime), 'yyyy-MM')
  )).size;
  const comparedToMonthly = (uniqueMonths * monthlyGarageRate) - totalSpent;

  let message = '';
  if (comparedToDaily > 0) {
    message = `You saved $${comparedToDaily.toFixed(2)} compared to daily garage rates!`;
  } else if (comparedToMonthly > 0) {
    message = `You saved $${comparedToMonthly.toFixed(2)} compared to monthly parking passes!`;
  } else {
    message = 'Smart parking helps you pay only for time used.';
  }

  return {
    comparedToDaily: Math.max(0, comparedToDaily),
    comparedToMonthly: Math.max(0, comparedToMonthly),
    message
  };
}

export function generateInsights(analytics: ParkingAnalytics): Array<{
  type: 'success' | 'info' | 'warning' | 'tip';
  title: string;
  message: string;
  icon: string;
}> {
  const insights = [];

  // Most used zone insight
  if (analytics.mostUsedZones.length > 0) {
    const topZone = analytics.mostUsedZones[0];
    insights.push({
      type: 'info' as const,
      title: 'Favorite Parking Spot',
      message: `You park most often at ${topZone.zoneName} (${topZone.percentage.toFixed(1)}% of sessions)`,
      icon: '🅿️'
    });
  }

  // Cost efficiency insight
  if (analytics.averageCostPerSession > 0) {
    const efficiency = analytics.averageCostPerSession / analytics.averageDurationPerSession;
    insights.push({
      type: 'success' as const,
      title: 'Cost Efficiency',
      message: `You're paying $${efficiency.toFixed(2)} per hour on average`,
      icon: '💰'
    });
  }

  // Weekly pattern insight
  const busiestDay = analytics.weeklyPattern.reduce((prev, curr) =>
    curr.sessions > prev.sessions ? curr : prev
  );
  if (busiestDay.sessions > 0) {
    insights.push({
      type: 'info' as const,
      title: 'Parking Pattern',
      message: `You park most often on ${busiestDay.dayOfWeek}s`,
      icon: '📅'
    });
  }

  // Duration insight
  if (analytics.averageDurationPerSession > 0) {
    const avgHours = Math.floor(analytics.averageDurationPerSession);
    const avgMinutes = Math.round((analytics.averageDurationPerSession % 1) * 60);
    insights.push({
      type: 'tip' as const,
      title: 'Session Length',
      message: `Your average parking session is ${avgHours}h ${avgMinutes}m`,
      icon: '⏱️'
    });
  }

  // Savings insight
  if (analytics.costSavings && analytics.costSavings.comparedToDaily > 0) {
    insights.push({
      type: 'success' as const,
      title: 'Money Saved',
      message: analytics.costSavings.message,
      icon: '🎯'
    });
  }

  return insights;
}