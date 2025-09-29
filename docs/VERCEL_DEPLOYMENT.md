# Vercel Deployment Guide

This guide covers deploying the Stamford Parking System to Vercel with external PostgreSQL database integration, environment configuration, and system monitoring.

## Prerequisites

- Vercel account ([vercel.com](https://vercel.com))
- GitHub account and repository
- External PostgreSQL database (Railway, Supabase, or Neon)
- Git installed locally

## 1. Push Code to GitHub Repository

### Create GitHub Repository

1. **Create New Repository on GitHub:**
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name: `stamford-parking-system`
   - Description: `Municipal parking payment system for the City of Stamford`
   - Set to Public or Private as preferred
   - Don't initialize with README (we have existing code)

2. **Connect Local Repository to GitHub:**

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Stamford Parking System

- Complete Next.js parking payment application
- Prisma database schema and migrations
- Mobile-optimized PWA capabilities
- Admin dashboard and user management
- Stripe payment integration
- Comprehensive demo data seeding"

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/stamford-parking-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Repository Setup Best Practices

**Create `.gitignore` (if not exists):**
```gitignore
# Dependencies
node_modules/
.pnpm-debug.log*

# Next.js
.next/
out/

# Production build
dist/
build/

# Environment variables
.env
.env.local
.env.production.local
.env.development.local

# Database
*.db
*.sqlite

# Logs
logs
*.log
npm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Vercel
.vercel
```

**Add Repository Topics:**
- `parking`
- `municipal`
- `nextjs`
- `typescript`
- `prisma`
- `stripe`
- `pwa`
- `vercel`

## 2. Connect Vercel to Repository

### Method 1: Vercel Dashboard (Recommended)

1. **Login to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub account

2. **Import Project:**
   - Click "New Project"
   - Import from GitHub
   - Select `stamford-parking-system` repository
   - Click "Import"

3. **Configure Project Settings:**
   - **Project Name:** `stamford-parking-system`
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd /path/to/stamford-parking-system
vercel

# Follow prompts:
# - Set up and deploy? [Y/n] y
# - Which scope? [your-account]
# - Link to existing project? [y/N] n
# - What's your project's name? stamford-parking-system
# - In which directory is your code located? ./
```

### Repository Integration Features

**Automatic Deployments:**
- Production deployments on `main` branch pushes
- Preview deployments on pull requests
- Instant rollbacks available

**Git Integration:**
- Commit SHA tracking
- Branch-based deployments
- PR preview links

## 3. Configure Environment Variables in Vercel

### Required Environment Variables

**Database Configuration:**
```bash
# PostgreSQL connection (from Railway, Supabase, or Neon)
DATABASE_URL=postgresql://username:password@host:port/database
```

**NextAuth.js Configuration:**
```bash
# Authentication
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters
```

**Stripe Configuration:**
```bash
# Payment processing
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Application Configuration:**
```bash
# Environment
NODE_ENV=production

# Optional: Analytics and monitoring
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SENTRY_DSN=https://your-sentry-dsn
```

### Setting Variables in Vercel Dashboard

1. **Go to Project Settings:**
   - Open your project in Vercel dashboard
   - Click "Settings" tab
   - Click "Environment Variables"

2. **Add Each Variable:**
   - **Name:** `DATABASE_URL`
   - **Value:** `postgresql://...`
   - **Environments:** Production, Preview, Development
   - Click "Save"

3. **Repeat for All Variables:**
   ```
   DATABASE_URL
   NEXTAUTH_URL
   NEXTAUTH_SECRET
   STRIPE_PUBLISHABLE_KEY
   STRIPE_SECRET_KEY
   STRIPE_WEBHOOK_SECRET
   NODE_ENV
   ```

### Setting Variables via CLI

```bash
# Set production environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# Set for all environments
vercel env add STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_SECRET_KEY

# List all environment variables
vercel env ls
```

### Environment Variable Best Practices

**Security:**
- Never commit secrets to Git
- Use different keys for development/production
- Rotate secrets regularly

**Organization:**
```bash
# Group by service
DATABASE_URL=              # Database
NEXTAUTH_URL=              # Authentication
NEXTAUTH_SECRET=           # Authentication
STRIPE_PUBLISHABLE_KEY=    # Payments
STRIPE_SECRET_KEY=         # Payments
STRIPE_WEBHOOK_SECRET=     # Payments
```

## 4. Deploy and Verify

### Initial Deployment

1. **Trigger Deployment:**
   - Push to main branch triggers automatic deployment
   - Or click "Deploy" in Vercel dashboard

2. **Monitor Build Process:**
   - Watch build logs in Vercel dashboard
   - Build typically takes 2-3 minutes

3. **Deployment URL:**
   - Production: `https://stamford-parking-system.vercel.app`
   - Custom domain: Configure in project settings

### Database Setup (External)

Since Vercel doesn't provide databases, use an external provider:

**Option 1: Railway PostgreSQL**
```bash
# Create Railway database
railway new stamford-parking-db
railway add postgresql

# Get DATABASE_URL
railway variables get DATABASE_URL

# Run migrations
railway run npx prisma migrate deploy
railway run npm run db:seed
```

**Option 2: Supabase**
```bash
# Create project at supabase.com
# Get connection string from Settings > Database
# Format: postgresql://postgres:[password]@[host]:5432/postgres

# Run migrations locally with Supabase URL
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npm run db:seed
```

**Option 3: Neon**
```bash
# Create project at neon.tech
# Get connection string from dashboard
# Includes connection pooling

# Run migrations
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npm run db:seed
```

### Verification Steps

**1. Health Check:**
```bash
# Test API health endpoint
curl https://your-app.vercel.app/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

**2. Demo Account Login:**
- Visit: `https://your-app.vercel.app`
- Login with: `user@demo.com` / `demo123`
- Verify dashboard loads correctly

**3. Admin Access:**
- Login with: `admin@demo.com` / `admin123`
- Verify admin dashboard access
- Check parking zones are visible

**4. PWA Installation:**
- Test install prompt on mobile browsers
- Verify offline functionality
- Check service worker registration

**5. Payment Flow (with test Stripe keys):**
- Start parking session
- Complete payment flow
- Verify session creation

### Common Issues and Solutions

**Build Failures:**
```bash
# Check build logs in Vercel dashboard
# Common issues:

# 1. Missing environment variables
Error: Environment variable not found: DATABASE_URL
# Solution: Add all required environment variables

# 2. Database connection during build
Error: Can't reach database server
# Solution: Ensure DATABASE_URL is correct and accessible

# 3. TypeScript errors
Error: Type 'string | undefined' is not assignable
# Solution: Fix TypeScript issues locally first
```

**Runtime Errors:**
```bash
# 1. Database migration needed
Error: Invalid `prisma.user.findFirst()` invocation
# Solution: Run migrations on your database

# 2. Authentication issues
Error: [next-auth][error][JWT_SESSION_ERROR]
# Solution: Check NEXTAUTH_SECRET and NEXTAUTH_URL

# 3. Stripe configuration
Error: No API key provided
# Solution: Verify Stripe environment variables
```

## 5. Create System Health Status Page

### Health Check API Endpoint

Create comprehensive health monitoring:

**Enhanced API Route (`app/api/health/route.ts`):**
```typescript
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
    memory: process.memoryUsage()
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
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        await stripe.accounts.retrieve();
        checks.checks.stripe.status = 'healthy';
      } catch (error) {
        checks.checks.stripe.status = 'unhealthy';
      }
    }

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

    return NextResponse.json(checks, { status: statusCode });

  } catch (error) {
    return NextResponse.json({
      ...checks,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}
```

### Status Dashboard Component

**Create Status Dashboard (`components/status/StatusDashboard.tsx`):**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { CheckCircle, XCircle, AlertCircle, Clock, Database, CreditCard, Server } from 'lucide-react';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: { status: string; responseTime?: number };
    stripe: { status: string };
    redis: { status: string };
    external: { status: string };
  };
  version: string;
  environment: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
}

export function StatusDashboard() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch health status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'unhealthy':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Unable to Load System Status
            </h2>
            <p className="text-red-600">
              Failed to connect to health monitoring service
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
          <p className="text-gray-600">
            Real-time monitoring of Stamford Parking System
          </p>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(health.status)}`}>
            {getStatusIcon(health.status)}
            <span className="ml-2 capitalize">{health.status}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Database</h3>
                <p className="text-sm text-gray-600">PostgreSQL</p>
              </div>
              <div className="flex items-center">
                <Database className="h-8 w-8 text-blue-500 mr-3" />
                {getStatusIcon(health.checks.database.status)}
              </div>
            </div>
            {health.checks.database.responseTime && (
              <p className="text-sm text-gray-500 mt-2">
                Response: {health.checks.database.responseTime}ms
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Payments</h3>
                <p className="text-sm text-gray-600">Stripe</p>
              </div>
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-green-500 mr-3" />
                {getStatusIcon(health.checks.stripe.status)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Application</h3>
                <p className="text-sm text-gray-600">Next.js</p>
              </div>
              <div className="flex items-center">
                <Server className="h-8 w-8 text-purple-500 mr-3" />
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Version: {health.version}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Environment</h3>
                <p className="text-sm text-gray-600">Vercel</p>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {health.environment}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">System Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime</span>
                <span className="font-medium">{formatUptime(health.uptime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Memory Usage</span>
                <span className="font-medium">{formatBytes(health.memory.heapUsed)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Memory</span>
                <span className="font-medium">{formatBytes(health.memory.heapTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Environment</span>
                <span className="font-medium capitalize">{health.environment}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <a
                href="/dashboard"
                className="block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                User Dashboard
              </a>
              <a
                href="/admin"
                className="block px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                Admin Panel
              </a>
              <a
                href="/api/health"
                className="block px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Raw Health Data
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Stamford Parking System • Status page updates every 30 seconds
        </p>
        <p className="mt-1">
          Last system restart: {new Date(Date.now() - health.uptime * 1000).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
```

### Status Page Route

**Status Page Implementation:**
The status page is available at `/status` and provides:
- Real-time system health monitoring
- Service component status (Database, Stripe, Application, Platform)
- System metrics (uptime, memory usage, environment info)
- Quick links to main application areas
- Auto-refresh every 30 seconds

**Access the Status Page:**
- Development: `http://localhost:3000/status`
- Production: `https://your-app.vercel.app/status`

### Health Monitoring Features

**Comprehensive Health Checks:**
- **Database:** PostgreSQL connection and response time
- **Stripe:** Payment service connectivity
- **Application:** Next.js runtime status
- **Platform:** Vercel deployment information

**Status Levels:**
- 🟢 **Healthy:** All systems operational
- 🟡 **Degraded:** Some non-critical issues
- 🔴 **Unhealthy:** Critical system failures

**Auto-Refresh:** Status updates every 30 seconds without page reload

## Deployment Best Practices

### Performance Optimization

**Vercel Configuration (`vercel.json`):**
```json
{
  "build": {
    "env": {
      "ENABLE_EXPERIMENTAL_COREPACK": "1"
    }
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  },
  "regions": ["iad1"],
  "framework": "nextjs"
}
```

**Next.js Configuration (`next.config.js`):**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  poweredByHeader: false,
  compress: true,
  swcMinify: true
};

module.exports = nextConfig;
```

### Security Headers

**Add to `next.config.js`:**
```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};
```

### Database Connection Optimization

**Connection Pooling Setup:**
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?connection_limit=5&pool_timeout=20&connect_timeout=60",
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

## Monitoring and Observability

### Vercel Analytics

**Enable in Vercel Dashboard:**
1. Go to project settings
2. Click "Analytics" tab
3. Enable Web Analytics
4. Add analytics to your app:

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Monitoring

**Add Sentry (Optional):**
```bash
npm install @sentry/nextjs

# Configure sentry.client.config.ts and sentry.server.config.ts
```

### Performance Monitoring

**Web Vitals Tracking:**
```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## Troubleshooting Guide

### Common Deployment Issues

**1. Build Errors:**
```bash
# Error: Module not found
# Solution: Check imports and dependencies
npm install
npm run build  # Test locally first

# Error: Environment variables missing
# Solution: Add all required variables in Vercel dashboard
```

**2. Database Connection Issues:**
```bash
# Error: P1001: Can't reach database server
# Solution: Check DATABASE_URL format and network access

# Error: P2021: Table 'User' does not exist
# Solution: Run migrations on database
npx prisma migrate deploy
```

**3. Authentication Problems:**
```bash
# Error: Invalid session
# Solution: Check NEXTAUTH_SECRET and NEXTAUTH_URL

# NEXTAUTH_URL should match your Vercel deployment URL
NEXTAUTH_URL=https://stamford-parking-system.vercel.app
```

**4. Stripe Integration Issues:**
```bash
# Error: No API key provided
# Solution: Add Stripe environment variables

# For testing:
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Performance Issues

**Slow Database Queries:**
```typescript
// Add database indexes for better performance
// Run in your database:
CREATE INDEX idx_parking_sessions_user_id ON parking_sessions(user_id);
CREATE INDEX idx_parking_sessions_status ON parking_sessions(status);
CREATE INDEX idx_transactions_session_id ON transactions(session_id);
```

**Large Bundle Size:**
```bash
# Analyze bundle size
npm install @next/bundle-analyzer

# Add to next.config.js:
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

## Maintenance and Updates

### Regular Tasks

**1. Dependency Updates:**
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update major versions carefully
npm install package@latest
```

**2. Security Updates:**
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

**3. Database Maintenance:**
```bash
# Regular database backups (if using external provider)
# Monitor database performance
# Review and optimize slow queries
```

### Deployment Automation

**GitHub Actions Workflow (`.github/workflows/deploy.yml`):**
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Quick Reference

### Essential Commands

```bash
# Deployment
vercel                    # Deploy to Vercel
vercel --prod            # Deploy to production
vercel logs              # View deployment logs

# Environment Variables
vercel env ls            # List all environment variables
vercel env add VAR_NAME  # Add environment variable
vercel env rm VAR_NAME   # Remove environment variable

# Domains
vercel domains           # List domains
vercel domains add       # Add custom domain

# Project Management
vercel projects          # List projects
vercel link              # Link local directory to project
vercel inspect           # Get deployment details
```

### Important URLs

**After Deployment:**
- **Application:** `https://stamford-parking-system.vercel.app`
- **Status Page:** `https://stamford-parking-system.vercel.app/status`
- **Health API:** `https://stamford-parking-system.vercel.app/api/health`
- **Admin Panel:** `https://stamford-parking-system.vercel.app/admin`

**Demo Credentials:**
- **Admin:** `admin@demo.com` / `admin123`
- **User:** `user@demo.com` / `demo123`

### Support Resources

- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community:** [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Next.js Documentation:** [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Documentation:** [prisma.io/docs](https://prisma.io/docs)

---

## Summary

This guide provides everything needed to deploy the Stamford Parking System to Vercel:

1. ✅ **GitHub Repository Setup** - Proper Git workflow and repository configuration
2. ✅ **Vercel Integration** - Seamless connection between GitHub and Vercel
3. ✅ **Environment Configuration** - Complete environment variable setup
4. ✅ **Database Integration** - External PostgreSQL provider setup and migrations
5. ✅ **System Monitoring** - Comprehensive health checking and status dashboard
6. ✅ **Production Optimization** - Performance, security, and monitoring best practices

Your Stamford Parking System will be production-ready on Vercel with full monitoring capabilities! 🚀