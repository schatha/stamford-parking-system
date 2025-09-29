# System Architecture

**Stamford Parking System - Technical Architecture Overview**

This document provides a comprehensive overview of the system architecture, including component design, data flow, infrastructure, and scalability considerations.

## Architecture Overview

The Stamford Parking System follows a modern, cloud-native architecture with clear separation of concerns and microservices principles.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile Apps   │    │   Web Browser   │    │ Enforcement     │
│   (iOS/Android) │    │   (PWA Capable) │    │ Mobile Apps     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     Load Balancer       │
                    │      (Vercel Edge)      │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     Next.js App         │
                    │   (App Router/RSC)      │
                    │                         │
                    │  ┌─────────────────────┐│
                    │  │   API Routes        ││
                    │  │   /api/*            ││
                    │  └─────────────────────┘│
                    │                         │
                    │  ┌─────────────────────┐│
                    │  │   Server Components ││
                    │  │   (SSR/SSG)         ││
                    │  └─────────────────────┘│
                    │                         │
                    │  ┌─────────────────────┐│
                    │  │   Client Components ││
                    │  │   (Hydration)       ││
                    │  └─────────────────────┘│
                    └────────────┬────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
      ┌─────────▼───────┐ ┌──────▼──────┐ ┌──────▼──────┐
      │   PostgreSQL    │ │   Stripe    │ │   Storage   │
      │   Database      │ │   Payment   │ │   (Vercel   │
      │   (Railway)     │ │   Gateway   │ │   Blob)     │
      └─────────────────┘ └─────────────┘ └─────────────┘
```

## Component Architecture

### Frontend Layer

#### Web Application (Next.js 15)
```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── dashboard/
│   ├── page.tsx          # User dashboard
│   ├── sessions/         # Session management
│   ├── vehicles/         # Vehicle management
│   └── analytics/        # User analytics
├── admin/
│   ├── page.tsx          # Admin dashboard
│   ├── zones/            # Zone management
│   ├── users/            # User management
│   ├── violations/       # Violation management
│   └── reports/          # Reporting
├── api/                  # API routes
│   ├── auth/
│   ├── sessions/
│   ├── vehicles/
│   ├── zones/
│   ├── enforcement/
│   ├── analytics/
│   ├── payment/
│   └── webhooks/
├── status/
│   └── page.tsx          # System status
└── offline/
    └── page.tsx          # Offline fallback
```

#### Progressive Web App (PWA)
```
public/
├── manifest.json         # PWA manifest
├── sw.js                # Service worker
├── icons/               # App icons
├── screenshots/         # App store screenshots
└── offline.html         # Offline fallback
```

#### Component Structure
```
components/
├── ui/                  # Base UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── Layout.tsx
├── forms/               # Form components
│   ├── SessionForm.tsx
│   ├── VehicleForm.tsx
│   └── PaymentForm.tsx
├── dashboard/           # Dashboard components
│   ├── UserDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── Analytics.tsx
├── enforcement/         # Enforcement components
│   ├── ViolationForm.tsx
│   └── LicensePlateScanner.tsx
├── pwa/                 # PWA components
│   ├── InstallPrompt.tsx
│   └── OfflineIndicator.tsx
└── status/              # Status components
    └── StatusDashboard.tsx
```

### Backend Layer

#### API Architecture
```
lib/
├── auth/                # Authentication logic
│   ├── nextauth.ts      # NextAuth configuration
│   ├── jwt.ts           # JWT utilities
│   └── permissions.ts   # Permission management
├── db/                  # Database layer
│   ├── index.ts         # Prisma client
│   ├── queries/         # Database queries
│   └── migrations/      # Database migrations
├── payment/             # Payment processing
│   ├── stripe.ts        # Stripe integration
│   ├── processor.ts     # Payment logic
│   └── webhooks.ts      # Webhook handlers
├── enforcement/         # Enforcement logic
│   ├── verification.ts  # License verification
│   ├── violations.ts    # Violation management
│   └── integration.ts   # Third-party integration
├── notifications/       # Notification system
│   ├── email.ts         # Email notifications
│   ├── sms.ts           # SMS notifications
│   └── push.ts          # Push notifications
├── analytics/           # Analytics engine
│   ├── collector.ts     # Data collection
│   ├── processor.ts     # Data processing
│   └── reporter.ts      # Report generation
└── utils/               # Utility functions
    ├── validation.ts    # Input validation
    ├── encryption.ts    # Data encryption
    ├── cache.ts         # Caching utilities
    └── logger.ts        # Logging system
```

### Data Layer

#### Database Schema
```sql
-- Core entities
Users
├── id (CUID)
├── email (unique)
├── password_hash
├── name
├── phone
├── role (USER|ADMIN|ENFORCEMENT)
├── created_at
└── updated_at

Vehicles
├── id (CUID)
├── user_id (FK)
├── license_plate
├── state
├── nickname
├── vehicle_type
├── make, model, year, color
├── is_active
├── created_at
└── updated_at

ParkingZones
├── id (CUID)
├── zone_number (unique)
├── zone_name
├── location_type (STREET|GARAGE|LOT|METER)
├── rate_per_hour
├── max_duration_hours
├── address
├── coordinates (lat/lng)
├── restrictions_json
├── is_active
├── current_occupancy
├── max_capacity
├── created_at
└── updated_at

ParkingSessions
├── id (CUID)
├── user_id (FK)
├── vehicle_id (FK)
├── zone_id (FK)
├── start_time
├── end_time (nullable)
├── scheduled_end_time
├── duration_hours
├── base_cost
├── tax_amount
├── processing_fee
├── total_cost
├── status (PENDING|ACTIVE|COMPLETED|EXPIRED|CANCELLED)
├── qr_code
├── extended_from_session_id (FK, nullable)
├── created_at
└── updated_at

Transactions
├── id (CUID)
├── user_id (FK)
├── session_id (FK)
├── stripe_transaction_id
├── amount
├── status (PENDING|COMPLETED|FAILED|REFUNDED)
├── failure_reason
├── created_at
└── updated_at

Violations
├── id (CUID)
├── license_plate
├── state
├── zone_id (FK)
├── violation_type
├── description
├── fine_amount
├── status (ISSUED|PAID|CONTESTED|DISMISSED)
├── issued_at
├── due_date
├── officer_id
├── violation_number
├── evidence_json
├── location_json
├── created_at
└── updated_at
```

## Data Flow Diagrams

### User Parking Session Flow
```
User Request
     │
     ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───▶│  Next.js    │───▶│  Database   │
│  (Browser)  │    │   Server    │    │ (Postgres)  │
└─────────────┘    └─────────────┘    └─────────────┘
     │                     │                  │
     │              ┌─────────────┐          │
     │              │   Stripe    │          │
     │              │   Payment   │          │
     │              └─────────────┘          │
     │                     │                  │
     ▼                     ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  QR Code    │    │ Webhook     │    │  Session    │
│ Generation  │    │ Processing  │    │   Record    │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Enforcement Verification Flow
```
Enforcement App
     │
     ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Mobile    │───▶│   API       │───▶│  Database   │
│    App      │    │ Endpoint    │    │   Query     │
└─────────────┘    └─────────────┘    └─────────────┘
     │                     │                  │
     ▼                     ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Verification│    │   Session   │    │   Response  │
│   Result    │◀───│ Validation  │◀───│   Format    │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Payment Processing Flow
```
Payment Request
     │
     ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───▶│  Payment    │───▶│   Stripe    │
│   Request   │    │    API      │    │    API      │
└─────────────┘    └─────────────┘    └─────────────┘
     │                     │                  │
     ▼                     ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Session   │◀───│  Database   │◀───│  Webhook    │
│   Update    │    │   Update    │    │  Handler    │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Infrastructure Architecture

### Deployment Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Platform                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Edge      │  │   Lambda    │  │   Static    │     │
│  │  Network    │  │ Functions   │  │   Assets    │     │
│  │   (CDN)     │  │ (API/SSR)   │  │   (CSS/JS)  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                 Auto-scaling & Load Balancing           │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                External Services                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ PostgreSQL  │  │   Stripe    │  │   Storage   │     │
│  │ (Railway/   │  │  Payment    │  │  (Vercel    │     │
│  │ Supabase)   │  │  Gateway    │  │   Blob)     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Network Architecture
```
Internet
    │
    ▼
┌─────────────┐
│   Vercel    │
│   Edge      │ (Global CDN)
│  Network    │
└─────────┬───┘
          │
          ▼
┌─────────────┐    ┌─────────────┐
│   Lambda    │    │  Database   │
│ Functions   │───▶│ Connection  │
│  (Node.js)  │    │   Pool      │
└─────────────┘    └─────────────┘
          │                │
          ▼                ▼
┌─────────────┐    ┌─────────────┐
│   Stripe    │    │ PostgreSQL  │
│    API      │    │  Database   │
└─────────────┘    └─────────────┘
```

## Security Architecture

### Authentication & Authorization
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───▶│  NextAuth   │───▶│    JWT      │
│  Request    │    │   Server    │    │   Token     │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                  │
                           ▼                  ▼
                   ┌─────────────┐    ┌─────────────┐
                   │  Session    │    │ Permission  │
                   │   Store     │    │   Check     │
                   └─────────────┘    └─────────────┘
```

### Data Encryption
```
Data at Rest
├── Database: AES-256 encryption
├── Files: Server-side encryption
└── Secrets: Environment variables

Data in Transit
├── HTTPS/TLS 1.3
├── API: JWT signatures
└── Webhooks: HMAC verification

Sensitive Data
├── Passwords: bcrypt hashing
├── API Keys: Encrypted storage
├── Payment Data: Stripe vault
└── PII: Field-level encryption
```

## Performance Architecture

### Caching Strategy
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │    │    CDN      │    │  Server     │
│   Cache     │    │   Cache     │    │   Cache     │
│  (24 hours) │    │ (1 hour)    │    │ (5 mins)    │
└─────────────┘    └─────────────┘    └─────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Local     │    │   Edge      │    │ Application │
│  Storage    │    │  Locations  │    │   Memory    │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Database Performance
```
Connection Pooling
├── Max Connections: 20
├── Pool Timeout: 20s
├── Connection Timeout: 60s
└── Idle Timeout: 300s

Indexing Strategy
├── Primary Keys: B-tree
├── License Plates: Composite
├── Sessions: Status + User
├── Zones: Location + Active
└── Timestamps: Range queries

Query Optimization
├── Select only needed fields
├── Use prepared statements
├── Implement pagination
├── Cache frequent queries
└── Analyze slow queries
```

## Scalability Considerations

### Horizontal Scaling
```
Load Distribution
├── Geographic: Vercel Edge Network
├── Functional: API route splitting
├── Database: Read replicas
└── File Storage: CDN distribution

Auto-scaling
├── Lambda functions: Automatic
├── Database connections: Pool sizing
├── CDN: Global distribution
└── Storage: Unlimited
```

### Vertical Scaling
```
Resource Optimization
├── Function memory: 1024MB
├── Function timeout: 10s
├── Database CPU: 2 vCPU
├── Database Memory: 4GB
└── Storage: 100GB initial
```

## Monitoring & Observability

### Health Monitoring
```
Application Health
├── API Response times
├── Error rates
├── Database connectivity
├── Payment service status
└── Third-party integrations

Infrastructure Health
├── Function cold starts
├── Memory usage
├── Database connections
├── CDN hit rates
└── SSL certificate status
```

### Logging Strategy
```
Log Levels
├── ERROR: System failures
├── WARN: Recoverable issues
├── INFO: Important events
├── DEBUG: Detailed execution
└── TRACE: Request flow

Log Destinations
├── Vercel Analytics
├── Console output
├── External SIEM (optional)
└── Error tracking service
```

## Integration Architecture

### Third-party Integrations
```
Payment Gateway (Stripe)
├── Payment processing
├── Subscription management
├── Webhook handling
├── Fraud detection
└── PCI compliance

Enforcement Systems
├── IPS Group integration
├── Teller system integration
├── License plate recognition
├── Violation management
└── Real-time verification

Notification Services
├── Email: SendGrid/AWS SES
├── SMS: Twilio/AWS SNS
├── Push: Firebase/OneSignal
├── Webhooks: Custom endpoints
└── Real-time: WebSocket
```

### API Gateway Pattern
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───▶│   Next.js   │───▶│  Internal   │
│  Requests   │    │ API Routes  │    │  Services   │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │   Rate      │
                   │ Limiting &  │
                   │ Validation  │
                   └─────────────┘
```

## Development Architecture

### Code Organization
```
Separation of Concerns
├── UI Components: Presentation layer
├── Business Logic: Service layer
├── Data Access: Repository pattern
├── API Routes: Controller layer
└── Database: Data layer

Design Patterns
├── Repository Pattern: Data access
├── Factory Pattern: Service creation
├── Observer Pattern: Event handling
├── Strategy Pattern: Payment processing
└── Adapter Pattern: Third-party integration
```

### Build & Deployment Pipeline
```
Development
     │
     ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Git      │───▶│   Vercel    │───▶│ Production  │
│   Commit    │    │    Build    │    │ Deployment  │
└─────────────┘    └─────────────┘    └─────────────┘
     │                     │                  │
     ▼                     ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ TypeScript  │    │    Tests    │    │   Health    │
│   Check     │    │   & QA      │    │   Check     │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Future Architecture Considerations

### Microservices Migration
```
Current Monolith → Future Microservices
├── Authentication Service
├── Payment Service
├── Session Management Service
├── Enforcement Service
├── Analytics Service
├── Notification Service
└── Reporting Service
```

### Event-Driven Architecture
```
Event Bus
├── Session Started
├── Payment Processed
├── Session Expired
├── Violation Created
└── Zone Updated

Event Handlers
├── Notification triggers
├── Analytics updates
├── Audit logging
├── Cache invalidation
└── Third-party sync
```

### Data Architecture Evolution
```
Current: Single Database
Future: Distributed Data
├── Operational: PostgreSQL
├── Analytics: Data warehouse
├── Cache: Redis cluster
├── Search: Elasticsearch
└── Files: Object storage
```

---

## Architecture Decisions

### Technology Choices

**Frontend Framework: Next.js 15**
- Server-side rendering for SEO
- App Router for modern React patterns
- Built-in API routes
- Excellent Vercel integration
- TypeScript support

**Database: PostgreSQL**
- ACID compliance for financial data
- Strong consistency guarantees
- Rich data types (JSON, spatial)
- Mature ecosystem
- Excellent performance

**Payment Gateway: Stripe**
- PCI compliance handled
- Comprehensive API
- Webhook reliability
- Global availability
- Strong fraud protection

**Deployment: Vercel**
- Serverless architecture
- Global edge network
- Automatic scaling
- Git integration
- Zero-configuration deployment

### Trade-offs

**Benefits:**
- ✅ Rapid development and deployment
- ✅ Automatic scaling and performance
- ✅ Strong security foundations
- ✅ Cost-effective for startup
- ✅ Modern development experience

**Limitations:**
- ⚠️ Vendor lock-in with Vercel
- ⚠️ Cold start latency for functions
- ⚠️ Limited control over infrastructure
- ⚠️ Database not co-located
- ⚠️ Observability limitations

---

*Architecture Documentation Version: 1.0.0*
*Last Updated: December 2024*