# Railway Deployment Guide

This guide covers deploying the Stamford Parking System to Railway.app with PostgreSQL database setup, migrations, and demo data seeding.

## Prerequisites

- Railway account ([railway.app](https://railway.app))
- GitHub repository with your code
- Railway CLI installed (optional but recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

## 1. Create Railway Project and PostgreSQL Database

### Method 1: Using Railway Dashboard (Recommended)

1. **Create New Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your parking-payment repository

2. **Add PostgreSQL Database**
   - In your project dashboard, click "New Service"
   - Select "Database" → "PostgreSQL"
   - Railway will provision a PostgreSQL instance automatically

3. **Connect Database to App**
   - Click on your app service
   - Go to "Variables" tab
   - Railway automatically provides `DATABASE_URL` variable
   - Verify it follows this format:
     ```
     postgresql://username:password@host:port/database
     ```

### Method 2: Using Railway CLI

```bash
# Create new project
railway new parking-payment

# Add PostgreSQL database
railway add postgresql

# Link to GitHub repository
railway link

# Deploy from current directory
railway up
```

### Database Configuration

Your Railway PostgreSQL database will include these automatically configured variables:
- `DATABASE_URL` - Complete connection string
- `PGHOST` - Database host
- `PGPORT` - Database port (usually 5432)
- `PGUSER` - Database username
- `PGPASSWORD` - Database password
- `PGDATABASE` - Database name

## 2. Environment Variables Setup

In your Railway project, configure these environment variables:

### Required Variables

```bash
# Database (automatically provided by Railway)
DATABASE_URL=postgresql://username:password@host:port/database

# NextAuth.js Configuration
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=your-super-secret-key-here

# Stripe Configuration (for payments)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App Configuration
NODE_ENV=production
```

### How to Set Variables in Railway

**Dashboard Method:**
1. Go to your app service in Railway dashboard
2. Click "Variables" tab
3. Add each variable with its value

**CLI Method:**
```bash
# Set individual variables
railway variables set NEXTAUTH_SECRET=your-secret-here
railway variables set STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# Set multiple variables from file
echo "NEXTAUTH_SECRET=your-secret" > .env.railway
echo "STRIPE_PUBLISHABLE_KEY=pk_test_your_key" >> .env.railway
railway variables set --file .env.railway
```

## 3. Database Migrations

### Option 1: Automatic Migration (Recommended)

Add a build script to your `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

Railway will automatically run migrations during deployment.

### Option 2: Manual Migration via CLI

```bash
# Connect to your Railway project
railway link

# Run migrations
railway run npm run db:deploy

# Or run Prisma commands directly
railway run npx prisma migrate deploy
```

### Option 3: One-time Setup Commands

```bash
# Generate Prisma client
railway run npx prisma generate

# Deploy all pending migrations
railway run npx prisma migrate deploy

# Seed database with demo data
railway run npm run db:seed
```

## 4. Seeding Demo Data

The enhanced seed script creates comprehensive demo data for testing and demonstration.

### Seed Script Contents

The `prisma/seed.ts` script creates:

- **2 Demo Users:**
  - `admin@demo.com` / `admin123` (Admin role)
  - `user@demo.com` / `demo123` (User role)

- **10 Parking Zones:**
  - 3 Street parking zones
  - 3 Garage locations
  - 2 Parking lots
  - 2 Meter zones

- **2 Demo Vehicles:**
  - `DEMO123` (Connecticut) - Demo user's Honda Civic
  - `ADMIN99` (Connecticut) - Admin's city vehicle

- **5 Completed Transactions:**
  - Historical parking sessions from the past 5 days
  - Mix of different zones and users
  - All with successful payments

- **2 Active Parking Sessions:**
  - Demo user: Currently parked on Main Street (45 min remaining)
  - Admin user: Currently parked in Harbor Point Garage (3.5 hours remaining)

### Running the Seed Script

**During Initial Deployment:**
```bash
# Railway automatically runs this if build script includes it
npm run build
```

**Manual Seeding:**
```bash
# Via Railway CLI
railway run npm run db:seed

# Or connect directly
railway connect postgresql
# Then run seed script locally with DATABASE_URL
```

**Re-seeding (if needed):**
```bash
# Reset database and re-seed
railway run npx prisma migrate reset --force
railway run npm run db:seed
```

## 5. Deployment Configuration

### Railway Service Configuration

Create a `railway.toml` file in your project root:

```toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
```

### Build Settings

Railway automatically detects Next.js projects. Ensure your `package.json` has:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "dev": "next dev"
  }
}
```

### Domain Configuration

1. **Custom Domain (Optional):**
   - Go to your app service in Railway
   - Click "Settings" → "Domains"
   - Add your custom domain
   - Update `NEXTAUTH_URL` environment variable

2. **Railway Subdomain:**
   - Railway provides a subdomain like `your-app.railway.app`
   - Use this for `NEXTAUTH_URL` if no custom domain

## 6. Monitoring and Maintenance

### Database Monitoring

**View Database Metrics:**
1. Go to PostgreSQL service in Railway dashboard
2. Check "Metrics" tab for:
   - CPU usage
   - Memory usage
   - Connection count
   - Storage usage

**Database Backups:**
- Railway automatically creates daily backups
- Access via "Data" tab in PostgreSQL service
- Download backups if needed

### Application Monitoring

**View Logs:**
```bash
# Via CLI
railway logs

# Via dashboard
# Go to app service → "Deployments" → Click on deployment → "View Logs"
```

**Health Checks:**
Create `/api/health` endpoint to monitor app health:

```typescript
// pages/api/health.ts or app/api/health/route.ts
export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    );
  }
}
```

## 7. Common Deployment Issues

### Database Connection Issues

**Problem:** App can't connect to database
**Solution:**
```bash
# Verify DATABASE_URL format
railway variables get DATABASE_URL

# Test connection
railway run npx prisma db push
```

**Problem:** SSL connection errors
**Solution:** Add to your `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  sslmode  = "require"
}
```

### Migration Issues

**Problem:** Migration conflicts
**Solution:**
```bash
# Reset migrations (WARNING: loses data)
railway run npx prisma migrate reset --force

# Or create new migration
railway run npx prisma migrate dev --name fix-conflicts
railway run npx prisma migrate deploy
```

**Problem:** Schema drift
**Solution:**
```bash
# Push schema changes without migration
railway run npx prisma db push

# Then create migration
railway run npx prisma migrate dev --name schema-sync
```

### Build Failures

**Problem:** Build timeout
**Solution:**
- Increase build timeout in Railway settings
- Optimize build process
- Use `npm ci` instead of `npm install`

**Problem:** Missing dependencies
**Solution:**
```json
{
  "devDependencies": {
    "prisma": "^6.16.2",
    "@types/node": "^20",
    "typescript": "^5"
  }
}
```

## 8. Production Optimizations

### Database Performance

**Connection Pooling:**
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?connection_limit=5&pool_timeout=20",
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Database Indexes:**
```sql
-- Add indexes for common queries
CREATE INDEX idx_parking_sessions_user_id ON parking_sessions(user_id);
CREATE INDEX idx_parking_sessions_status ON parking_sessions(status);
CREATE INDEX idx_parking_sessions_zone_id ON parking_sessions(zone_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
```

### Environment-Specific Configurations

**Production Environment Variables:**
```bash
# Performance
NODE_ENV=production
DATABASE_URL=postgresql://prod-connection-string
PRISMA_CLIENT_ENGINE_TYPE=binary

# Security
NEXTAUTH_SECRET=production-secret-minimum-32-characters
NEXTAUTH_URL=https://your-production-domain.com

# Monitoring
LOG_LEVEL=error
SENTRY_DSN=your-sentry-dsn
```

## 9. Backup and Recovery

### Manual Backup

```bash
# Create database backup
railway connect postgresql
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
railway run psql $DATABASE_URL < backup-20241129.sql
```

### Automated Backups

Railway provides automatic backups, but for additional safety:

```bash
# Add to GitHub Actions or Railway cron
name: Database Backup
on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: |
          railway connect postgresql --json | jq -r '.url' | xargs pg_dump > backup.sql
          # Upload to S3 or other storage
```

## 10. Testing Deployment

### Pre-deployment Checklist

- [ ] All environment variables set
- [ ] Database connection working
- [ ] Migrations applied successfully
- [ ] Seed data created
- [ ] Build completes without errors
- [ ] Health check endpoint responding

### Post-deployment Testing

1. **Test Demo Accounts:**
   ```
   Admin: admin@demo.com / admin123
   User:  user@demo.com / demo123
   ```

2. **Verify Demo Data:**
   - 10 parking zones visible
   - 2 active sessions showing
   - 5 completed sessions in history
   - Payment processing (with test Stripe keys)

3. **Test Core Features:**
   - User registration/login
   - Vehicle registration
   - Parking session creation
   - Payment processing
   - Admin dashboard

### Load Testing

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: 'https://your-app.railway.app'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Basic flow'
    requests:
      - get:
          url: '/'
      - get:
          url: '/dashboard'
EOF

# Run load test
artillery run load-test.yml
```

## Support and Troubleshooting

### Railway Documentation
- [Railway Docs](https://docs.railway.app/)
- [PostgreSQL on Railway](https://docs.railway.app/databases/postgresql)
- [Environment Variables](https://docs.railway.app/develop/variables)

### Common Commands Reference

```bash
# Project management
railway login
railway projects
railway link [project-id]

# Environment variables
railway variables
railway variables set KEY=value
railway variables delete KEY

# Database
railway connect postgresql
railway run npx prisma studio
railway run npx prisma migrate deploy

# Deployment
railway up
railway deploy
railway logs
railway status

# Development
railway run npm run dev
railway shell
```

### Getting Help

1. **Railway Discord:** [discord.gg/railway](https://discord.gg/railway)
2. **GitHub Issues:** Check project issues
3. **Railway Support:** support@railway.app

---

## Quick Deployment Summary

```bash
# 1. Create Railway project with PostgreSQL
railway new parking-payment
railway add postgresql

# 2. Set environment variables
railway variables set NEXTAUTH_SECRET=your-secret-here
railway variables set NEXTAUTH_URL=https://your-app.railway.app

# 3. Deploy application
railway up

# 4. Run migrations and seed
railway run npx prisma migrate deploy
railway run npm run db:seed

# 5. Verify deployment
curl https://your-app.railway.app/api/health
```

Your Stamford Parking System is now live on Railway with full demo data! 🎉