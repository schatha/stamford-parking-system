# Authentication System Documentation

## Overview

The Stamford Parking System uses NextAuth.js for comprehensive authentication with email/password credentials, bcrypt password hashing, and role-based access control.

## Features

### ✅ **Core Authentication**
- Email/password authentication with NextAuth.js
- Secure password hashing with bcrypt (12 rounds)
- JWT-based sessions with 30-day expiration
- Automatic login after registration

### ✅ **Security Features**
- Password strength validation (8+ chars, uppercase, lowercase, number, special character)
- Email format validation
- Phone number validation (optional)
- Protected API routes with middleware
- Role-based access control (USER/ADMIN/ENFORCEMENT)

### ✅ **User Interface**
- Clean, mobile-responsive design with Tailwind CSS
- Modern authentication forms with proper validation
- Password visibility toggle
- Real-time password strength indicator
- Loading states and error handling
- Accessible form components

### ✅ **Route Protection**
- Middleware-based route protection
- Automatic redirects for authenticated users
- Admin-only route protection
- Callback URL support for deep linking

## File Structure

```
app/
├── api/auth/
│   ├── [...nextauth]/route.ts    # NextAuth.js configuration
│   └── signup/route.ts           # User registration endpoint
├── login/page.tsx                # Login page
├── signup/page.tsx               # Registration page
└── forgot-password/page.tsx      # Password reset page (placeholder)

components/
├── auth/
│   ├── AuthProvider.tsx          # Session provider wrapper
│   ├── ProtectedRoute.tsx        # Client-side route protection
│   └── UserMenu.tsx              # User dropdown menu
└── ui/
    ├── AuthCard.tsx              # Authentication card layout
    └── FormField.tsx             # Form input component

lib/
├── auth.ts                       # NextAuth.js configuration
├── password.ts                   # Password utilities and validation
└── auth/helpers.ts               # Server-side auth helpers

middleware.ts                     # Route protection middleware
```

## Usage Examples

### 1. User Registration

```typescript
// app/signup/page.tsx
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '(203) 555-0123',
    password: 'SecurePass123!',
  }),
});
```

### 2. User Login

```typescript
// app/login/page.tsx
const result = await signIn('credentials', {
  email: 'john@example.com',
  password: 'SecurePass123!',
  redirect: false,
});
```

### 3. Protected Route (Server-side)

```typescript
// app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await requireAuth();
  return <div>Welcome, {user.name}!</div>;
}
```

### 4. Protected Route (Client-side)

```typescript
// components/SomeComponent.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function SomeComponent() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

### 5. Admin-only Route

```typescript
// app/admin/page.tsx
import { requireAdmin } from '@/lib/auth';

export default async function AdminPage() {
  const admin = await requireAdmin();
  return <div>Admin Dashboard</div>;
}
```

## User Roles

### **USER** (Default)
- Access to dashboard
- Can manage vehicles
- Can create parking sessions
- Can make payments

### **ADMIN**
- All USER permissions
- Access to admin dashboard
- View all parking sessions
- Export session data
- System management

### **ENFORCEMENT** (Future)
- View active sessions
- Enforcement tools
- Issue violations

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | User registration |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth.js endpoints |
| GET | `/api/auth/session` | Get current session |
| POST | `/api/auth/signout` | Sign out user |

### Protected API Routes

All routes under `/api/vehicles`, `/api/sessions`, and `/api/payments` require authentication.
Routes under `/api/admin` require admin role.

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*(),.?":{}|<>)

## Security Considerations

### ✅ **Implemented**
- Bcrypt password hashing with 12 rounds
- JWT tokens with secure expiration
- Input validation and sanitization
- CSRF protection via NextAuth.js
- Secure session management
- Role-based access control

### 🔄 **Future Enhancements**
- Email verification
- Password reset functionality
- Two-factor authentication
- Rate limiting on login attempts
- Account lockout after failed attempts
- OAuth providers (Google, Apple)

## Environment Variables

```env
# NextAuth.js configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-secret-here"

# Database connection
DATABASE_URL="postgresql://..."
```

## Default Demo Accounts

### Admin Account
- **Email**: `admin@stamford.gov`
- **Password**: `admin123`
- **Role**: ADMIN

### Demo User Account
- **Email**: `demo@example.com`
- **Password**: `demo123`
- **Role**: USER

## Development Notes

### Testing Authentication

1. **Registration Flow**:
   ```bash
   # Navigate to signup page
   http://localhost:3000/signup

   # Fill form with valid data
   # Should auto-login after registration
   ```

2. **Login Flow**:
   ```bash
   # Navigate to login page
   http://localhost:3000/login

   # Use demo credentials
   # Should redirect based on role
   ```

3. **Protected Routes**:
   ```bash
   # Try accessing dashboard without login
   http://localhost:3000/dashboard
   # Should redirect to login

   # Try accessing admin without admin role
   http://localhost:3000/admin
   # Should redirect to dashboard for non-admin
   ```

### Common Issues

1. **NextAuth Secret Missing**:
   ```
   Error: NEXTAUTH_SECRET is not set
   ```
   **Solution**: Set `NEXTAUTH_SECRET` in `.env.local`

2. **Database Connection**:
   ```
   Error: Database connection failed
   ```
   **Solution**: Verify `DATABASE_URL` and run `npx prisma migrate dev`

3. **Password Validation**:
   ```
   Error: Password must contain...
   ```
   **Solution**: Ensure password meets all requirements

## Mobile Responsiveness

The authentication system is fully responsive:

- **Mobile (320px+)**: Single column layout, touch-friendly buttons
- **Tablet (768px+)**: Optimized form sizing
- **Desktop (1024px+)**: Full feature set with hover states

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly
- High contrast support
- Error announcements

---

**Built with**: Next.js 14, NextAuth.js 4, Tailwind CSS, Heroicons, Headless UI