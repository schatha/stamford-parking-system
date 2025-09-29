# Vercel Deployment - Quick Start

Deploy the Stamford Parking System to Vercel in 5 simple steps!

## 🚀 Quick Setup

### 1. Push to GitHub
```bash
# Create GitHub repository and push code
git init
git add .
git commit -m "Initial commit: Stamford Parking System"
git remote add origin https://github.com/YOUR_USERNAME/stamford-parking-system.git
git push -u origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import `stamford-parking-system` repository
5. Click "Deploy"

### 3. Setup Database
Choose an external PostgreSQL provider:

**Option A: Railway (Recommended)**
```bash
railway new stamford-parking-db
railway add postgresql
railway variables get DATABASE_URL  # Copy this URL
```

**Option B: Supabase**
1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings > Database
3. Copy connection string

**Option C: Neon**
1. Create project at [neon.tech](https://neon.tech)
2. Copy connection string from dashboard

### 4. Configure Environment Variables
In Vercel dashboard, add these variables:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-32-character-secret-key

# Payments (Optional - use test keys)
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_secret

# Environment
NODE_ENV=production
```

### 5. Run Migrations & Seed Data
```bash
# Run migrations on your database
DATABASE_URL="your-db-url" npx prisma migrate deploy

# Seed demo data
DATABASE_URL="your-db-url" npm run db:seed
```

## ✅ Verification

After deployment:

1. **Visit Your App:** `https://your-app.vercel.app`
2. **Check Status:** `https://your-app.vercel.app/status`
3. **Test Health API:** `https://your-app.vercel.app/api/health`

**Demo Login:**
- Admin: `admin@demo.com` / `admin123`
- User: `user@demo.com` / `demo123`

## 📊 What's Included

After deployment, you'll have:

- **🌐 Live Application** on Vercel with automatic deployments
- **📊 System Status Page** at `/status` with real-time health monitoring
- **🏥 Health API** at `/api/health` for external monitoring
- **👥 Demo Accounts** ready for testing
- **🅿️ 10 Parking Zones** with realistic data
- **📝 Sample Transactions** showing system in action
- **⏱️ Active Sessions** for live demo

## 🔧 Advanced Configuration

### Custom Domain
1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update `NEXTAUTH_URL` environment variable

### Monitoring Setup
```bash
# Add Vercel Analytics
npm install @vercel/analytics

# Add Speed Insights
npm install @vercel/speed-insights
```

## 📖 Full Documentation

For detailed instructions and troubleshooting:
- [Complete Vercel Deployment Guide](docs/VERCEL_DEPLOYMENT.md)
- [System Status Page Features](app/status/page.tsx)
- [Health API Documentation](app/api/health/route.ts)

## 🆘 Quick Troubleshooting

**Build failing?**
- Check environment variables in Vercel dashboard
- Ensure all dependencies are in `package.json`

**Database connection issues?**
- Verify `DATABASE_URL` format
- Test connection: `DATABASE_URL="..." npx prisma db push`

**Authentication not working?**
- Check `NEXTAUTH_URL` matches your Vercel domain
- Ensure `NEXTAUTH_SECRET` is at least 32 characters

**Status page showing errors?**
- Verify database is accessible
- Check Stripe keys if using payment features

That's it! Your parking system is now live on Vercel! 🎉