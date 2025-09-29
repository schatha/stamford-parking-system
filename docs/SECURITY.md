# Security Documentation

**Stamford Parking System - Security Architecture & Compliance**

This document outlines the comprehensive security measures, PCI compliance approach, data protection strategies, and security best practices implemented in the Stamford Parking System.

## Security Overview

The Stamford Parking System implements defense-in-depth security architecture with multiple layers of protection, including data encryption, access controls, secure authentication, and PCI DSS compliance for payment processing.

### Security Principles
- **Zero Trust Architecture** - Never trust, always verify
- **Defense in Depth** - Multiple layers of security controls
- **Principle of Least Privilege** - Minimal access rights
- **Data Minimization** - Collect only necessary data
- **Privacy by Design** - Security built into the system
- **Continuous Monitoring** - Real-time threat detection

## PCI DSS Compliance

### Compliance Scope
The Stamford Parking System achieves PCI DSS compliance through a combination of secure architecture design and third-party payment processor integration.

```
┌─────────────────────────────────────────────────────────────┐
│                    PCI DSS Compliance Scope                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Out of Scope  │    │    In Scope     │                │
│  │                 │    │                 │                │
│  │  • Stripe Vault │    │  • Web App      │                │
│  │  • Card Storage │    │  • API Routes   │                │
│  │  • Processing   │    │  • Auth System  │                │
│  │  • Tokenization │    │  • Database     │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                       │                         │
│           ▼                       ▼                         │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  Stripe Secure  │    │   SAQ-A EP      │                │
│  │   Environment   │    │  Compliance     │                │
│  └─────────────────┘    └─────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### PCI DSS Requirements Implementation

#### Requirement 1: Install and maintain firewalls
```yaml
# Vercel Edge Network Security
firewall_rules:
  - type: "GEOGRAPHIC"
    action: "BLOCK"
    countries: ["CN", "RU", "NK"] # High-risk countries

  - type: "RATE_LIMITING"
    action: "THROTTLE"
    limit: "100 requests/minute"

  - type: "BOT_PROTECTION"
    action: "CHALLENGE"
    score_threshold: 0.5

# Application-level protections
cors_policy:
  allowed_origins: ["https://stamford-parking-system.vercel.app"]
  allowed_methods: ["GET", "POST", "PUT", "DELETE"]
  allowed_headers: ["Authorization", "Content-Type"]
  credentials: true
```

#### Requirement 2: Remove vendor defaults and secure systems
```typescript
// Security configuration
const securityConfig = {
  // Remove default secrets
  secrets: {
    nextAuthSecret: process.env.NEXTAUTH_SECRET, // Required 32+ chars
    databaseUrl: process.env.DATABASE_URL,
    stripeSecret: process.env.STRIPE_SECRET_KEY
  },

  // Secure headers
  headers: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://js.stripe.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https://cdn.stripe.com;
      connect-src 'self' https://api.stripe.com;
      frame-src https://js.stripe.com;
    `.replace(/\s+/g, ' ').trim()
  },

  // Cookie security
  cookies: {
    secure: true, // HTTPS only
    httpOnly: true, // No client-side access
    sameSite: 'strict', // CSRF protection
    domain: 'stamford-parking-system.vercel.app'
  }
};
```

#### Requirement 3: Protect stored cardholder data
```typescript
// Data encryption at rest
class DataEncryption {
  private encryptionKey: Buffer;

  constructor() {
    this.encryptionKey = crypto.scryptSync(
      process.env.ENCRYPTION_PASSWORD,
      process.env.ENCRYPTION_SALT,
      32
    );
  }

  // Encrypt sensitive PII data
  encryptPII(data: string): string {
    const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);
    const iv = crypto.randomBytes(16);
    cipher.setIV(iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  // Note: Credit card data is NEVER stored - handled by Stripe
  // Only store Stripe payment method tokens
  storePaymentToken(token: string): string {
    // Validate token format
    if (!token.startsWith('pm_') && !token.startsWith('card_')) {
      throw new Error('Invalid payment token format');
    }
    return token; // Store as-is (Stripe tokens are safe to store)
  }
}

// Database field encryption
const userSchema = {
  email: 'VARCHAR(255)', // Encrypted
  phone: 'VARCHAR(255)', // Encrypted
  name: 'VARCHAR(255)',  // Encrypted
  // Credit card data: NEVER STORED
  stripeCustomerId: 'VARCHAR(255)', // Stripe customer reference only
  stripePaymentMethods: 'JSON' // Array of Stripe payment method IDs only
};
```

#### Requirement 4: Encrypt transmission of cardholder data
```typescript
// TLS configuration
const tlsConfig = {
  minVersion: 'TLSv1.2',
  ciphers: [
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-SHA384',
    'ECDHE-RSA-AES128-SHA256'
  ],
  honorCipherOrder: true,
  secureProtocol: 'TLSv1_2_method'
};

// All credit card transmission through Stripe's secure channels
const stripeSecureTransmission = {
  // Client-side: Stripe Elements (PCI compliant)
  frontend: {
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secureFields: ['cardNumber', 'expiryDate', 'cvc'],
    tokenization: 'client-side', // Never touches our servers
    transmission: 'TLS 1.3 to Stripe'
  },

  // Server-side: Stripe API calls only
  backend: {
    apiCalls: 'https://api.stripe.com', // PCI Level 1 compliant
    authentication: 'Bearer token',
    encryption: 'TLS 1.3',
    dataHandled: ['payment_intent_id', 'customer_id'] // No raw card data
  }
};
```

#### Requirement 5: Protect against malware
```typescript
// Content Security Policy
const cspPolicy = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Stripe Elements
    'https://js.stripe.com'
  ],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https://cdn.stripe.com'],
  'connect-src': ["'self'", 'https://api.stripe.com'],
  'frame-src': ['https://js.stripe.com'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};

// Input sanitization
class InputSanitizer {
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }

  static validateLicensePlate(plate: string): boolean {
    const pattern = /^[A-Z0-9]{1,8}$/;
    return pattern.test(plate.toUpperCase());
  }

  static validateEmail(email: string): boolean {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email) && email.length <= 254;
  }
}
```

#### Requirement 6: Develop secure systems and applications
```typescript
// Secure development practices
const securityMiddleware = {
  // Input validation
  validateInput: (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      email: Joi.string().email().max(254),
      licensePlate: Joi.string().alphanum().max(8),
      amount: Joi.number().positive().max(10000),
      duration: Joi.number().positive().max(24)
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    next();
  },

  // SQL injection protection (using Prisma ORM)
  // All queries are parameterized and type-safe
  safeQuery: async (userId: string) => {
    return await prisma.user.findUnique({
      where: { id: userId }, // Automatically parameterized
      select: {
        id: true,
        email: true,
        name: true
        // Exclude sensitive fields
      }
    });
  },

  // XSS protection
  xssProtection: (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  },

  // CSRF protection
  csrfProtection: (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['x-csrf-token'];
    const sessionToken = req.session?.csrfToken;

    if (!token || token !== sessionToken) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    next();
  }
};
```

#### Requirement 7: Restrict access by business need-to-know
```typescript
// Role-based access control
enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  ENFORCEMENT = 'ENFORCEMENT',
  SUPPORT = 'SUPPORT'
}

const permissions = {
  [UserRole.USER]: [
    'sessions:create',
    'sessions:read:own',
    'sessions:update:own',
    'vehicles:create:own',
    'vehicles:read:own',
    'payments:create:own'
  ],
  [UserRole.ADMIN]: [
    'sessions:*',
    'vehicles:*',
    'zones:*',
    'users:*',
    'reports:*',
    'analytics:*'
  ],
  [UserRole.ENFORCEMENT]: [
    'sessions:read:all',
    'vehicles:read:all',
    'violations:create',
    'violations:read',
    'enforcement:verify'
  ],
  [UserRole.SUPPORT]: [
    'sessions:read:all',
    'users:read',
    'support:*'
  ]
};

// Access control middleware
const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const userPermissions = permissions[user.role];

    const hasPermission = userPermissions.some(p =>
      p === permission ||
      p.endsWith(':*') && permission.startsWith(p.slice(0, -1))
    );

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

#### Requirement 8: Assign unique ID to each person with computer access
```typescript
// User authentication and identification
class AuthenticationSystem {
  // Unique user identification
  async createUser(userData: UserCreateInput): Promise<User> {
    const userId = cuid(); // Cryptographically unique identifier

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    return await prisma.user.create({
      data: {
        id: userId,
        email: userData.email,
        passwordHash: hashedPassword,
        name: userData.name,
        role: UserRole.USER,
        lastLogin: null,
        loginAttempts: 0,
        accountLocked: false,
        passwordLastChanged: new Date(),
        mfaEnabled: false,
        auditLog: {
          create: {
            action: 'USER_CREATED',
            timestamp: new Date(),
            ipAddress: userData.ipAddress,
            userAgent: userData.userAgent
          }
        }
      }
    });
  }

  // Multi-factor authentication
  async enableMFA(userId: string): Promise<{ secret: string; qrCode: string }> {
    const secret = speakeasy.generateSecret({
      name: 'Stamford Parking',
      issuer: 'City of Stamford'
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: this.encryptMFASecret(secret.base32),
        mfaEnabled: true
      }
    });

    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url
    };
  }

  // Password policy enforcement
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
  }
}
```

#### Requirement 9: Restrict physical access to cardholder data
```yaml
# Physical security (Vercel managed infrastructure)
physical_security:
  datacenter:
    provider: "Vercel/AWS"
    certifications: ["SOC 2 Type II", "ISO 27001", "PCI DSS Level 1"]
    access_control: "Biometric and badge-based"
    surveillance: "24/7 CCTV monitoring"

  data_storage:
    encryption: "AES-256 at rest"
    backups: "Encrypted and geographically distributed"
    destruction: "Secure data destruction procedures"

  network_equipment:
    firewalls: "Hardware and software firewalls"
    intrusion_detection: "Real-time monitoring"
    access_logging: "Complete audit trail"
```

#### Requirement 10: Track and monitor access to network resources
```typescript
// Comprehensive audit logging
class AuditLogger {
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    await prisma.auditLog.create({
      data: {
        eventType: event.type,
        userId: event.userId,
        sessionId: event.sessionId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        resource: event.resource,
        action: event.action,
        result: event.result,
        timestamp: new Date(),
        additionalData: event.metadata
      }
    });

    // Real-time security monitoring
    if (event.severity === 'HIGH') {
      await this.triggerSecurityAlert(event);
    }
  }

  // Monitor for suspicious activities
  async detectAnomalies(userId: string): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];

    // Multiple failed login attempts
    const failedLogins = await this.getFailedLoginCount(userId, '1 hour');
    if (failedLogins >= 5) {
      alerts.push({
        type: 'BRUTE_FORCE_ATTEMPT',
        severity: 'HIGH',
        description: `${failedLogins} failed login attempts in the last hour`
      });
    }

    // Geographic anomalies
    const lastKnownLocation = await this.getLastKnownLocation(userId);
    const currentLocation = await this.getCurrentLocation(userId);
    if (this.isLocationAnomalous(lastKnownLocation, currentLocation)) {
      alerts.push({
        type: 'GEOGRAPHIC_ANOMALY',
        severity: 'MEDIUM',
        description: 'Login from unusual geographic location'
      });
    }

    return alerts;
  }
}

// Security monitoring dashboard
interface SecurityMetrics {
  loginAttempts: {
    successful: number;
    failed: number;
    suspicious: number;
  };
  apiCalls: {
    total: number;
    authenticated: number;
    rateimited: number;
    errors: number;
  };
  paymentActivity: {
    transactions: number;
    successRate: number;
    fraudAttempts: number;
  };
  systemHealth: {
    uptime: number;
    responseTime: number;
    errorRate: number;
  };
}
```

#### Requirement 11: Regularly test security systems
```typescript
// Automated security testing
const securityTests = {
  // Vulnerability scanning
  vulnerabilityScanning: {
    frequency: 'weekly',
    tools: ['npm audit', 'Snyk', 'OWASP ZAP'],
    scope: ['dependencies', 'application', 'infrastructure']
  },

  // Penetration testing
  penetrationTesting: {
    frequency: 'quarterly',
    scope: ['web application', 'API endpoints', 'authentication'],
    provider: 'certified security firm'
  },

  // Security code review
  codeReview: {
    frequency: 'every commit',
    tools: ['SonarQube', 'CodeQL', 'ESLint Security'],
    coverage: 'all code changes'
  }
};

// Automated security checks
class SecurityTesting {
  async runSecurityScan(): Promise<SecurityScanResult> {
    const results = {
      vulnerabilities: await this.scanVulnerabilities(),
      dependencies: await this.auditDependencies(),
      configuration: await this.checkConfiguration(),
      permissions: await this.auditPermissions()
    };

    return results;
  }

  private async scanVulnerabilities(): Promise<Vulnerability[]> {
    // OWASP ZAP integration
    const zapClient = new ZapClient(process.env.ZAP_API_KEY);
    return await zapClient.activeScan({
      target: process.env.APPLICATION_URL,
      scanPolicy: 'comprehensive'
    });
  }
}
```

#### Requirement 12: Maintain information security policy
```yaml
# Information Security Policy
security_policy:
  purpose: "Protect cardholder data and maintain PCI DSS compliance"
  scope: "All systems handling payment card data"

  responsibilities:
    security_officer: "Overall security program management"
    developers: "Secure coding practices and code review"
    operations: "Infrastructure security and monitoring"
    compliance: "PCI DSS compliance verification"

  procedures:
    incident_response: "Documented incident response plan"
    vulnerability_management: "Regular scanning and remediation"
    access_management: "User provisioning and deprovisioning"
    change_management: "Security review of all changes"

  training:
    frequency: "Annual mandatory training"
    content: "PCI DSS requirements and secure practices"
    verification: "Training completion tracking"

  compliance:
    reviews: "Quarterly compliance reviews"
    audits: "Annual PCI DSS assessment"
    reporting: "Monthly compliance reports"
```

## Data Protection & Privacy

### GDPR Compliance
```typescript
// GDPR data protection implementation
class DataProtectionManager {
  // Right to access
  async exportUserData(userId: string): Promise<UserDataExport> {
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        vehicles: true,
        parkingSessions: true,
        transactions: true,
        auditLogs: true
      }
    });

    return this.formatDataExport(userData);
  }

  // Right to rectification
  async updateUserData(userId: string, updates: UserDataUpdate): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });

    await this.logDataChange(userId, 'DATA_UPDATED', updates);
  }

  // Right to erasure (Right to be forgotten)
  async deleteUserData(userId: string, reason: string): Promise<void> {
    // Anonymize data instead of deletion for audit requirements
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@anonymized.local`,
        name: 'Deleted User',
        phone: null,
        isDeleted: true,
        deletedAt: new Date(),
        deletionReason: reason
      }
    });

    await this.logDataChange(userId, 'DATA_DELETED', { reason });
  }

  // Data portability
  async generateDataPortabilityExport(userId: string): Promise<Buffer> {
    const userData = await this.exportUserData(userId);
    return Buffer.from(JSON.stringify(userData, null, 2));
  }

  // Privacy settings management
  async updatePrivacySettings(userId: string, settings: PrivacySettings): Promise<void> {
    await prisma.userPrivacySettings.upsert({
      where: { userId },
      update: settings,
      create: { userId, ...settings }
    });
  }
}

// Cookie consent management
const cookiePolicy = {
  essential: {
    description: "Required for basic site functionality",
    cookies: ["session", "csrf_token", "preferences"],
    consent_required: false
  },
  analytics: {
    description: "Help us understand how the site is used",
    cookies: ["_ga", "_gid", "analytics_session"],
    consent_required: true
  },
  marketing: {
    description: "Used for targeted advertising",
    cookies: ["marketing_id", "ad_tracking"],
    consent_required: true
  }
};
```

### Data Encryption Standards

#### Encryption at Rest
```typescript
// Database encryption
const encryptionConfig = {
  // Field-level encryption for PII
  encryptedFields: [
    'users.email',
    'users.phone',
    'users.name',
    'vehicles.license_plate'
  ],

  // Encryption algorithm
  algorithm: 'aes-256-gcm',
  keyRotation: '90 days',

  // Database encryption
  database: {
    provider: 'Railway PostgreSQL',
    encryption: 'AES-256',
    backups: 'Encrypted at rest',
    ssl: 'Required'
  },

  // File encryption
  files: {
    uploads: 'AES-256 client-side encryption',
    logs: 'AES-256 server-side encryption',
    exports: 'Password-protected archives'
  }
};

class FieldEncryption {
  private cipher: string = 'aes-256-gcm';
  private key: Buffer;

  constructor() {
    this.key = crypto.scryptSync(
      process.env.FIELD_ENCRYPTION_PASSWORD,
      process.env.FIELD_ENCRYPTION_SALT,
      32
    );
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.cipher, this.key);
    cipher.setIV(iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(ciphertext: string): string {
    const [ivHex, authTagHex, encrypted] = ciphertext.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipher(this.cipher, this.key);
    decipher.setIV(iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

#### Encryption in Transit
```typescript
// TLS configuration
const tlsSettings = {
  // Minimum TLS version
  minVersion: 'TLSv1.2',

  // Cipher suites
  ciphers: [
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-SHA384',
    'ECDHE-RSA-AES128-SHA256'
  ],

  // Certificate pinning
  certificatePinning: {
    enabled: true,
    pins: [
      'sha256/PRIMARY_CERT_HASH',
      'sha256/BACKUP_CERT_HASH'
    ]
  },

  // HSTS
  strictTransportSecurity: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
};

// API encryption
class APIEncryption {
  // Request/response encryption for sensitive endpoints
  encryptAPIPayload(payload: any, publicKey: string): string {
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      Buffer.from(JSON.stringify(payload))
    );

    return encrypted.toString('base64');
  }

  // Webhook signature verification
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  }
}
```

## Application Security

### Input Validation & Sanitization
```typescript
// Comprehensive input validation
class InputValidator {
  // SQL injection prevention
  static validateDatabaseInput(input: any): boolean {
    if (typeof input === 'string') {
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
        /(--|\/\*|\*\/)/,
        /(\b(OR|AND)\b.*=.*)/i,
        /(;|\||&)/
      ];

      return !sqlPatterns.some(pattern => pattern.test(input));
    }
    return true;
  }

  // XSS prevention
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      ALLOW_DATA_ATTR: false
    });
  }

  // Business logic validation
  static validateParkingSession(session: ParkingSessionInput): ValidationResult {
    const errors: string[] = [];

    if (session.durationHours <= 0 || session.durationHours > 24) {
      errors.push('Duration must be between 1 and 24 hours');
    }

    if (session.amount <= 0 || session.amount > 10000) {
      errors.push('Amount must be between $0.01 and $100.00');
    }

    if (!this.validateLicensePlate(session.licensePlate)) {
      errors.push('Invalid license plate format');
    }

    return { valid: errors.length === 0, errors };
  }

  static validateLicensePlate(plate: string): boolean {
    // Connecticut license plate patterns
    const patterns = [
      /^[A-Z]{2,3}[0-9]{3,4}$/, // Standard format
      /^[0-9]{3}[A-Z]{3}$/, // Alternate format
      /^[A-Z]{1,2}[0-9]{1,4}[A-Z]{0,2}$/ // Vanity plates
    ];

    return patterns.some(pattern => pattern.test(plate.toUpperCase()));
  }
}

// Rate limiting and DoS protection
class RateLimiter {
  private attempts = new Map<string, number[]>();

  isAllowed(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.attempts.has(identifier)) {
      this.attempts.set(identifier, []);
    }

    const userAttempts = this.attempts.get(identifier)!;

    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => time > windowStart);

    if (recentAttempts.length >= limit) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);

    return true;
  }
}
```

### Session Security
```typescript
// Secure session management
class SessionManager {
  // Session configuration
  private sessionConfig = {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // No client-side access
    sameSite: 'strict' as const, // CSRF protection
    rolling: true, // Extend on activity
    regenerate: true // Regenerate on privilege change
  };

  // Create secure session
  async createSession(userId: string, userAgent: string, ipAddress: string): Promise<string> {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.sessionConfig.maxAge);

    await prisma.session.create({
      data: {
        id: sessionId,
        userId,
        userAgent,
        ipAddress,
        expiresAt,
        isActive: true,
        lastActivity: new Date()
      }
    });

    return sessionId;
  }

  // Validate session
  async validateSession(sessionId: string, userAgent: string, ipAddress: string): Promise<User | null> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true }
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      return null;
    }

    // Security checks
    if (session.userAgent !== userAgent) {
      await this.invalidateSession(sessionId, 'USER_AGENT_MISMATCH');
      return null;
    }

    // Update last activity
    await prisma.session.update({
      where: { id: sessionId },
      data: { lastActivity: new Date() }
    });

    return session.user;
  }

  // Session invalidation
  async invalidateSession(sessionId: string, reason: string): Promise<void> {
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        invalidatedAt: new Date(),
        invalidationReason: reason
      }
    });
  }

  // Concurrent session limits
  async enforceConcurrentSessionLimit(userId: string, maxSessions: number = 3): Promise<void> {
    const activeSessions = await prisma.session.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      orderBy: { lastActivity: 'desc' }
    });

    if (activeSessions.length > maxSessions) {
      const sessionsToRemove = activeSessions.slice(maxSessions);
      await Promise.all(
        sessionsToRemove.map(session =>
          this.invalidateSession(session.id, 'CONCURRENT_SESSION_LIMIT')
        )
      );
    }
  }
}
```

## Infrastructure Security

### Cloud Security (Vercel)
```yaml
# Vercel security configuration
vercel_security:
  edge_network:
    ddos_protection: "Automatic DDoS mitigation"
    bot_protection: "Advanced bot detection"
    rate_limiting: "Configurable rate limits"

  functions:
    runtime: "Node.js 18 (secure)"
    timeout: "10 seconds maximum"
    memory: "1024MB maximum"
    environment: "Isolated execution"

  domains:
    ssl_certificates: "Automatic Let's Encrypt"
    custom_domains: "Supported with verification"
    redirects: "HTTPS enforcement"

  monitoring:
    uptime: "99.99% SLA"
    logs: "Real-time function logs"
    analytics: "Built-in analytics"
    alerts: "Custom alert rules"
```

### Database Security
```typescript
// Database security configuration
const databaseSecurity = {
  connection: {
    ssl: 'require',
    sslmode: 'require',
    connectionLimit: 20,
    idleTimeout: 300000,
    queryTimeout: 30000
  },

  authentication: {
    method: 'password',
    passwordPolicy: {
      minLength: 16,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    }
  },

  authorization: {
    principleOfLeastPrivilege: true,
    roles: {
      'app_read': ['SELECT'],
      'app_write': ['INSERT', 'UPDATE'],
      'app_admin': ['ALL']
    }
  },

  auditing: {
    logConnections: true,
    logDisconnections: true,
    logStatements: 'ddl',
    logDuration: true,
    logLinePrefix: '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
  },

  backup: {
    encryption: 'AES-256',
    frequency: 'daily',
    retention: '30 days',
    verification: 'automated'
  }
};

// Query security
class SecureDatabase {
  // Parameterized queries only
  async findUserSessions(userId: string, limit: number = 20): Promise<ParkingSession[]> {
    return await prisma.parkingSession.findMany({
      where: { userId }, // Automatically parameterized
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        zone: true,
        vehicle: true
      }
    });
  }

  // Input sanitization
  private sanitizeSearchInput(input: string): string {
    return input
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .trim()
      .substring(0, 100); // Limit length
  }

  // Connection pooling
  async executeTransaction<T>(operation: () => Promise<T>): Promise<T> {
    return await prisma.$transaction(operation, {
      maxWait: 5000, // 5 seconds
      timeout: 10000, // 10 seconds
      isolationLevel: 'ReadCommitted'
    });
  }
}
```

## Incident Response

### Security Incident Response Plan
```typescript
// Incident response system
class IncidentResponseSystem {
  // Incident classification
  classifyIncident(incident: SecurityIncident): IncidentSeverity {
    const criteriaMap = {
      CRITICAL: [
        'payment_data_breach',
        'system_compromise',
        'data_exfiltration'
      ],
      HIGH: [
        'unauthorized_access',
        'privilege_escalation',
        'malware_detected'
      ],
      MEDIUM: [
        'brute_force_attack',
        'suspicious_activity',
        'configuration_error'
      ],
      LOW: [
        'failed_login_attempts',
        'minor_policy_violation',
        'informational_alert'
      ]
    };

    for (const [severity, criteria] of Object.entries(criteriaMap)) {
      if (criteria.includes(incident.type)) {
        return severity as IncidentSeverity;
      }
    }

    return 'MEDIUM'; // Default classification
  }

  // Automated incident response
  async respondToIncident(incident: SecurityIncident): Promise<void> {
    const severity = this.classifyIncident(incident);

    // Immediate automated actions
    switch (severity) {
      case 'CRITICAL':
        await this.lockdownSystem();
        await this.notifyEmergencyTeam();
        await this.preserveEvidence();
        break;

      case 'HIGH':
        await this.isolateAffectedSystems();
        await this.notifySecurityTeam();
        await this.increaseMonitoring();
        break;

      case 'MEDIUM':
        await this.logIncident(incident);
        await this.notifyOperationsTeam();
        break;

      case 'LOW':
        await this.logIncident(incident);
        break;
    }

    // Create incident ticket
    await this.createIncidentTicket(incident, severity);
  }

  // Emergency procedures
  private async lockdownSystem(): Promise<void> {
    // Disable non-essential API endpoints
    await this.disableNonEssentialEndpoints();

    // Rate limit all traffic
    await this.enableEmergencyRateLimit();

    // Notify monitoring systems
    await this.triggerEmergencyAlerts();
  }

  // Evidence preservation
  private async preserveEvidence(): Promise<void> {
    const timestamp = new Date().toISOString();

    // Snapshot current system state
    await this.captureSystemSnapshot();

    // Preserve logs
    await this.backupSecurityLogs(timestamp);

    // Lock affected accounts
    await this.lockSuspiciousAccounts();
  }
}

// Breach notification procedures
class BreachNotificationManager {
  // Regulatory notification requirements
  async handleDataBreach(breach: DataBreach): Promise<void> {
    // Assess breach severity
    const assessment = await this.assessBreachSeverity(breach);

    if (assessment.requiresNotification) {
      // PCI DSS notification (immediate)
      if (assessment.affectsPaymentData) {
        await this.notifyPCIAuthorities(breach);
      }

      // State notification (within 72 hours)
      if (assessment.affectsResidents) {
        await this.notifyStateAuthorities(breach);
      }

      // Customer notification (without undue delay)
      if (assessment.affectsCustomers) {
        await this.notifyAffectedCustomers(breach);
      }
    }
  }

  private async notifyPCIAuthorities(breach: DataBreach): Promise<void> {
    const notification = {
      incidentId: breach.id,
      timestamp: breach.discoveredAt,
      affectedSystems: breach.affectedSystems,
      dataTypes: breach.dataTypes,
      estimatedRecords: breach.estimatedRecords,
      containmentActions: breach.containmentActions
    };

    // Notify card brands and acquiring bank
    await this.sendPCINotification(notification);
  }
}
```

## Compliance Monitoring

### Continuous Compliance Monitoring
```typescript
// Compliance monitoring system
class ComplianceMonitor {
  // PCI DSS compliance checks
  async runPCIComplianceCheck(): Promise<ComplianceReport> {
    const checks = await Promise.all([
      this.checkNetworkSecurity(),
      this.checkDataProtection(),
      this.checkAccessControls(),
      this.checkMonitoring(),
      this.checkVulnerabilityManagement(),
      this.checkSecurityPolicies()
    ]);

    const overallScore = this.calculateComplianceScore(checks);

    return {
      timestamp: new Date(),
      overallScore,
      requirements: checks,
      recommendations: this.generateRecommendations(checks),
      nextAssessment: this.getNextAssessmentDate()
    };
  }

  // Automated security scanning
  async runSecurityScan(): Promise<SecurityScanResult> {
    return {
      vulnerabilities: await this.scanVulnerabilities(),
      configurations: await this.checkSecurityConfigurations(),
      dependencies: await this.auditDependencies(),
      certificates: await this.checkCertificates(),
      permissions: await this.auditPermissions()
    };
  }

  // Compliance reporting
  async generateComplianceReport(period: DateRange): Promise<ComplianceReport> {
    const data = await this.gatherComplianceData(period);

    return {
      period,
      executiveSummary: this.generateExecutiveSummary(data),
      detailedFindings: this.generateDetailedFindings(data),
      riskAssessment: this.performRiskAssessment(data),
      remedrationPlan: this.createRemediationPlan(data),
      attachments: this.gatherSupportingDocuments(data)
    };
  }
}
```

---

## Security Training & Awareness

### Security Training Program
```yaml
security_training:
  mandatory_training:
    frequency: "Annual"
    modules:
      - "PCI DSS Fundamentals"
      - "Secure Coding Practices"
      - "Data Protection and Privacy"
      - "Incident Response Procedures"
      - "Social Engineering Awareness"

  role_specific_training:
    developers:
      - "OWASP Top 10"
      - "Secure Development Lifecycle"
      - "Code Review Best Practices"

    administrators:
      - "Infrastructure Security"
      - "Access Management"
      - "Monitoring and Logging"

    support_staff:
      - "Customer Data Protection"
      - "Incident Escalation"
      - "Privacy Regulations"

  continuous_education:
    security_updates: "Monthly security bulletins"
    workshops: "Quarterly security workshops"
    certifications: "Support for security certifications"
```

### Security Awareness Metrics
```typescript
// Security awareness tracking
interface SecurityMetrics {
  trainingCompletion: {
    overall: number;
    byRole: Record<string, number>;
    overdue: number;
  };

  incidentReporting: {
    totalReports: number;
    falsePositives: number;
    responseTime: number;
  };

  securityCulture: {
    phishingTestResults: number;
    securityQuestions: number;
    complianceScore: number;
  };
}
```

---

## Security Checklist

### Pre-Deployment Security Checklist
- [ ] All secrets stored securely in environment variables
- [ ] HTTPS enabled with strong TLS configuration
- [ ] Content Security Policy configured
- [ ] Input validation implemented for all endpoints
- [ ] SQL injection protection verified
- [ ] XSS protection implemented
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Authentication and authorization working
- [ ] Session security implemented
- [ ] Error handling doesn't leak sensitive information
- [ ] Logging and monitoring configured
- [ ] Security headers implemented
- [ ] Dependency vulnerabilities addressed
- [ ] PCI DSS requirements met
- [ ] GDPR compliance verified
- [ ] Incident response plan tested
- [ ] Security training completed
- [ ] Compliance documentation updated

### Ongoing Security Maintenance
- [ ] Monthly vulnerability scans
- [ ] Quarterly penetration testing
- [ ] Annual PCI DSS assessment
- [ ] Regular security training updates
- [ ] Incident response plan reviews
- [ ] Security policy updates
- [ ] Access review and cleanup
- [ ] Certificate renewal monitoring
- [ ] Security metrics reporting
- [ ] Compliance audit preparation

---

*Security Documentation Version: 1.0.0*
*Last Updated: December 2024*
*Classification: Confidential*