# 🚀 Quick Start Guide - Stamford Parking System

Get up and running with the Stamford Parking System in minutes!

## ⚡ Quick Setup (5 minutes)

### 1. Environment Configuration

```bash
# Copy the template
cp .env.local.template .env.local
```

Edit `.env.local` with your values:

```env
# Railway PostgreSQL Database
DATABASE_URL="postgresql://postgres:password@host:port/database"

# Generate a secret (32+ characters)
NEXTAUTH_SECRET="your-secure-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe Test Keys
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Connecticut Tax Rate (6.35%)
NEXT_PUBLIC_CT_SALES_TAX_RATE="0.0635"

# App Settings
NEXT_PUBLIC_APP_NAME="Stamford Parking System"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PROCESSING_FEE="0.30"
```

### 2. Install & Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma migrate dev --name init

# Set up database with admin user and sample data
npm run setup:db
```

### 3. Start Development

```bash
npm run dev
```

Visit: **http://localhost:3000**

## 🎯 Test the System

### Default Login Credentials

- **Admin**: `admin@stamford.gov` / `admin123`
- **Demo User**: `demo@example.com` / `demo123`

### Test Stripe Payments

Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Any future expiry date and CVC**

## 🛠️ Railway PostgreSQL Setup

### Quick Railway Setup

1. **Create Account**: Sign up at [Railway](https://railway.app)
2. **New Project**: Choose "Provision PostgreSQL"
3. **Get URL**: Copy the connection string from Railway dashboard
4. **Update .env.local**: Paste the DATABASE_URL

Example Railway URL:
```
DATABASE_URL="postgresql://postgres:abc123@containers-us-west-123.railway.app:5432/railway"
```

## 🔑 Generate Secure Secrets

### NextAuth Secret

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Stripe Setup

1. **Sign up**: [Stripe Dashboard](https://dashboard.stripe.com)
2. **Get Test Keys**: Dashboard → Developers → API keys
3. **Setup Webhook**: Dashboard → Developers → Webhooks
   - URL: `https://your-domain.com/api/payments/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── parking/           # Parking flow pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── payments/         # Payment components
├── lib/                   # Utilities and helpers
│   ├── auth/             # Authentication logic
│   ├── db/               # Database functions
│   ├── stripe/           # Stripe integration
│   └── utils/            # Helper functions
├── prisma/                # Database schema and migrations
├── scripts/               # Setup and utility scripts
└── types/                 # TypeScript type definitions
```

## 🚨 Troubleshooting

### Database Connection Issues

```bash
# Check if database is accessible
npx prisma db pull

# Reset database if needed
npx prisma migrate reset
```

### Environment Issues

```bash
# Verify environment variables are loaded
node -e "console.log(process.env.DATABASE_URL ? 'Database URL set' : 'Database URL missing')"
```

### Stripe Webhook Testing

```bash
# Install Stripe CLI for local testing
npm install -g @stripe/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/payments/webhook
```

## 🎪 Sample Data Included

The setup script creates:

### Parking Zones
- **DT001**: Downtown Main Street ($2.00/hr, 4hr max)
- **CH001**: City Hall Parking Lot ($1.50/hr, 8hr max)
- **TS001**: Train Station Short-term ($2.50/hr, 2hr max)
- **And more...**

### Test Users
- Admin user for system management
- Demo user with sample vehicle

## 📞 Need Help?

### Common Issues

1. **"Database does not exist"**: Check DATABASE_URL format
2. **"NextAuth secret missing"**: Ensure NEXTAUTH_SECRET is set
3. **"Stripe key invalid"**: Verify Stripe keys are correct test keys
4. **"Port 3000 in use"**: Use `npm run dev -- -p 3001` for different port

### Resources

- [Railway Docs](https://docs.railway.app)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Prisma Docs](https://www.prisma.io/docs)

---

🎉 **You're ready to go!** The Stamford Parking System is now running locally.