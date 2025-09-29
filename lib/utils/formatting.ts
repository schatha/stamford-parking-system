import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isToday(d)) {
    return `Today at ${format(d, 'h:mm a')}`;
  }

  if (isYesterday(d)) {
    return `Yesterday at ${format(d, 'h:mm a')}`;
  }

  return format(d, 'MMM d, yyyy h:mm a');
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, h:mm a');
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'h:mm a');
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatLicensePlate(plate: string, state: string): string {
  return `${plate.toUpperCase()} (${state.toUpperCase()})`;
}

export function formatZoneDisplay(zoneNumber: string, zoneName?: string): string {
  if (zoneName) {
    return `Zone ${zoneNumber} - ${zoneName}`;
  }
  return `Zone ${zoneNumber}`;
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDuration(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours} hr${wholeHours !== 1 ? 's' : ''}`;
  }

  return `${wholeHours}h ${minutes}m`;
}