import { TAX_RATE } from './constants';

// Stamford parking rates
export const STAMFORD_RATES = {
  STREET: 1.25, // $1.25/hour for on-street parking
  GARAGE: 1.00, // $1.00/hour for garages
  LOT: 1.00,    // $1.00/hour for lots
  METER: 1.25   // $1.25/hour for meters
} as const;

// Stripe processing fee: 2.9% + $0.30
export function calculateProcessingFee(amount: number): number {
  return Math.round((amount * 0.029 + 0.30) * 100) / 100;
}

export function calculateParkingCost(ratePerHour: number, durationHours: number) {
  const baseCost = ratePerHour * durationHours;
  const taxAmount = baseCost * TAX_RATE;
  const subtotal = baseCost + taxAmount;
  const processingFee = calculateProcessingFee(subtotal);
  const totalCost = subtotal + processingFee;

  return {
    baseCost: Math.round(baseCost * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    processingFee: Math.round(processingFee * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}

export function getRateForLocationType(locationType: string): number {
  switch (locationType) {
    case 'STREET':
      return STAMFORD_RATES.STREET;
    case 'GARAGE':
      return STAMFORD_RATES.GARAGE;
    case 'LOT':
      return STAMFORD_RATES.LOT;
    case 'METER':
      return STAMFORD_RATES.METER;
    default:
      return STAMFORD_RATES.STREET;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDuration(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min`;
  }

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours} hr`;
  }

  return `${wholeHours}h ${minutes}m`;
}

export function getTimeRemaining(endTime: Date): {
  total: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date().getTime();
  const end = endTime.getTime();
  const total = end - now;

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor(total / (1000 * 60 * 60));

  return {
    total,
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
  };
}

export function isSessionExpiring(endTime: Date, warningMinutes: number = 15): boolean {
  const timeRemaining = getTimeRemaining(endTime);
  const totalMinutes = timeRemaining.hours * 60 + timeRemaining.minutes;
  return totalMinutes <= warningMinutes && timeRemaining.total > 0;
}

export function isSessionExpired(endTime: Date): boolean {
  const timeRemaining = getTimeRemaining(endTime);
  return timeRemaining.total <= 0;
}