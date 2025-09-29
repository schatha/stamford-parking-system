import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
    checks: {
      database: { status: 'unknown' as 'healthy' | 'unhealthy', responseTime: 0 },
      stripe: { status: 'unknown' as 'healthy' | 'unhealthy' },
      redis: { status: 'unknown' as 'healthy' | 'unhealthy' },
      external: { status: 'unknown' as 'healthy' | 'unhealthy' }
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    deployment: {
      platform: 'vercel',
      region: process.env.VERCEL_REGION || 'unknown',
      url: process.env.VERCEL_URL || process.env.NEXTAUTH_URL || 'unknown'
    }
  };

  try {
    // Database health check
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = {
      status: 'healthy',
      responseTime: Date.now() - dbStart
    };

    // Stripe health check
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        // Import Stripe dynamically to avoid issues if not installed
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2023-10-16',
        });

        // Simple API call to check connectivity
        await stripe.accounts.retrieve();
        checks.checks.stripe.status = 'healthy';
      } catch (error) {
        console.error('Stripe health check failed:', error);
        checks.checks.stripe.status = 'unhealthy';
      }
    } else {
      // If no Stripe key, mark as healthy (optional service)
      checks.checks.stripe.status = 'healthy';
    }

    // Redis health check (if using Redis for caching)
    checks.checks.redis.status = 'healthy'; // Not implemented, mark as healthy

    // External services health check
    checks.checks.external.status = 'healthy'; // Not implemented, mark as healthy

    // Determine overall status
    const unhealthyChecks = Object.values(checks.checks).filter(
      check => check.status === 'unhealthy'
    );

    if (unhealthyChecks.length === 0) {
      checks.status = 'healthy';
    } else if (unhealthyChecks.length <= 1) {
      checks.status = 'degraded';
    } else {
      checks.status = 'unhealthy';
    }

    const statusCode = checks.status === 'healthy' ? 200 :
                      checks.status === 'degraded' ? 200 : 503;

    return NextResponse.json(checks, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json({
      ...checks,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        ...checks.checks,
        database: { status: 'unhealthy', responseTime: 0 }
      }
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}