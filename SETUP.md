# Stamford Parking System Setup Guide

This is a comprehensive Next.js 14 municipal parking payment system with TypeScript, PostgreSQL, NextAuth.js, and Stripe integration.

## Features

- **User Authentication**: Secure registration and login with NextAuth.js
- **Vehicle Management**: Users can register multiple vehicles
- **Parking Zone Selection**: Browse and select from active parking zones
- **Payment Processing**: Secure payments via Stripe integration
- **Session Management**: Real-time parking session tracking
- **Admin Dashboard**: Complete administrative oversight with revenue tracking
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account (for payments)

## Environment Setup

1. Copy the environment example file:
```bash
cp .env.example .env
```

2. Configure your environment variables in `.env`:

### Required Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/stamford_parking"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-nextauth-secret"

# Stripe (Get from your Stripe dashboard)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App Settings
NEXT_PUBLIC_APP_NAME="Stamford Parking System"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
TAX_RATE=0.0875
PROCESSING_FEE=0.30
```

### Security Notes

- **NEVER** commit your `.env` file to version control
- Use strong, unique secrets for production
- Rotate secrets regularly
- Use environment-specific Stripe keys

## Installation

1. Install dependencies:
```bash
npm install
```

2. Generate Prisma client:
```bash
npx prisma generate
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

4. (Optional) Seed the database:
```bash
npx prisma db seed
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Database Schema

The system uses the following main entities:

- **Users**: Authentication and user profiles
- **Vehicles**: User-registered vehicles
- **Parking Zones**: Available parking locations with rates
- **Parking Sessions**: Active and historical parking sessions
- **Transactions**: Payment records via Stripe

## API Routes

### Authentication
- `POST /api/auth/signup` - User registration
- `/api/auth/[...nextauth]` - NextAuth.js endpoints

### User Routes (Protected)
- `GET/POST /api/vehicles` - Vehicle management
- `GET/POST /api/sessions` - Parking session management
- `GET /api/zones` - Available parking zones

### Payment Routes (Protected)
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Stripe webhook handler

### Admin Routes (Admin Only)
- `GET /api/admin/sessions` - All parking sessions
- `GET /api/admin/stats` - Revenue and usage statistics

## User Roles

- **USER**: Standard users who can park and pay
- **ADMIN**: Full access to dashboard and system management
- **ENFORCEMENT**: (Future) Parking enforcement access

## Security Features

- Route protection with NextAuth.js middleware
- Input validation and sanitization
- SQL injection prevention with Prisma
- XSS protection headers
- CSRF protection
- Rate limiting ready (implement as needed)
- Secure environment variable handling

## Stripe Integration

### Test Mode Setup

1. Create a Stripe account at https://stripe.com
2. Get your test API keys from the Stripe dashboard
3. Set up a webhook endpoint at `https://yourdomain.com/api/payments/webhook`
4. Configure webhook to listen for these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`

### Webhook Configuration

The webhook endpoint handles payment status updates automatically:
- Successful payments activate parking sessions
- Failed payments cancel sessions
- All payment events are logged for audit

## Admin Features

### Creating an Admin User

1. Register a normal user account
2. Manually update the user's role in the database:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

### Admin Dashboard

Access the admin dashboard at `/admin` with admin credentials:
- View all parking sessions
- Monitor revenue statistics
- Export session data to CSV
- Real-time session status updates

## Production Deployment

### Environment Variables

Ensure all production environment variables are set:
- Use production Stripe keys
- Set secure NEXTAUTH_SECRET
- Configure production database URL
- Set NEXTAUTH_URL to your production domain

### Database

1. Set up production PostgreSQL database
2. Run migrations: `npx prisma migrate deploy`
3. Consider connection pooling for high traffic

### Security Checklist

- [ ] Change default NEXTAUTH_SECRET
- [ ] Use production Stripe keys
- [ ] Enable HTTPS
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Regular security updates

## Common Issues

### Database Connection
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database exists and user has permissions

### Stripe Webhooks
- Webhook endpoint must be publicly accessible
- Verify webhook secret matches environment variable
- Check webhook event types are configured correctly

### Authentication
- Clear browser cookies if having login issues
- Verify NEXTAUTH_URL matches your domain
- Check that NEXTAUTH_SECRET is set

## Development Tips

- Use `npx prisma studio` to view/edit database data
- Check browser Network tab for API debugging
- Use Stripe CLI for local webhook testing
- Enable Next.js debug mode for detailed logging

## Support

For issues or questions:
1. Check this setup guide
2. Review the application logs
3. Verify environment configuration
4. Test with minimal data first

---

Built with Next.js 14, TypeScript, Prisma, NextAuth.js, and Stripe.