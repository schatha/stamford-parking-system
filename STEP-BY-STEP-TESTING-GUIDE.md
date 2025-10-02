# Step-by-Step Testing Guide
**Stamford Parking Payment Application - RFP 2026.0147**

## PRE-TEST SETUP

### 1. Start the Application
```bash
cd /Users/shabaig/Desktop/parking-payment
npm run dev
```

### 2. Verify Setup
- Navigate to: http://localhost:3000
- Open browser DevTools (F12) to monitor for errors
- Ensure database is seeded (should see demo content)

### 3. Clear Browser Data (Optional)
- Clear cookies/localStorage for fresh test
- Use incognito/private browsing mode

---

## USER FLOW TESTING (20 minutes)

### TEST 1: User Registration & Login ✅
**Objective:** Verify user authentication system

1. **Go to registration page**
   - URL: http://localhost:3000/signup
   - Fill form: test-user@example.com / Test123! / Test User / (203) 555-0199

2. **Verify account creation**
   - Should redirect to dashboard
   - Check welcome message shows "Test User"

3. **Test logout and login**
   - Logout from app
   - Go to: http://localhost:3000/login
   - Login with demo user: user@demo.com / demo123

**✅ PASS if:** Successfully created account, logged out, and logged back in

---

### TEST 2: Vehicle Management ✅
**Objective:** Verify vehicle CRUD operations

1. **Add new vehicle**
   - From dashboard, go to "Manage Vehicles"
   - URL should be: /dashboard/vehicles
   - Click "Add Vehicle"
   - Enter: License Plate: TEST123, State: CT, Nickname: My Test Car

2. **Verify vehicle appears**
   - Should see TEST123 (CT) in vehicle list
   - Should show nickname "My Test Car"

3. **Edit vehicle (bonus test)**
   - Click edit on TEST123
   - Change nickname to "Updated Test Car"
   - Save and verify change

**✅ PASS if:** Vehicle added, appears in list, can be edited

---

### TEST 3: Create Parking Session ✅
**Objective:** Test complete parking flow with RFP-compliant pricing

1. **Start parking process**
   - Navigate to "Start Parking" or /park
   - Should see 4-step process indicator

2. **Select zone**
   - Choose Zone A1 (Downtown Main Street)
   - Verify rate shows $1.25/hour (RFP requirement)
   - Click to select

3. **Select vehicle**
   - Choose TEST123 (CT) or DEMO123 (CT)
   - Proceed to next step

4. **Choose duration**
   - Select 2 hours
   - **CRITICAL PRICING VERIFICATION:**
     - Base Cost: $1.25 × 2 = $2.50
     - CT Sales Tax (6.35%): $2.50 × 0.0635 = $0.16
     - Processing Fee: (~$0.38 for Stripe)
     - **Total should be approximately: $3.04**

5. **Complete payment**
   - Use test card: 4242 4242 4242 4242
   - Expiration: 12/28, CVV: 123, ZIP: 06902
   - Click "Complete Payment"

**✅ PASS if:**
- Cost breakdown shows 3 separate line items
- Tax is exactly 6.35% of base cost
- Payment processes successfully
- Redirected to confirmation page

---

### TEST 4: Active Session Monitoring ✅
**Objective:** Verify real-time session tracking

1. **View active session**
   - From dashboard, click on active session
   - Should see countdown timer
   - Verify zone, vehicle, and end time are correct

2. **Test session extension**
   - Click "Extend Session" button
   - Add 1 more hour
   - Verify cost calculation for extension
   - Complete extension payment

**✅ PASS if:** Timer counts down, extension works, costs calculated correctly

---

### TEST 5: Transaction History ✅
**Objective:** Verify user can view past transactions

1. **Navigate to history**
   - Go to /dashboard/history
   - Should see all user's transactions

2. **Verify transaction details**
   - Find the session just created
   - Check transaction ID, amount, date, zone
   - Verify status is "COMPLETED"

**✅ PASS if:** Transaction appears with correct details and unique ID

---

## ADMIN FLOW TESTING (15 minutes)

### TEST 6: Admin Login & Dashboard ✅
**Objective:** Verify admin role separation and dashboard

1. **Admin login**
   - Logout from user account
   - Login with: admin@demo.com / admin123
   - Should redirect to /admin (not /dashboard)

2. **Verify admin dashboard**
   - Should see admin metrics dashboard
   - Check revenue displays (should exclude processing fees)
   - Verify charts and statistics load

**✅ PASS if:** Admin dashboard loads with different interface than user dashboard

---

### TEST 7: Active Sessions Management ✅
**Objective:** Verify admin can monitor all active sessions

1. **View all active sessions**
   - Click "Active Sessions" from admin dashboard
   - Should see sessions from all users (including test session from step 3)

2. **Verify session details**
   - Find TEST123 session created earlier
   - Check zone, user, time remaining, amount paid

**✅ PASS if:** Can see active sessions from all users with complete details

---

### TEST 8: Transaction Monitoring ✅
**Objective:** Verify admin can view all transactions

1. **Access transaction view**
   - Click "Transactions" from admin menu
   - Should see all transactions from all users

2. **Verify revenue calculation**
   - Check that city revenue excludes processing fees
   - Total shown should be: Base Cost + Tax Amount only

**✅ PASS if:** All transactions visible, revenue correctly excludes fees

---

### TEST 9: Zone Management ✅
**Objective:** Verify admin can manage parking zones

1. **View zones**
   - Go to /admin/zones
   - Should see all 10 seeded zones with RFP-compliant rates

2. **Create new zone**
   - Click "Add Zone" or similar
   - Enter: Zone Z99, "Test Zone", GARAGE type, $1.00/hr, 4hr max
   - Address: "999 Test Street, Stamford, CT"

3. **Verify zone creation**
   - New zone should appear in zones list
   - Rate should be $1.00 (LOT/GARAGE rate per RFP)

**✅ PASS if:** Zone created with correct rate enforcement

---

### TEST 10: Data Export ✅
**Objective:** Verify admin can export data

1. **Export daily report**
   - From admin dashboard, click "Export Report"
   - Should download CSV file with format: daily-report-YYYY-MM-DD.csv

2. **Verify CSV content**
   - Open downloaded file
   - Should contain: Date, Revenue, Sessions, Users data

**✅ PASS if:** CSV downloads with correct data format

---

## MOBILE RESPONSIVENESS TEST (5 minutes)

### TEST 11: Mobile Interface ✅
**Objective:** Verify mobile-first responsive design

1. **Enable mobile view**
   - Open Chrome DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Select "iPhone 14 Pro" or similar

2. **Test user flow on mobile**
   - Navigate through parking creation process
   - Verify all buttons are tappable (minimum 44px target)
   - Check text readability and form usability

3. **Test admin dashboard on mobile**
   - Login as admin on mobile view
   - Verify dashboard charts and data tables adapt properly

**✅ PASS if:** All interfaces are usable on mobile devices, no horizontal scrolling

---

## PRICING COMPLIANCE VERIFICATION

### Critical RFP Requirements Checklist:

- [ ] ✅ Street/Meter parking: $1.25/hour
- [ ] ✅ Lot/Garage parking: $1.00/hour
- [ ] ✅ CT Sales Tax: 6.35% applied to base cost only
- [ ] ✅ Processing fee: Separate line item (Stripe 2.9% + $0.30)
- [ ] ✅ Cost breakdown: Shows all 3 components clearly
- [ ] ✅ City revenue: Excludes processing fees in admin reports

### Sample Calculation Verification:
**2-hour street parking (Zone A1):**
- Base: $1.25 × 2 = $2.50
- Tax: $2.50 × 0.0635 = $0.16
- Subtotal: $2.66
- Processing: ($2.66 × 0.029) + $0.30 = $0.38
- **Total: $3.04**
- **City Gets: $2.66** (excludes processing)

---

## ERROR SCENARIOS TO TEST

### TEST 12: Edge Cases ⚠️
1. **Try parking without vehicles** - Should redirect to add vehicle
2. **Exceed zone max duration** - Should be prevented in UI
3. **Invalid payment card** - Use 4000000000000002 (decline)
4. **Session already active** - Try starting second session with same vehicle

---

## PERFORMANCE INDICATORS

### Success Metrics:
- [ ] Page load times < 3 seconds
- [ ] No console errors in browser
- [ ] All forms submit successfully
- [ ] Real-time updates work (timers, admin refresh)
- [ ] Mobile interface fully functional
- [ ] Payment processing completes in demo mode

### Browser Compatibility:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## POST-TEST VERIFICATION

### Database Integrity Check:
1. **User created:** Check users table has test-user@example.com
2. **Vehicle added:** Check vehicles table has TEST123
3. **Session recorded:** Check parking_sessions table has new session
4. **Transaction logged:** Check transactions table has payment record

### API Health Check:
- GET /api/health should return 200 OK
- All API endpoints respond correctly
- No 500 errors in server logs

---

## DEPLOYMENT READINESS CHECKLIST

- [ ] All tests pass locally
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Production build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] All pricing calculations verified
- [ ] Admin role separation working
- [ ] Mobile responsive design confirmed

**READY FOR PRODUCTION:** If all tests pass, application meets RFP requirements and is ready for deployment.