# Demo Access Guide

**Stamford Parking System - Live Demo**

Welcome to the Stamford Parking System demo! This document provides all the credentials and information needed to evaluate the system.

## 🌐 Live Demo URL

**Primary Demo Site:** `https://stamford-parking-system.vercel.app`

**Alternative Access:**
- **Status Page:** `https://stamford-parking-system.vercel.app/status`
- **Health API:** `https://stamford-parking-system.vercel.app/api/health`
- **Mobile PWA:** Access on mobile device for PWA installation prompts

> **Note:** The demo site is deployed on Vercel with a PostgreSQL database containing realistic sample data.

## 👥 Demo Account Credentials

### User Account (Standard Parking User)
```
Email:    user@demo.com
Password: demo123
Role:     User
```

**User Account Features:**
- ✅ Dashboard with parking overview
- ✅ Start/stop parking sessions
- ✅ Vehicle management
- ✅ Payment processing
- ✅ Session history
- ✅ Mobile-optimized interface
- ✅ PWA installation

### Admin Account (System Administrator)
```
Email:    admin@demo.com
Password: admin123
Role:     Admin
```

**Admin Account Features:**
- ✅ Complete admin dashboard
- ✅ All user features
- ✅ Parking zone management
- ✅ User account oversight
- ✅ Transaction monitoring
- ✅ System analytics
- ✅ Revenue reporting
- ✅ Enforcement tools

## 💳 Test Payment Information

**Stripe Test Credit Card (Always Succeeds):**
```
Card Number:    4242 4242 4242 4242
Expiry Date:    Any future date (e.g., 12/25)
CVC:            Any 3 digits (e.g., 123)
ZIP Code:       Any 5 digits (e.g., 12345)
Name:           Any name
```

**Alternative Test Cards:**
```
# Visa (Succeeds)
4242 4242 4242 4242

# Visa (Requires 3D Secure)
4000 0025 0000 3155

# Mastercard (Succeeds)
5555 5555 5555 4444

# American Express (Succeeds)
3782 822463 10005

# Declined Card (Always Fails)
4000 0000 0000 0002
```

**Test Payment Scenarios:**
- **Successful Payment:** Use 4242 4242 4242 4242
- **3D Secure Challenge:** Use 4000 0025 0000 3155
- **Declined Payment:** Use 4000 0000 0000 0002

## 🅿️ Sample Parking Zones

The demo system includes 10 active parking zones for testing:

### Street Parking
```
Zone A1  - Downtown Main Street
Rate:    $2.00/hour
Max:     4 hours
Address: 123 Main Street, Stamford, CT

Zone E5  - Bedford Street
Rate:    $1.75/hour
Max:     3 hours
Address: 456 Bedford Street, Stamford, CT

Zone I9  - Forest Street
Rate:    $1.50/hour
Max:     4 hours
Address: 567 Forest Street, Stamford, CT
```

### Parking Garages
```
Zone C3  - Harbor Point Garage
Rate:    $3.00/hour
Max:     12 hours
Address: 123 Harbor Point Road, Stamford, CT

Zone F6  - Stamford Town Center Garage
Rate:    $2.75/hour
Max:     10 hours
Address: 100 Greyrock Place, Stamford, CT

Zone J10 - Government Center Garage
Rate:    $2.50/hour
Max:     12 hours
Address: 888 Washington Blvd, Stamford, CT
```

### Parking Lots
```
Zone B2  - City Hall Parking Lot
Rate:    $1.50/hour
Max:     8 hours
Address: 888 Washington Blvd, Stamford, CT

Zone G7  - Atlantic Street Lot
Rate:    $1.25/hour
Max:     6 hours
Address: 200 Atlantic Street, Stamford, CT
```

### Meter Zones
```
Zone D4  - Train Station North
Rate:    $2.50/hour
Max:     2 hours
Address: 1 Station Place, Stamford, CT

Zone H8  - Summer Street Meters
Rate:    $2.25/hour
Max:     2 hours
Address: 345 Summer Street, Stamford, CT
```

## 🚀 Quick Start Guide for Evaluators

### Step 1: Initial Access
1. **Visit:** `https://stamford-parking-system.vercel.app`
2. **Click:** "Sign In" button
3. **Login as User:** `user@demo.com` / `demo123`

### Step 2: Explore User Features
**Dashboard Overview:**
- View active sessions (2 currently running)
- See parking history (5 completed sessions)
- Check registered vehicles (Honda Civic - DEMO123)

**Start a New Session:**
1. Click "Start Parking"
2. Select a zone (try Zone A1 - Downtown Main Street)
3. Choose vehicle: DEMO123 - My Honda Civic
4. Set duration: 2 hours
5. Review cost: ~$4.63 (base + tax + processing fee)
6. Click "Pay with Card"
7. Use test card: 4242 4242 4242 4242
8. Complete payment

**Mobile Experience:**
1. Access on mobile device
2. Test PWA installation prompt
3. Verify touch-friendly interface
4. Test offline functionality

### Step 3: Explore Admin Features
1. **Logout** from user account
2. **Login as Admin:** `admin@demo.com` / `admin123`
3. **Access Admin Dashboard:**
   - View all user sessions
   - Monitor revenue ($67.23 total)
   - Check zone utilization
   - Review transaction history

**Admin Capabilities:**
- **Zone Management:** View/edit all 10 parking zones
- **User Management:** See all registered users
- **Analytics:** Revenue trends and usage patterns
- **Enforcement:** Session monitoring and violations
- **Reports:** Generate usage and financial reports

### Step 4: Test System Health
1. **Visit Status Page:** `/status`
2. **Check Health API:** `/api/health`
3. **Verify Components:**
   - Database: Healthy ✅
   - Stripe: Healthy ✅
   - Application: Healthy ✅
   - Platform: Healthy ✅

### Step 5: Test Edge Cases
**Payment Testing:**
- Try declined card: 4000 0000 0000 0002
- Test 3D Secure: 4000 0025 0000 3155
- Verify error handling

**Session Management:**
- End active sessions early
- Extend session time
- Try multiple concurrent sessions

**Mobile Features:**
- Install as PWA
- Test offline mode
- Verify push notifications setup

## 📊 Demo Data Overview

The demo environment includes:

**Users:** 2 accounts
- 1 Regular user (user@demo.com)
- 1 Admin user (admin@demo.com)

**Vehicles:** 2 registered
- DEMO123 (CT) - User's Honda Civic
- ADMIN99 (CT) - Admin's City Vehicle

**Parking Zones:** 10 total
- 3 Street locations
- 3 Garage facilities
- 2 Parking lots
- 2 Meter zones

**Transaction History:** 7 transactions
- 5 Completed sessions (historical)
- 2 Active sessions (live demo)
- Total revenue: $67.23

**Session Status:**
- **Active Session 1:** User in Zone A1 (45 minutes remaining)
- **Active Session 2:** Admin in Zone C3 (3.5 hours remaining)

## 🔧 Technical Features to Evaluate

### Core Functionality
- [x] **User Registration/Login** with NextAuth.js
- [x] **Vehicle Management** with license plate validation
- [x] **Zone Selection** with real-time availability
- [x] **Session Management** with start/stop/extend
- [x] **Payment Processing** with Stripe integration
- [x] **Admin Dashboard** with comprehensive oversight

### Mobile & PWA Features
- [x] **Responsive Design** optimized for mobile
- [x] **PWA Installation** with service worker
- [x] **Offline Functionality** with cached data
- [x] **Touch-Friendly Interface** with 44px+ targets
- [x] **Install Prompts** for iOS Safari and Chrome

### Performance & Monitoring
- [x] **Health Monitoring** with real-time status
- [x] **Performance Optimization** with lazy loading
- [x] **Code Splitting** for faster initial load
- [x] **Caching Strategy** with service worker
- [x] **Database Optimization** with connection pooling

### Security & Best Practices
- [x] **Input Validation** on all forms
- [x] **SQL Injection Protection** with Prisma ORM
- [x] **Authentication Security** with secure sessions
- [x] **Payment Security** with Stripe compliance
- [x] **Environment Variables** for sensitive data

## 🎯 Key Evaluation Points

### User Experience
1. **Ease of Use:** How intuitive is the parking process?
2. **Mobile Experience:** Does it work well on mobile devices?
3. **Payment Flow:** Is the payment process smooth and secure?
4. **Performance:** How fast do pages load and respond?

### Admin Capabilities
1. **Dashboard Clarity:** Is the admin interface comprehensive?
2. **Data Visualization:** Are analytics clear and useful?
3. **Management Tools:** Can admins effectively manage the system?
4. **Reporting:** Are reports detailed and actionable?

### Technical Implementation
1. **Code Quality:** Is the code well-structured and maintainable?
2. **Database Design:** Is the schema efficient and scalable?
3. **API Design:** Are endpoints well-designed and documented?
4. **Error Handling:** How gracefully does the system handle errors?

### Deployment & Operations
1. **Deployment Process:** How easy is it to deploy?
2. **Environment Setup:** Is configuration straightforward?
3. **Monitoring:** Are health checks comprehensive?
4. **Scalability:** Can the system handle growth?

## 🆘 Troubleshooting

### Common Issues

**Can't Login:**
- Verify exact credentials: `user@demo.com` / `demo123`
- Check for typos in email/password
- Try hard refresh (Ctrl+F5 or Cmd+Shift+R)

**Payment Fails:**
- Use exact test card: `4242 4242 4242 4242`
- Enter any future date for expiry
- Use any 3-digit CVC code
- Try different browser if issues persist

**Mobile Issues:**
- Ensure using HTTPS URL
- Clear browser cache
- Try Chrome or Safari for best PWA experience

**Performance Issues:**
- Check network connection
- Verify on status page: `/status`
- Try different browser or device

### Getting Help

**Documentation:**
- [Vercel Deployment Guide](docs/VERCEL_DEPLOYMENT.md)
- [Railway Deployment Guide](docs/RAILWAY_DEPLOYMENT.md)
- [Mobile Testing Guide](docs/MOBILE_TESTING.md)

**Technical Support:**
- Check system status at `/status`
- Review health API at `/api/health`
- Verify demo data is properly seeded

## 📱 Mobile Testing Instructions

### PWA Installation
1. **Chrome (Android/Desktop):**
   - Install prompt appears after 30 seconds
   - Click "Install" when prompted
   - App will be added to home screen/app drawer

2. **Safari (iOS):**
   - Manual installation instructions displayed
   - Tap Share button → "Add to Home Screen"
   - App icon will appear on home screen

3. **Verification:**
   - App launches in standalone mode
   - No browser chrome visible
   - Native app-like experience

### Offline Testing
1. **Enable Offline Mode:**
   - Chrome DevTools → Network → "Offline"
   - Or disable WiFi/mobile data

2. **Test Offline Features:**
   - Visit `/offline` page
   - Verify cached content loads
   - Check connection status indicator

3. **Return Online:**
   - Re-enable network connection
   - Page should auto-refresh when reconnected

---

## Summary

This demo showcases a complete municipal parking payment system with:

- **Full-featured web application** with user and admin interfaces
- **Mobile-optimized PWA** with offline capabilities
- **Secure payment processing** with Stripe integration
- **Real-time monitoring** with health checks and status dashboard
- **Production-ready deployment** on Vercel with external database
- **Comprehensive testing** with realistic demo data

**Ready to evaluate!** Use the credentials above to explore all features. 🚀

---

*Demo System: Stamford Parking Payment System*
*Version: 1.0.0*
*Last Updated: December 2024*