import { ParkingZone, ZoneRestrictions, RestrictionCheckResult } from '@/types';
import { format, isWithinInterval, addHours, startOfDay, endOfDay, getDay } from 'date-fns';

export function checkZoneRestrictions(
  zone: ParkingZone,
  requestedStartTime: Date,
  durationHours: number
): RestrictionCheckResult {
  const restrictions: ZoneRestrictions = zone.restrictionsJson || {};
  const requestedEndTime = addHours(requestedStartTime, durationHours);

  const result: RestrictionCheckResult = {
    canPark: true,
    restrictions: [],
    warnings: []
  };

  // Check if there are any time restrictions
  if (!restrictions.timeRestrictions || restrictions.timeRestrictions.length === 0) {
    return result;
  }

  const dayOfWeek = getDay(requestedStartTime);

  for (const restriction of restrictions.timeRestrictions) {
    // Check if restriction applies to this day of the week
    if (!restriction.daysOfWeek.includes(dayOfWeek)) {
      continue;
    }

    const conflictResult = checkTimeConflict(
      requestedStartTime,
      requestedEndTime,
      restriction,
      zone
    );

    if (conflictResult.hasConflict) {
      result.canPark = false;
      result.restrictions.push({
        type: restriction.restrictionType || 'TIME_RESTRICTION',
        description: restriction.description || `Parking restricted ${restriction.startTime}-${restriction.endTime}`,
        activeUntil: conflictResult.restrictionEnd
      });
    }

    // Add warnings for upcoming restrictions
    const warningResult = checkUpcomingRestrictions(
      requestedStartTime,
      requestedEndTime,
      restriction
    );

    if (warningResult.hasWarning) {
      result.warnings = result.warnings || [];
      result.warnings.push({
        type: restriction.restrictionType || 'TIME_RESTRICTION',
        message: warningResult.message,
        warningTime: warningResult.warningTime
      });
    }
  }

  return result;
}

function checkTimeConflict(
  requestedStart: Date,
  requestedEnd: Date,
  restriction: ZoneRestrictions['timeRestrictions'][0],
  zone: ParkingZone
) {
  const today = startOfDay(requestedStart);

  // Parse restriction times (assuming format like "08:00" or "14:30")
  const [startHour, startMinute] = restriction.startTime.split(':').map(Number);
  const [endHour, endMinute] = restriction.endTime.split(':').map(Number);

  const restrictionStart = new Date(today);
  restrictionStart.setHours(startHour, startMinute, 0, 0);

  const restrictionEnd = new Date(today);
  restrictionEnd.setHours(endHour, endMinute, 0, 0);

  // Handle restrictions that cross midnight
  if (restrictionEnd < restrictionStart) {
    restrictionEnd.setDate(restrictionEnd.getDate() + 1);
  }

  // Check if the requested parking period overlaps with the restriction
  const hasConflict = (
    (requestedStart >= restrictionStart && requestedStart < restrictionEnd) ||
    (requestedEnd > restrictionStart && requestedEnd <= restrictionEnd) ||
    (requestedStart < restrictionStart && requestedEnd > restrictionEnd)
  );

  return {
    hasConflict,
    restrictionEnd
  };
}

function checkUpcomingRestrictions(
  requestedStart: Date,
  requestedEnd: Date,
  restriction: ZoneRestrictions['timeRestrictions'][0]
) {
  const today = startOfDay(requestedStart);

  const [startHour, startMinute] = restriction.startTime.split(':').map(Number);
  const restrictionStart = new Date(today);
  restrictionStart.setHours(startHour, startMinute, 0, 0);

  // Check if parking will end close to when a restriction begins
  const timeUntilRestriction = restrictionStart.getTime() - requestedEnd.getTime();
  const thirtyMinutesInMs = 30 * 60 * 1000;

  if (timeUntilRestriction > 0 && timeUntilRestriction <= thirtyMinutesInMs) {
    return {
      hasWarning: true,
      message: `${restriction.description || 'Parking restriction'} begins at ${restriction.startTime}`,
      warningTime: restrictionStart
    };
  }

  return { hasWarning: false };
}

export function getNextAvailableTime(
  zone: ParkingZone,
  currentTime: Date = new Date()
): Date | null {
  const restrictions: ZoneRestrictions = zone.restrictionsJson || {};

  if (!restrictions.timeRestrictions || restrictions.timeRestrictions.length === 0) {
    return currentTime;
  }

  // Check next few days for availability
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const checkDate = new Date(currentTime);
    checkDate.setDate(checkDate.getDate() + dayOffset);

    const availableTime = findAvailableTimeOnDay(checkDate, zone, restrictions);
    if (availableTime) {
      return availableTime;
    }
  }

  return null;
}

function findAvailableTimeOnDay(
  date: Date,
  zone: ParkingZone,
  restrictions: ZoneRestrictions
): Date | null {
  const dayOfWeek = getDay(date);
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  // Get all restrictions for this day and sort by start time
  const dayRestrictions = restrictions.timeRestrictions
    .filter(r => r.daysOfWeek.includes(dayOfWeek))
    .map(r => {
      const [startHour, startMinute] = r.startTime.split(':').map(Number);
      const [endHour, endMinute] = r.endTime.split(':').map(Number);

      const start = new Date(dayStart);
      start.setHours(startHour, startMinute, 0, 0);

      const end = new Date(dayStart);
      end.setHours(endHour, endMinute, 0, 0);

      return { ...r, startDateTime: start, endDateTime: end };
    })
    .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());

  // If no restrictions today, parking is available now (or at day start if in the past)
  if (dayRestrictions.length === 0) {
    return date > dayStart ? date : dayStart;
  }

  // Check if we can park before the first restriction
  const firstRestriction = dayRestrictions[0];
  if (date < firstRestriction.startDateTime) {
    return date;
  }

  // Find gaps between restrictions
  for (let i = 0; i < dayRestrictions.length - 1; i++) {
    const currentEnd = dayRestrictions[i].endDateTime;
    const nextStart = dayRestrictions[i + 1].startDateTime;

    if (currentEnd < nextStart) {
      // There's a gap - check if it's long enough for minimum parking
      const gapMinutes = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60);
      if (gapMinutes >= 15) { // Minimum 15 minutes parking
        return currentEnd;
      }
    }
  }

  // Check if we can park after the last restriction
  const lastRestriction = dayRestrictions[dayRestrictions.length - 1];
  if (lastRestriction.endDateTime < dayEnd) {
    return lastRestriction.endDateTime;
  }

  return null;
}

export function formatRestrictionMessage(restriction: RestrictionCheckResult['restrictions'][0]): string {
  const typeMessages = {
    RUSH_HOUR: '🚗 No parking during rush hour',
    STREET_CLEANING: '🧹 Street cleaning in progress',
    PERMIT_ONLY: '🅿️ Permit holders only',
    NO_PARKING: '🚫 No parking allowed',
    LOADING_ZONE: '🚛 Loading zone active'
  };

  const baseMessage = typeMessages[restriction.type] || restriction.description;

  if (restriction.activeUntil) {
    return `${baseMessage} until ${format(restriction.activeUntil, 'h:mm a')}`;
  }

  return baseMessage;
}

export function createSampleRestrictions(): ZoneRestrictions {
  return {
    timeRestrictions: [
      {
        startTime: '07:00',
        endTime: '09:00',
        daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
        restrictionType: 'RUSH_HOUR',
        description: 'Morning rush hour - No parking to keep traffic flowing'
      },
      {
        startTime: '16:30',
        endTime: '18:30',
        daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
        restrictionType: 'RUSH_HOUR',
        description: 'Evening rush hour - No parking to keep traffic flowing'
      },
      {
        startTime: '02:00',
        endTime: '06:00',
        daysOfWeek: [2], // Tuesday
        restrictionType: 'STREET_CLEANING',
        description: 'Street cleaning - Move your vehicle or risk a ticket'
      },
      {
        startTime: '02:00',
        endTime: '06:00',
        daysOfWeek: [5], // Friday
        restrictionType: 'STREET_CLEANING',
        description: 'Street cleaning - Move your vehicle or risk a ticket'
      }
    ],
    allowedDuringRestrictions: false
  };
}