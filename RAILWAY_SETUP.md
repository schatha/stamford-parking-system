# Railway PostgreSQL Setup Guide for Stamford Parking System

This guide will help you set up the Stamford Parking System using Railway's PostgreSQL database service.

## Prerequisites

- Node.js 18+ installed
- Railway account (https://railway.app)
- Stripe account for payments
- Git repository (optional but recommended)

## 🚂 Railway Database Setup

### Step 1: Create Railway Project

1. Go to [Railway](https://railway.app) and sign in
2. Click "New Project"
3. Choose "Provision PostgreSQL" from the template options
4. Wait for the database to be provisioned

### Step 2: Get Database Connection Details

1. In your Railway dashboard, click on your PostgreSQL service
2. Go to the "Connect" tab
3. Copy the "Postgres Connection URL"
   - Format: `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway`

### Step 3: Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.local.template .env.local
   ```

2. Edit `.env.local` with your Railway database URL:
   ```env
   DATABASE_URL="postgresql://postgres:your-password@containers-us-west-xxx.railway.app:5432/railway"
   ```

## 🔐 Authentication Setup

### Generate NextAuth Secret

Use one of these methods to generate a secure secret:

```bash
# Method 1: Using OpenSSL
openssl rand -base64 32

# Method 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

Add to `.env.local`:
```env
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"  # Change for production
```

## 💳 Stripe Configuration

### Step 1: Create Stripe Account

1. Sign up at [Stripe](https://stripe.com)
2. Complete account verification

### Step 2: Get API Keys

1. Go to Stripe Dashboard → Developers → API keys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Click "Reveal test key" and copy your **Secret key** (starts with `sk_test_`)

### Step 3: Set Up Webhook (Important!)

1. In Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Set endpoint URL: `https://your-domain.com/api/payments/webhook`
   - For local testing: Use ngrok or Railway preview URL
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Copy the webhook signing secret (starts with `whsec_`)

### Step 4: Configure Environment

Add to `.env.local`:
```env
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

## 🏛️ Connecticut Tax Configuration

Connecticut sales tax is already configured in the template:
```env
NEXT_PUBLIC_CT_SALES_TAX_RATE="0.0635"
```

This represents Connecticut's 6.35% sales tax rate (as of 2024).

## 📋 Complete .env.local Example

```env
# Database (Railway PostgreSQL)
DATABASE_URL="postgresql://postgres:abc123@containers-us-west-123.railway.app:5432/railway"

# Authentication
NEXTAUTH_SECRET="your-32-character-secret-generated-above"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_51ABC123..."
STRIPE_PUBLISHABLE_KEY="pk_test_51ABC123..."
STRIPE_WEBHOOK_SECRET="whsec_1ABC123..."

# Connecticut Tax
NEXT_PUBLIC_CT_SALES_TAX_RATE="0.0635"

# App Settings
NEXT_PUBLIC_APP_NAME="Stamford Parking System"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PROCESSING_FEE="0.30"
```

## 🗄️ Database Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

### Step 3: Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### Step 4: Seed Database (Optional)

```bash
npm run db:seed
```

This creates:
- Admin user: `admin@stamford.gov` / `admin123`
- Demo user: `demo@example.com` / `demo123`
- Sample parking zones
- Demo vehicle

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

Visit `http://localhost:3000`

### Test the Setup

1. **Registration**: Create a new user account
2. **Login**: Sign in with demo credentials
3. **Add Vehicle**: Register a test vehicle
4. **Browse Zones**: View available parking zones
5. **Test Payment**: Use Stripe test card: `4242 4242 4242 4242`

## 🌐 Production Deployment

### Railway App Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard:
   - Go to your project → Variables
   - Add all variables from your `.env.local`
   - Update `NEXTAUTH_URL` to your Railway domain

### Environment Variables for Production

```env
# Update these for production:
NEXTAUTH_URL="https://your-app-name.railway.app"
NEXT_PUBLIC_APP_URL="https://your-app-name.railway.app"

# Use production Stripe keys:
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

### Database Migration for Production

```bash
npx prisma migrate deploy
```

## 🔧 Development Tools

### View Database

```bash
npx prisma studio
```

### Reset Database

```bash
npx prisma migrate reset
```

### Generate New Migration

```bash
npx prisma migrate dev --name your_migration_name
```

## 🛠️ Troubleshooting

### Database Connection Issues

1. **Check Railway database status**: Ensure it's running
2. **Verify connection string**: Copy fresh URL from Railway
3. **Network issues**: Try from different network
4. **Connection limits**: Railway free tier has connection limits

### Stripe Webhook Issues

1. **Local testing**: Use ngrok for local webhook testing
   ```bash
   npx ngrok http 3000
   # Use the HTTPS URL for webhook endpoint
   ```

2. **Production**: Ensure webhook URL matches your domain
3. **Events**: Verify correct events are selected
4. **Secret**: Double-check webhook signing secret

### Common Errors

```bash
# Prisma client not generated
npx prisma generate

# Environment variables not loaded
# Ensure .env.local is in project root and not .env

# Database migration issues
npx prisma migrate reset
npx prisma migrate dev
```

## 📞 Support

### Railway Support
- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)

### Stripe Support
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Test Cards](https://stripe.com/docs/testing)

### Application Issues
- Check browser console for errors
- Review server logs in Railway dashboard
- Verify all environment variables are set

---

🎉 **You're all set!** Your Stamford Parking System should now be running with Railway PostgreSQL.