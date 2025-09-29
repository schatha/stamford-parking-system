# API Documentation

**Stamford Parking System - REST API Reference**

This document provides comprehensive API documentation for enforcement integration, third-party systems, and mobile applications.

## Base URL

**Production:** `https://stamford-parking-system.vercel.app/api`
**Development:** `http://localhost:3000/api`

## Authentication

### API Key Authentication
All enforcement and integration endpoints require API key authentication.

```http
Authorization: Bearer YOUR_API_KEY
```

### JWT Authentication
User-facing endpoints use JWT tokens from NextAuth.js

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### API Key Management

**Get API Key:**
```http
POST /api/auth/api-key
Content-Type: application/json
Authorization: Bearer JWT_TOKEN

{
  "name": "Enforcement Mobile App",
  "permissions": ["sessions:read", "violations:write"]
}
```

**Response:**
```json
{
  "apiKey": "sk_live_enforcement_abc123xyz789",
  "name": "Enforcement Mobile App",
  "permissions": ["sessions:read", "violations:write"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2025-01-01T00:00:00.000Z"
}
```

## Core Endpoints

### Authentication & Users

#### POST /api/auth/signin
Authenticate user and get session token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires": "2024-01-02T00:00:00.000Z"
}
```

#### GET /api/users/profile
Get current user profile.

**Headers:**
```http
Authorization: Bearer JWT_TOKEN
```

**Response:**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1-203-555-0123",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "vehicles": [
    {
      "id": "vehicle_456",
      "licensePlate": "ABC123",
      "state": "CT",
      "nickname": "My Car"
    }
  ]
}
```

### Parking Zones

#### GET /api/zones
Get all active parking zones.

**Query Parameters:**
- `location_type` (optional): Filter by STREET, GARAGE, LOT, METER
- `active` (optional): Filter by active status (default: true)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Request:**
```http
GET /api/zones?location_type=STREET&limit=10
```

**Response:**
```json
{
  "zones": [
    {
      "id": "zone_A1",
      "zoneNumber": "A1",
      "zoneName": "Downtown Main Street",
      "locationType": "STREET",
      "ratePerHour": 2.00,
      "maxDurationHours": 4,
      "address": "123 Main Street, Stamford, CT",
      "coordinates": {
        "latitude": 41.0534,
        "longitude": -73.5387
      },
      "restrictions": {
        "timeRestrictions": [
          {
            "startTime": "08:00",
            "endTime": "18:00",
            "daysOfWeek": [1, 2, 3, 4, 5]
          }
        ]
      },
      "isActive": true,
      "currentOccupancy": 12,
      "maxCapacity": 20
    }
  ],
  "total": 10,
  "limit": 10,
  "offset": 0
}
```

#### GET /api/zones/{zoneId}
Get specific zone details.

**Response:**
```json
{
  "id": "zone_A1",
  "zoneNumber": "A1",
  "zoneName": "Downtown Main Street",
  "locationType": "STREET",
  "ratePerHour": 2.00,
  "maxDurationHours": 4,
  "address": "123 Main Street, Stamford, CT",
  "coordinates": {
    "latitude": 41.0534,
    "longitude": -73.5387
  },
  "restrictions": {
    "timeRestrictions": [
      {
        "startTime": "08:00",
        "endTime": "18:00",
        "daysOfWeek": [1, 2, 3, 4, 5]
      }
    ],
    "vehicleTypeRestrictions": ["compact", "standard"],
    "maxVehicleLength": 20
  },
  "isActive": true,
  "currentOccupancy": 12,
  "maxCapacity": 20,
  "activeSessions": [
    {
      "id": "session_789",
      "licensePlate": "ABC123",
      "startTime": "2024-01-01T10:00:00.000Z",
      "scheduledEndTime": "2024-01-01T12:00:00.000Z",
      "status": "ACTIVE"
    }
  ]
}
```

### Parking Sessions

#### POST /api/sessions
Start a new parking session.

**Request:**
```json
{
  "vehicleId": "vehicle_456",
  "zoneId": "zone_A1",
  "durationHours": 2,
  "paymentMethodId": "pm_1234567890"
}
```

**Response:**
```json
{
  "session": {
    "id": "session_789",
    "userId": "user_123",
    "vehicleId": "vehicle_456",
    "zoneId": "zone_A1",
    "startTime": "2024-01-01T10:00:00.000Z",
    "scheduledEndTime": "2024-01-01T12:00:00.000Z",
    "durationHours": 2,
    "baseCost": 4.00,
    "taxAmount": 0.25,
    "processingFee": 0.50,
    "totalCost": 4.75,
    "status": "ACTIVE"
  },
  "transaction": {
    "id": "txn_456",
    "amount": 4.75,
    "status": "COMPLETED",
    "stripeTransactionId": "pi_1234567890"
  },
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

#### GET /api/sessions
Get user's parking sessions.

**Query Parameters:**
- `status` (optional): Filter by ACTIVE, COMPLETED, EXPIRED, CANCELLED
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "sessions": [
    {
      "id": "session_789",
      "vehicle": {
        "licensePlate": "ABC123",
        "state": "CT",
        "nickname": "My Car"
      },
      "zone": {
        "zoneNumber": "A1",
        "zoneName": "Downtown Main Street",
        "address": "123 Main Street, Stamford, CT"
      },
      "startTime": "2024-01-01T10:00:00.000Z",
      "scheduledEndTime": "2024-01-01T12:00:00.000Z",
      "endTime": null,
      "durationHours": 2,
      "totalCost": 4.75,
      "status": "ACTIVE",
      "timeRemaining": 3600,
      "canExtend": true
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

#### PUT /api/sessions/{sessionId}/extend
Extend an active parking session.

**Request:**
```json
{
  "additionalHours": 1,
  "paymentMethodId": "pm_1234567890"
}
```

**Response:**
```json
{
  "session": {
    "id": "session_789",
    "scheduledEndTime": "2024-01-01T13:00:00.000Z",
    "durationHours": 3,
    "totalCost": 7.13,
    "status": "ACTIVE"
  },
  "extensionTransaction": {
    "id": "txn_789",
    "amount": 2.38,
    "status": "COMPLETED"
  }
}
```

#### PUT /api/sessions/{sessionId}/end
End an active parking session.

**Response:**
```json
{
  "session": {
    "id": "session_789",
    "endTime": "2024-01-01T11:30:00.000Z",
    "status": "COMPLETED",
    "actualDuration": 1.5,
    "refundAmount": 0.63
  },
  "refundTransaction": {
    "id": "txn_refund_123",
    "amount": 0.63,
    "status": "PENDING"
  }
}
```

## Enforcement API

### Session Verification

#### GET /api/enforcement/verify/{licensePlate}
Verify if a vehicle has a valid parking session.

**Headers:**
```http
Authorization: Bearer ENFORCEMENT_API_KEY
```

**Query Parameters:**
- `zone` (optional): Zone number to verify against
- `state` (optional): Vehicle state/province

**Request:**
```http
GET /api/enforcement/verify/ABC123?zone=A1&state=CT
```

**Response:**
```json
{
  "licensePlate": "ABC123",
  "state": "CT",
  "isValid": true,
  "session": {
    "id": "session_789",
    "zoneNumber": "A1",
    "zoneName": "Downtown Main Street",
    "startTime": "2024-01-01T10:00:00.000Z",
    "scheduledEndTime": "2024-01-01T12:00:00.000Z",
    "timeRemaining": 1800,
    "status": "ACTIVE"
  },
  "user": {
    "name": "John Doe",
    "phone": "+1-203-555-0123"
  },
  "vehicle": {
    "nickname": "My Car"
  }
}
```

**Invalid Session Response:**
```json
{
  "licensePlate": "XYZ789",
  "state": "CT",
  "isValid": false,
  "reason": "NO_ACTIVE_SESSION",
  "lastSession": {
    "endTime": "2024-01-01T09:00:00.000Z",
    "zoneNumber": "B2"
  }
}
```

#### GET /api/enforcement/zone/{zoneNumber}/sessions
Get all active sessions in a zone.

**Headers:**
```http
Authorization: Bearer ENFORCEMENT_API_KEY
```

**Response:**
```json
{
  "zone": {
    "zoneNumber": "A1",
    "zoneName": "Downtown Main Street",
    "maxCapacity": 20,
    "currentOccupancy": 12
  },
  "sessions": [
    {
      "id": "session_789",
      "licensePlate": "ABC123",
      "state": "CT",
      "startTime": "2024-01-01T10:00:00.000Z",
      "scheduledEndTime": "2024-01-01T12:00:00.000Z",
      "timeRemaining": 1800,
      "status": "ACTIVE",
      "user": {
        "name": "John Doe",
        "phone": "+1-203-555-0123"
      }
    }
  ],
  "total": 12
}
```

### Violation Management

#### POST /api/enforcement/violations
Create a parking violation.

**Headers:**
```http
Authorization: Bearer ENFORCEMENT_API_KEY
```

**Request:**
```json
{
  "licensePlate": "XYZ789",
  "state": "CT",
  "zoneNumber": "A1",
  "violationType": "EXPIRED_SESSION",
  "description": "Session expired 15 minutes ago",
  "location": {
    "latitude": 41.0534,
    "longitude": -73.5387,
    "address": "123 Main Street, Stamford, CT"
  },
  "officerId": "officer_123",
  "evidence": [
    {
      "type": "PHOTO",
      "url": "https://storage.example.com/violation_photo_1.jpg",
      "timestamp": "2024-01-01T12:15:00.000Z"
    }
  ]
}
```

**Response:**
```json
{
  "violation": {
    "id": "violation_456",
    "licensePlate": "XYZ789",
    "state": "CT",
    "zoneNumber": "A1",
    "violationType": "EXPIRED_SESSION",
    "description": "Session expired 15 minutes ago",
    "fineAmount": 25.00,
    "status": "ISSUED",
    "issuedAt": "2024-01-01T12:15:00.000Z",
    "dueDate": "2024-01-31T23:59:59.000Z",
    "officerId": "officer_123",
    "violationNumber": "VP-2024-000001"
  }
}
```

#### GET /api/enforcement/violations
Get violations with filtering.

**Query Parameters:**
- `licensePlate` (optional): Filter by license plate
- `zoneNumber` (optional): Filter by zone
- `status` (optional): Filter by ISSUED, PAID, CONTESTED, DISMISSED
- `dateFrom` (optional): Filter from date (ISO 8601)
- `dateTo` (optional): Filter to date (ISO 8601)
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "violations": [
    {
      "id": "violation_456",
      "licensePlate": "XYZ789",
      "state": "CT",
      "zoneNumber": "A1",
      "violationType": "EXPIRED_SESSION",
      "fineAmount": 25.00,
      "status": "ISSUED",
      "issuedAt": "2024-01-01T12:15:00.000Z",
      "dueDate": "2024-01-31T23:59:59.000Z",
      "violationNumber": "VP-2024-000001"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

## Analytics & Reporting API

### Usage Analytics

#### GET /api/analytics/usage
Get parking usage analytics.

**Headers:**
```http
Authorization: Bearer ADMIN_API_KEY
```

**Query Parameters:**
- `dateFrom`: Start date (ISO 8601)
- `dateTo`: End date (ISO 8601)
- `zoneNumber` (optional): Filter by zone
- `granularity`: hour, day, week, month

**Response:**
```json
{
  "period": {
    "from": "2024-01-01T00:00:00.000Z",
    "to": "2024-01-31T23:59:59.000Z",
    "granularity": "day"
  },
  "metrics": {
    "totalSessions": 1247,
    "totalRevenue": 3847.52,
    "averageSessionDuration": 2.3,
    "peakOccupancyRate": 0.85,
    "averageOccupancyRate": 0.62
  },
  "data": [
    {
      "date": "2024-01-01",
      "sessions": 42,
      "revenue": 127.83,
      "averageDuration": 2.1,
      "occupancyRate": 0.58
    }
  ],
  "zoneBreakdown": [
    {
      "zoneNumber": "A1",
      "zoneName": "Downtown Main Street",
      "sessions": 387,
      "revenue": 1247.92,
      "occupancyRate": 0.73
    }
  ]
}
```

### Revenue Reports

#### GET /api/analytics/revenue
Get revenue analytics and reports.

**Query Parameters:**
- `dateFrom`: Start date (ISO 8601)
- `dateTo`: End date (ISO 8601)
- `groupBy`: zone, payment_method, day, week, month

**Response:**
```json
{
  "period": {
    "from": "2024-01-01T00:00:00.000Z",
    "to": "2024-01-31T23:59:59.000Z"
  },
  "summary": {
    "totalRevenue": 15247.83,
    "totalTransactions": 3891,
    "averageTransactionValue": 3.92,
    "processingFees": 1945.50,
    "netRevenue": 13302.33
  },
  "breakdown": [
    {
      "category": "A1",
      "revenue": 4827.91,
      "transactions": 1247,
      "percentage": 31.7
    }
  ],
  "trends": [
    {
      "date": "2024-01-01",
      "revenue": 487.23,
      "transactions": 127
    }
  ]
}
```

## Vehicle Management API

### Vehicle Registration

#### POST /api/vehicles
Register a new vehicle.

**Request:**
```json
{
  "licensePlate": "ABC123",
  "state": "CT",
  "nickname": "My Car",
  "vehicleType": "STANDARD",
  "make": "Honda",
  "model": "Civic",
  "year": 2020,
  "color": "Blue"
}
```

**Response:**
```json
{
  "vehicle": {
    "id": "vehicle_789",
    "licensePlate": "ABC123",
    "state": "CT",
    "nickname": "My Car",
    "vehicleType": "STANDARD",
    "make": "Honda",
    "model": "Civic",
    "year": 2020,
    "color": "Blue",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/vehicles
Get user's registered vehicles.

**Response:**
```json
{
  "vehicles": [
    {
      "id": "vehicle_789",
      "licensePlate": "ABC123",
      "state": "CT",
      "nickname": "My Car",
      "vehicleType": "STANDARD",
      "make": "Honda",
      "model": "Civic",
      "year": 2020,
      "color": "Blue",
      "isActive": true,
      "activeSessions": 0,
      "totalSessions": 47,
      "lastUsed": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

## Payment API

### Payment Methods

#### POST /api/payment/methods
Add a payment method.

**Request:**
```json
{
  "stripePaymentMethodId": "pm_1234567890",
  "isDefault": true
}
```

**Response:**
```json
{
  "paymentMethod": {
    "id": "pm_user_123",
    "stripePaymentMethodId": "pm_1234567890",
    "type": "card",
    "card": {
      "brand": "visa",
      "last4": "4242",
      "expMonth": 12,
      "expYear": 2025
    },
    "isDefault": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/payment/methods
Get user's payment methods.

**Response:**
```json
{
  "paymentMethods": [
    {
      "id": "pm_user_123",
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "expMonth": 12,
        "expYear": 2025
      },
      "isDefault": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Payment Processing

#### POST /api/payment/process
Process a payment for parking session.

**Request:**
```json
{
  "sessionId": "session_789",
  "paymentMethodId": "pm_user_123",
  "amount": 475,
  "currency": "usd",
  "description": "Parking session A1 - 2 hours"
}
```

**Response:**
```json
{
  "transaction": {
    "id": "txn_456",
    "sessionId": "session_789",
    "amount": 475,
    "currency": "usd",
    "status": "COMPLETED",
    "stripeTransactionId": "pi_1234567890",
    "processingFee": 50,
    "netAmount": 425,
    "processedAt": "2024-01-01T10:00:00.000Z"
  },
  "receipt": {
    "receiptUrl": "https://pay.stripe.com/receipts/...",
    "receiptNumber": "PARK-2024-000001"
  }
}
```

## Webhook API

### Stripe Webhooks

#### POST /api/webhooks/stripe
Handle Stripe webhook events.

**Supported Events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `invoice.payment_succeeded`
- `customer.subscription.updated`

**Request Headers:**
```http
Stripe-Signature: t=1234567890,v1=abcdef123456...
```

**Event Processing:**
```json
{
  "id": "evt_1234567890",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "amount": 475,
      "currency": "usd",
      "status": "succeeded",
      "metadata": {
        "sessionId": "session_789",
        "userId": "user_123"
      }
    }
  }
}
```

### IPS Group Integration

#### POST /api/webhooks/ips
Handle IPS Group enforcement system webhooks.

**Request:**
```json
{
  "eventType": "VIOLATION_CREATED",
  "timestamp": "2024-01-01T12:15:00.000Z",
  "data": {
    "licensePlate": "XYZ789",
    "state": "CT",
    "zoneNumber": "A1",
    "violationType": "EXPIRED_SESSION",
    "location": {
      "latitude": 41.0534,
      "longitude": -73.5387
    },
    "officerId": "officer_123"
  }
}
```

## Real-time API (WebSocket)

### Connection
```javascript
const ws = new WebSocket('wss://stamford-parking-system.vercel.app/api/ws');
```

### Authentication
```json
{
  "type": "auth",
  "token": "Bearer JWT_TOKEN"
}
```

### Session Updates
```json
{
  "type": "session_update",
  "sessionId": "session_789",
  "data": {
    "timeRemaining": 1800,
    "status": "ACTIVE"
  }
}
```

### Zone Occupancy Updates
```json
{
  "type": "zone_update",
  "zoneNumber": "A1",
  "data": {
    "currentOccupancy": 15,
    "maxCapacity": 20
  }
}
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "INVALID_SESSION",
    "message": "The parking session is not active or has expired",
    "details": {
      "sessionId": "session_789",
      "currentStatus": "EXPIRED"
    },
    "timestamp": "2024-01-01T12:15:00.000Z"
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error
- `503` - Service Unavailable

### Common Error Codes
- `INVALID_API_KEY` - API key is invalid or expired
- `INSUFFICIENT_PERMISSIONS` - API key lacks required permissions
- `INVALID_SESSION` - Session is not active or expired
- `PAYMENT_FAILED` - Payment processing failed
- `ZONE_NOT_FOUND` - Parking zone does not exist
- `VEHICLE_NOT_FOUND` - Vehicle is not registered
- `RATE_LIMITED` - Too many requests
- `VALIDATION_ERROR` - Request validation failed

## Rate Limiting

### Limits
- **Public API:** 100 requests per minute per IP
- **Authenticated API:** 1000 requests per minute per user
- **Enforcement API:** 5000 requests per minute per API key
- **Webhook API:** 10000 requests per minute per endpoint

### Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1641024000
```

## SDK and Libraries

### JavaScript/TypeScript SDK
```bash
npm install @stamford-parking/api-client
```

```javascript
import { StamfordParkingAPI } from '@stamford-parking/api-client';

const api = new StamfordParkingAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://stamford-parking-system.vercel.app/api'
});

// Verify license plate
const verification = await api.enforcement.verify('ABC123', {
  zone: 'A1',
  state: 'CT'
});
```

### Python SDK
```bash
pip install stamford-parking-api
```

```python
from stamford_parking import StamfordParkingAPI

api = StamfordParkingAPI(
    api_key='your-api-key',
    base_url='https://stamford-parking-system.vercel.app/api'
)

# Verify license plate
verification = api.enforcement.verify(
    license_plate='ABC123',
    zone='A1',
    state='CT'
)
```

## Testing

### Test Environment
**Base URL:** `https://stamford-parking-system-staging.vercel.app/api`

### Test API Keys
- **Enforcement:** `sk_test_enforcement_123456789`
- **Analytics:** `sk_test_analytics_123456789`
- **Webhook:** `sk_test_webhook_123456789`

### Test Data
Use demo credentials from [demo-access.md](../demo-access.md) for testing.

---

## Support

### API Support
- **Email:** api-support@stamford.gov
- **Documentation:** [API Docs](https://stamford-parking-system.vercel.app/docs)
- **Status Page:** [System Status](https://stamford-parking-system.vercel.app/status)

### Rate Limit Increases
Contact api-support@stamford.gov with:
- Use case description
- Expected request volume
- Integration timeline

### Webhook Troubleshooting
- Verify endpoint accessibility
- Check webhook signatures
- Review webhook event logs
- Ensure proper error handling

---

*API Documentation Version: 1.0.0*
*Last Updated: December 2024*