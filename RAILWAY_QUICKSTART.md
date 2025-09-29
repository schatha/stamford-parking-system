# Railway Deployment - Quick Start

Deploy the Stamford Parking System to Railway.app in just a few commands!

## 🚀 One-Click Setup

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Run automated setup
npm run railway:setup
```

The setup script will:
1. ✅ Create Railway project with PostgreSQL
2. ✅ Deploy the application
3. ✅ Run database migrations
4. ✅ Seed demo data
5. ✅ Provide login credentials

## 📊 Demo Data Included

After deployment, you'll have:

- **👥 2 User Accounts:**
  - Admin: `admin@demo.com` / `admin123`
  - User: `user@demo.com` / `demo123`

- **🅿️ 10 Parking Zones:**
  - 3 Street parking locations
  - 3 Parking garages
  - 2 Parking lots
  - 2 Meter zones

- **🚗 2 Demo Vehicles:**
  - DEMO123 (Demo user's Honda Civic)
  - ADMIN99 (Admin's city vehicle)

- **📝 Transaction History:**
  - 5 completed parking sessions
  - 2 active parking sessions
  - 7 successful transactions

## ⚙️ Manual Commands

If you prefer manual setup:

```bash
# Create project and database
railway new stamford-parking
railway add postgresql

# Deploy application
railway up

# Run migrations and seed
railway run npx prisma migrate deploy
railway run npm run db:seed
```

## 🔧 Environment Variables

Set these in Railway dashboard:

```bash
# Required
NEXTAUTH_SECRET=your-32-character-secret
NEXTAUTH_URL=https://your-app.railway.app

# Optional (for payments)
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_secret
```

## 📖 Full Documentation

For detailed instructions, see [docs/RAILWAY_DEPLOYMENT.md](docs/RAILWAY_DEPLOYMENT.md)

## 🎯 Quick Test

After deployment:

```bash
# Test health endpoint
curl https://your-app.railway.app/api/health

# Login with demo credentials
# Visit: https://your-app.railway.app
```

That's it! Your parking system is live on Railway! 🎉