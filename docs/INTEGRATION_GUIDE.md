# Integration Guide

**Stamford Parking System - Third-Party Integration Guide**

This document provides comprehensive integration guidelines for connecting with IPS Group enforcement systems, Teller payment systems, and other municipal parking technology platforms.

## Overview

The Stamford Parking System is designed with open APIs and standardized protocols to seamlessly integrate with existing municipal infrastructure and third-party enforcement systems.

### Supported Integrations
- **IPS Group SmartCity Platform** - Enforcement and citation management
- **Teller Payment Systems** - Payment processing and reconciliation
- **AIMS Enforcement** - Mobile enforcement applications
- **Parkeon/Flowbird** - Meter integration and monitoring
- **GTCS Municipal Systems** - Revenue management and reporting
- **Duncan Solutions** - Citation processing and collections

## IPS Group Integration

### Overview
IPS Group provides comprehensive smart city solutions including parking enforcement, permit management, and citation processing. This integration enables real-time communication between the Stamford Parking System and IPS enforcement platforms.

### Integration Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  IPS Group      │    │   Stamford      │    │   Municipal     │
│  SmartCity      │◄──►│   Parking       │◄──►│   Database      │
│  Platform       │    │   System        │    │   (Legacy)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Enforcement    │    │   API Gateway   │    │   Data Sync     │
│  Mobile Apps    │    │   & Webhooks    │    │   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### API Endpoints for IPS Integration

#### Real-time License Plate Verification
```http
POST /api/ips/verify
Content-Type: application/json
Authorization: Bearer IPS_API_KEY

{
  "requestId": "ips_req_123456",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "licensePlate": "ABC123",
  "state": "CT",
  "location": {
    "zoneNumber": "A1",
    "latitude": 41.0534,
    "longitude": -73.5387,
    "address": "123 Main Street, Stamford, CT"
  },
  "officerId": "officer_123",
  "deviceId": "handheld_456"
}
```

**Response:**
```json
{
  "requestId": "ips_req_123456",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "verification": {
    "isValid": true,
    "status": "ACTIVE",
    "session": {
      "id": "session_789",
      "startTime": "2024-01-01T10:00:00.000Z",
      "endTime": "2024-01-01T14:00:00.000Z",
      "timeRemaining": 7200,
      "zone": {
        "number": "A1",
        "name": "Downtown Main Street",
        "ratePerHour": 2.00
      }
    },
    "vehicle": {
      "licensePlate": "ABC123",
      "state": "CT",
      "registeredOwner": "John Doe"
    },
    "permits": [
      {
        "type": "RESIDENTIAL",
        "number": "RES-2024-001",
        "validUntil": "2024-12-31T23:59:59.000Z"
      }
    ]
  },
  "enforcementRecommendation": "NO_ACTION",
  "additionalInfo": {
    "paymentMethod": "Credit Card",
    "userPhone": "+1-203-555-0123"
  }
}
```

#### Violation Reporting
```http
POST /api/ips/violations
Content-Type: application/json
Authorization: Bearer IPS_API_KEY

{
  "violationId": "ips_viol_789",
  "timestamp": "2024-01-01T12:15:00.000Z",
  "licensePlate": "XYZ789",
  "state": "CT",
  "location": {
    "zoneNumber": "A1",
    "latitude": 41.0534,
    "longitude": -73.5387,
    "address": "123 Main Street, Stamford, CT"
  },
  "violationType": "EXPIRED_METER",
  "description": "Vehicle parked with expired meter - 15 minutes over",
  "fineAmount": 25.00,
  "officerId": "officer_123",
  "deviceId": "handheld_456",
  "evidence": [
    {
      "type": "PHOTO",
      "url": "https://ips-storage.com/photos/violation_123.jpg",
      "timestamp": "2024-01-01T12:15:00.000Z",
      "metadata": {
        "gps": "41.0534,-73.5387",
        "camera": "rear"
      }
    },
    {
      "type": "VIDEO",
      "url": "https://ips-storage.com/videos/violation_123.mp4",
      "duration": 30,
      "timestamp": "2024-01-01T12:15:00.000Z"
    }
  ],
  "weather": "Clear",
  "timeOfDay": "Midday"
}
```

### IPS Configuration

#### Authentication Setup
```javascript
// IPS API Client Configuration
const ipsConfig = {
  baseURL: 'https://api.ipsgroup.com/smartcity/v2',
  apiKey: process.env.IPS_API_KEY,
  secret: process.env.IPS_SECRET_KEY,
  clientId: 'stamford-parking-001',
  timeout: 30000,
  retryAttempts: 3
};
```

#### Webhook Configuration
```json
{
  "webhookEndpoint": "https://stamford-parking-system.vercel.app/api/webhooks/ips",
  "events": [
    "violation.created",
    "violation.updated",
    "citation.paid",
    "permit.expired",
    "enforcement.start_shift",
    "enforcement.end_shift"
  ],
  "signatureMethod": "HMAC-SHA256",
  "retryPolicy": {
    "maxRetries": 5,
    "backoffStrategy": "exponential"
  }
}
```

#### Data Synchronization
```typescript
// Scheduled sync with IPS systems
export async function syncWithIPS() {
  const ipsClient = new IPSClient(ipsConfig);

  // Sync active sessions
  await ipsClient.syncActiveSessions({
    since: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    zones: ['A1', 'A2', 'B1', 'B2'] // Monitored zones
  });

  // Sync violations
  await ipsClient.syncViolations({
    status: ['PENDING', 'ISSUED'],
    dateRange: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date()
    }
  });

  // Sync permit information
  await ipsClient.syncPermits({
    types: ['RESIDENTIAL', 'BUSINESS', 'VISITOR'],
    activeOnly: true
  });
}
```

## Teller Payment System Integration

### Overview
Teller provides modern payment infrastructure for municipalities, offering real-time payment processing, reconciliation, and reporting capabilities.

### Integration Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Teller API    │    │   Stamford      │    │     Stripe      │
│   Gateway       │◄──►│   Parking       │◄──►│   Primary       │
│                 │    │   System        │    │   Gateway       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Municipal      │    │  Payment        │    │   Payment       │
│  Accounting     │    │  Routing        │    │   Processing    │
│  System         │    │  Logic          │    │   Engine        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Teller API Integration

#### Payment Processing
```http
POST /api/teller/payments
Content-Type: application/json
Authorization: Bearer TELLER_API_KEY

{
  "paymentId": "park_payment_123",
  "amount": 475, // $4.75 in cents
  "currency": "USD",
  "paymentMethod": {
    "type": "CREDIT_CARD",
    "token": "teller_pm_token_456"
  },
  "metadata": {
    "sessionId": "session_789",
    "zoneNumber": "A1",
    "licensePlate": "ABC123",
    "duration": "2 hours",
    "municipality": "stamford",
    "department": "parking"
  },
  "description": "Parking fee - Zone A1 (2 hours)",
  "statementDescriptor": "STAMFORD PARKING",
  "applicationFee": {
    "amount": 25, // $0.25 processing fee
    "description": "Processing fee"
  }
}
```

**Response:**
```json
{
  "paymentId": "park_payment_123",
  "tellerTransactionId": "teller_txn_789",
  "status": "COMPLETED",
  "amount": 475,
  "netAmount": 450,
  "processingFee": 25,
  "timestamp": "2024-01-01T10:00:00.000Z",
  "confirmation": {
    "number": "PARK-2024-000123",
    "receiptUrl": "https://receipts.teller.io/park_payment_123"
  },
  "accounting": {
    "revenueAccount": "4100-PARKING-REVENUE",
    "feeAccount": "5200-PROCESSING-FEES",
    "batchId": "BATCH-2024-001-001"
  },
  "reconciliation": {
    "settlementDate": "2024-01-02",
    "merchantReference": "STAMFORD-PARK-001"
  }
}
```

#### Refund Processing
```http
POST /api/teller/refunds
Content-Type: application/json
Authorization: Bearer TELLER_API_KEY

{
  "originalPaymentId": "park_payment_123",
  "refundAmount": 238, // Partial refund for early session end
  "reason": "EARLY_SESSION_END",
  "metadata": {
    "sessionId": "session_789",
    "originalDuration": "2 hours",
    "actualDuration": "1.5 hours",
    "refundCalculation": "Pro-rated based on unused time"
  }
}
```

### Teller Configuration

#### Environment Setup
```bash
# Teller API Configuration
TELLER_API_KEY=teller_sk_live_abc123xyz789
TELLER_PUBLIC_KEY=teller_pk_live_def456uvw012
TELLER_WEBHOOK_SECRET=teller_wh_secret_ghi789jkl345
TELLER_ENVIRONMENT=production # or sandbox
TELLER_APPLICATION_ID=stamford-parking-app-001
```

#### Payment Routing Configuration
```typescript
interface TellerPaymentConfig {
  routes: {
    parking_revenue: {
      account: '4100-PARKING-REVENUE',
      percentage: 95 // 95% to revenue
    },
    processing_fees: {
      account: '5200-PROCESSING-FEES',
      percentage: 5 // 5% processing fee
    }
  },
  settlement: {
    frequency: 'daily',
    account: 'STAMFORD-OPERATING-001',
    cutoffTime: '18:00 EST'
  },
  reconciliation: {
    format: 'CSV',
    delivery: 'SFTP',
    schedule: 'daily'
  }
}
```

## AIMS Enforcement Integration

### Overview
AIMS (Advanced Integrated Management System) provides mobile enforcement capabilities with real-time connectivity to parking management systems.

### Mobile Enforcement App Integration

#### License Plate Lookup
```http
GET /api/aims/lookup/{licensePlate}?state={state}&zone={zoneNumber}
Authorization: Bearer AIMS_API_KEY

{
  "officerId": "officer_123",
  "deviceId": "aims_device_456",
  "location": {
    "latitude": 41.0534,
    "longitude": -73.5387
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### Citation Issuance
```http
POST /api/aims/citations
Content-Type: application/json
Authorization: Bearer AIMS_API_KEY

{
  "citationNumber": "AIMS-2024-000123",
  "licensePlate": "XYZ789",
  "state": "CT",
  "violation": {
    "code": "PKG-001",
    "description": "Expired Meter",
    "fineAmount": 25.00
  },
  "location": {
    "zoneNumber": "A1",
    "address": "123 Main Street",
    "latitude": 41.0534,
    "longitude": -73.5387
  },
  "officer": {
    "id": "officer_123",
    "name": "Officer Smith",
    "badge": "PS-456"
  },
  "timestamp": "2024-01-01T12:15:00.000Z",
  "evidence": [
    {
      "type": "PHOTO",
      "base64Data": "iVBORw0KGgoAAAANSUhEUgAA...",
      "mimeType": "image/jpeg"
    }
  ]
}
```

## Parkeon/Flowbird Meter Integration

### Smart Meter Communication

#### Meter Status Updates
```http
POST /api/parkeon/meter-status
Content-Type: application/json
Authorization: Bearer PARKEON_API_KEY

{
  "meterId": "METER-A1-001",
  "zoneNumber": "A1",
  "status": {
    "operational": true,
    "spaceOccupied": true,
    "timeRemaining": 3600,
    "lastPayment": {
      "amount": 2.00,
      "duration": 60,
      "timestamp": "2024-01-01T11:00:00.000Z",
      "paymentMethod": "CREDIT_CARD"
    }
  },
  "diagnostics": {
    "batteryLevel": 85,
    "signalStrength": -65,
    "temperature": 22,
    "lastMaintenance": "2024-01-01T08:00:00.000Z"
  }
}
```

#### Remote Meter Configuration
```http
PUT /api/parkeon/meter-config/{meterId}
Content-Type: application/json
Authorization: Bearer PARKEON_API_KEY

{
  "rates": [
    {
      "timeSlot": "08:00-18:00",
      "rate": 2.00,
      "maxDuration": 240, // 4 hours
      "gracePeriod": 5 // 5 minutes
    },
    {
      "timeSlot": "18:00-08:00",
      "rate": 1.00,
      "maxDuration": 720, // 12 hours
      "gracePeriod": 10
    }
  ],
  "enforcement": {
    "enabled": true,
    "alertThreshold": 300, // 5 minutes after expiry
    "violationCode": "PKG-001"
  }
}
```

## GTCS Municipal Integration

### Revenue Management System

#### Financial Reconciliation
```http
POST /api/gtcs/reconciliation
Content-Type: application/json
Authorization: Bearer GTCS_API_KEY

{
  "reportPeriod": {
    "from": "2024-01-01T00:00:00.000Z",
    "to": "2024-01-01T23:59:59.000Z"
  },
  "transactions": [
    {
      "transactionId": "txn_123",
      "timestamp": "2024-01-01T10:00:00.000Z",
      "amount": 4.75,
      "type": "PARKING_PAYMENT",
      "zone": "A1",
      "paymentMethod": "CREDIT_CARD",
      "accountingCode": "4100-PARKING-REVENUE"
    }
  ],
  "summary": {
    "totalRevenue": 1247.83,
    "totalTransactions": 287,
    "processingFees": 62.39,
    "netRevenue": 1185.44
  }
}
```

## Integration Security

### API Authentication
```typescript
// Multi-system authentication manager
class IntegrationAuthManager {
  private credentials: Map<string, AuthCredentials>;

  constructor() {
    this.credentials = new Map([
      ['IPS', {
        type: 'API_KEY',
        key: process.env.IPS_API_KEY,
        secret: process.env.IPS_SECRET_KEY
      }],
      ['TELLER', {
        type: 'BEARER_TOKEN',
        token: process.env.TELLER_API_KEY
      }],
      ['AIMS', {
        type: 'OAUTH2',
        clientId: process.env.AIMS_CLIENT_ID,
        clientSecret: process.env.AIMS_CLIENT_SECRET
      }]
    ]);
  }

  async getAuthHeader(system: string): Promise<string> {
    const creds = this.credentials.get(system);
    switch (creds?.type) {
      case 'API_KEY':
        return `ApiKey ${creds.key}`;
      case 'BEARER_TOKEN':
        return `Bearer ${creds.token}`;
      case 'OAUTH2':
        const token = await this.getOAuthToken(creds);
        return `Bearer ${token}`;
      default:
        throw new Error(`Unsupported auth type for ${system}`);
    }
  }
}
```

### Data Encryption
```typescript
// Secure data exchange
class SecureDataExchange {
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.INTEGRATION_ENCRYPTION_KEY;
  }

  encryptPayload(data: any): string {
    const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decryptPayload(encryptedData: string): any {
    const decipher = crypto.createDecipher('aes-256-gcm', this.encryptionKey);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }
}
```

## Error Handling & Resilience

### Circuit Breaker Pattern
```typescript
class IntegrationCircuitBreaker {
  private failureCount = 0;
  private lastFailureTime: Date | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  async callExternalService<T>(
    serviceName: string,
    serviceCall: () => Promise<T>
  ): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error(`Circuit breaker open for ${serviceName}`);
      }
    }

    try {
      const result = await serviceCall();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.failureCount >= 5) {
      this.state = 'OPEN';
    }
  }
}
```

### Retry Logic
```typescript
class RetryManager {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    backoffMs: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        const delay = backoffMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}
```

## Integration Testing

### Test Environment Setup
```typescript
// Integration test configuration
const integrationTestConfig = {
  ips: {
    baseURL: 'https://sandbox-api.ipsgroup.com',
    apiKey: 'test_ips_key_123',
    secret: 'test_ips_secret_456'
  },
  teller: {
    baseURL: 'https://sandbox.teller.io',
    apiKey: 'teller_sk_test_789',
    webhookSecret: 'test_webhook_secret'
  },
  aims: {
    baseURL: 'https://test-api.aims-enforcement.com',
    clientId: 'test_aims_client',
    clientSecret: 'test_aims_secret'
  }
};
```

### Integration Test Suite
```typescript
describe('Third-Party Integrations', () => {
  describe('IPS Group Integration', () => {
    it('should verify license plate status', async () => {
      const result = await ipsClient.verifyLicensePlate('TEST123', 'CT', 'A1');
      expect(result.isValid).toBeDefined();
      expect(result.session).toBeDefined();
    });

    it('should create violation record', async () => {
      const violation = await ipsClient.createViolation({
        licensePlate: 'TEST456',
        violationType: 'EXPIRED_METER',
        location: { zoneNumber: 'A1' }
      });
      expect(violation.violationId).toBeDefined();
    });
  });

  describe('Teller Payment Integration', () => {
    it('should process parking payment', async () => {
      const payment = await tellerClient.processPayment({
        amount: 475,
        paymentMethod: 'test_card_token'
      });
      expect(payment.status).toBe('COMPLETED');
    });
  });
});
```

## Monitoring & Observability

### Integration Health Monitoring
```typescript
class IntegrationHealthMonitor {
  async checkIntegrationHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkIPSHealth(),
      this.checkTellerHealth(),
      this.checkAIMSHealth(),
      this.checkParkeonHealth()
    ]);

    return {
      overall: this.calculateOverallHealth(checks),
      integrations: {
        ips: checks[0],
        teller: checks[1],
        aims: checks[2],
        parkeon: checks[3]
      },
      timestamp: new Date().toISOString()
    };
  }

  private async checkIPSHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${IPS_BASE_URL}/health`);
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
```

### Integration Metrics
```typescript
// Track integration performance
const integrationMetrics = {
  ips: {
    requestCount: 0,
    errorCount: 0,
    averageResponseTime: 0,
    lastSuccessfulCall: null
  },
  teller: {
    paymentVolume: 0,
    successRate: 0,
    averageProcessingTime: 0
  },
  aims: {
    citationsIssued: 0,
    lookupRequests: 0,
    errorRate: 0
  }
};
```

## Production Deployment

### Environment Configuration
```bash
# Production Integration Environment Variables
NODE_ENV=production

# IPS Group Configuration
IPS_API_KEY=ips_prod_key_abc123
IPS_SECRET_KEY=ips_prod_secret_xyz789
IPS_BASE_URL=https://api.ipsgroup.com/smartcity/v2
IPS_WEBHOOK_SECRET=ips_webhook_prod_secret

# Teller Configuration
TELLER_API_KEY=teller_sk_live_def456
TELLER_PUBLIC_KEY=teller_pk_live_ghi789
TELLER_WEBHOOK_SECRET=teller_wh_live_secret
TELLER_ENVIRONMENT=production

# AIMS Configuration
AIMS_CLIENT_ID=aims_prod_client_123
AIMS_CLIENT_SECRET=aims_prod_secret_456
AIMS_BASE_URL=https://api.aims-enforcement.com/v1

# Parkeon Configuration
PARKEON_API_KEY=parkeon_prod_key_789
PARKEON_BASE_URL=https://api.parkeon.com/v2
PARKEON_WEBHOOK_SECRET=parkeon_webhook_secret

# Security
INTEGRATION_ENCRYPTION_KEY=integration_encrypt_key_32_chars
API_RATE_LIMIT_PER_MINUTE=1000
WEBHOOK_SIGNATURE_TOLERANCE=300
```

### Deployment Checklist
- [ ] Configure all API keys and secrets
- [ ] Set up webhook endpoints with proper signatures
- [ ] Configure rate limiting and throttling
- [ ] Set up monitoring and alerting
- [ ] Test all integration endpoints
- [ ] Verify data encryption and security
- [ ] Configure backup and failover procedures
- [ ] Document integration procedures
- [ ] Train support staff on integration issues
- [ ] Set up integration health monitoring

---

## Support & Troubleshooting

### Common Integration Issues

**Authentication Failures:**
- Verify API keys and secrets
- Check token expiration times
- Validate webhook signatures
- Review rate limiting settings

**Data Synchronization Issues:**
- Check webhook delivery status
- Verify data format compatibility
- Review timestamp handling
- Validate currency and timezone settings

**Performance Issues:**
- Monitor API response times
- Check circuit breaker status
- Review retry logic effectiveness
- Analyze error patterns

### Support Contacts

**IPS Group Support:**
- Technical: integration@ipsgroup.com
- Account: account-manager@ipsgroup.com
- Emergency: +1-800-IPS-HELP

**Teller Support:**
- Technical: developers@teller.io
- Integration: integration@teller.io
- Status: status.teller.io

**General Integration Support:**
- Email: integrations@stamford.gov
- Phone: +1-203-977-4140
- Portal: support.stamford.gov/parking

---

*Integration Guide Version: 1.0.0*
*Last Updated: December 2024*