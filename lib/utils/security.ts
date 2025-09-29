import rateLimit from 'express-rate-limit';
import { NextRequest } from 'next/server';

export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function validateInput(input: any, maxLength: number = 255): boolean {
  if (typeof input !== 'string') return false;
  if (input.length > maxLength) return false;
  if (input.trim().length === 0) return false;

  // Check for common injection patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /style\s*=/i,
    /expression\s*\(/i,
  ];

  return !dangerousPatterns.some(pattern => pattern.test(input));
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function hashApiKey(key: string): string {
  // Simple hash for API key validation (in production, use crypto.createHash)
  return Buffer.from(key).toString('base64');
}

export function generateSecureToken(): string {
  // Generate a secure random token
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export class SecurityHeaders {
  static apply(headers: Headers): void {
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    if (process.env.NODE_ENV === 'production') {
      headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
  }
}

export function validateEnvironment(): void {
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.NEXTAUTH_SECRET === 'development-secret-change-in-production' &&
      process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET must be changed from default value in production');
  }
}

export function logSecurityEvent(event: string, details: any, request?: NextRequest): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: request?.ip || 'unknown',
    userAgent: request?.headers.get('user-agent') || 'unknown',
  };

  console.warn('SECURITY EVENT:', JSON.stringify(logEntry));

  // In production, you might want to send this to a security monitoring service
}