export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateLicensePlate(plate: string): boolean {
  const cleaned = plate.replace(/[^A-Z0-9]/gi, '');
  return cleaned.length >= 2 && cleaned.length <= 8;
}

export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned[0] === '1');
}

export function validateZoneNumber(zoneNumber: string): boolean {
  return /^[A-Z0-9]{1,10}$/i.test(zoneNumber);
}


export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validateDuration(duration: number, maxDuration: number): boolean {
  return duration > 0 && duration <= maxDuration && duration % 0.25 === 0;
}

export function validateAmount(amount: number): boolean {
  return amount > 0 && amount <= 10000 && Number.isFinite(amount);
}