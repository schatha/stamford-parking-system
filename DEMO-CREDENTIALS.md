# Demo Credentials and Test Data

## User Account Login
- **Email:** user@demo.com
- **Password:** demo123
- **Role:** Standard User
- **Pre-registered Vehicle:** DEMO123 (CT) - "My Honda Civic"

## Admin Account Login
- **Email:** admin@demo.com
- **Password:** admin123
- **Role:** Administrator
- **Pre-registered Vehicle:** ADMIN99 (CT) - "City Vehicle"

## Stripe Test Card (Demo Payment)
- **Card Number:** 4242 4242 4242 4242
- **Expiration:** Any future date (e.g., 12/28)
- **CVV:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 06902)

## Test Parking Zones

| Zone Number | Zone Name | Type | Rate/Hour | Max Duration | Address |
|-------------|-----------|------|-----------|--------------|---------|
| A1 | Downtown Main Street | STREET | $1.25 | 4 hours | 123 Main Street, Stamford, CT |
| B2 | City Hall Parking Lot | LOT | $1.00 | 8 hours | 888 Washington Blvd, Stamford, CT |
| C3 | Harbor Point Garage | GARAGE | $1.00 | 12 hours | 123 Harbor Point Road, Stamford, CT |
| D4 | Train Station North | METER | $1.25 | 2 hours | 1 Station Place, Stamford, CT |
| E5 | Bedford Street | STREET | $1.25 | 3 hours | 456 Bedford Street, Stamford, CT |
| F6 | Stamford Town Center Garage | GARAGE | $1.00 | 10 hours | 100 Greyrock Place, Stamford, CT |
| G7 | Atlantic Street Lot | LOT | $1.00 | 6 hours | 200 Atlantic Street, Stamford, CT |
| H8 | Summer Street Meters | METER | $1.25 | 2 hours | 345 Summer Street, Stamford, CT |
| I9 | Forest Street | STREET | $1.25 | 4 hours | 567 Forest Street, Stamford, CT |
| J10 | Government Center Garage | GARAGE | $1.00 | 12 hours | 888 Washington Blvd, Stamford, CT |

## RFP-Compliant Pricing Structure

### Parking Rates (Verified in Code)
- **On-street parking (STREET/METER):** $1.25/hour
- **Lot/Garage parking (LOT/GARAGE):** $1.00/hour

### Tax Calculation (Connecticut Sales Tax)
- **Rate:** 6.35% (defined in lib/utils/constants.ts)
- **Applied to:** Base parking cost only
- **Environment Variable:** NEXT_PUBLIC_CT_SALES_TAX_RATE=0.0635

### Processing Fee Structure
- **Stripe Processing Fee:** 2.9% + $0.30 per transaction
- **Applied to:** Total amount including tax
- **Calculated in:** lib/utils/calculations.ts

### Cost Breakdown Example (2-hour street parking)
- Base Cost: $1.25 × 2 = $2.50
- CT Sales Tax (6.35%): $2.50 × 0.0635 = $0.16
- Subtotal: $2.66
- Processing Fee: ($2.66 × 0.029) + $0.30 = $0.38
- **Total:** $3.04

## Demo Data Already Seeded

### Users: 2 accounts
- 1 admin user (admin@demo.com)
- 1 standard user (user@demo.com)

### Vehicles: 2 vehicles
- DEMO123 (CT) - belongs to user@demo.com
- ADMIN99 (CT) - belongs to admin@demo.com

### Historical Data: 5 completed sessions
- Mix of zones and vehicles
- Realistic timestamps and durations
- Completed transactions with Stripe mock IDs

### Active Sessions: 2 live sessions
- Session 1: DEMO123 in Zone A1 (Downtown Main St) - 2 hours, started 45 min ago
- Session 2: ADMIN99 in Zone C3 (Harbor Point Garage) - 4 hours, started 30 min ago

## Application URLs
- **Main App:** http://localhost:3000
- **User Dashboard:** http://localhost:3000/dashboard
- **Admin Dashboard:** http://localhost:3000/admin
- **Login Page:** http://localhost:3000/login
- **Registration:** http://localhost:3000/signup
- **Start Parking:** http://localhost:3000/park
- **Zone Selection:** http://localhost:3000/parking/zones

## API Endpoints for Testing
- GET /api/sessions - User's parking sessions
- POST /api/sessions - Create new parking session
- GET /api/vehicles - User's vehicles
- GET /api/zones - Available parking zones
- GET /api/admin/sessions - Admin view of all sessions
- GET /api/admin/stats - Dashboard statistics