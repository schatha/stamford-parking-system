export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'USER' | 'ADMIN' | 'ENFORCEMENT';
  createdAt: Date;
  updatedAt: Date;
};

export type Vehicle = {
  id: string;
  userId: string;
  licensePlate: string;
  state: string;
  nickname?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ParkingZone = {
  id: string;
  zoneNumber: string;
  zoneName: string;
  locationType: 'STREET' | 'GARAGE' | 'LOT' | 'METER';
  ratePerHour: number;
  maxDurationHours: number;
  address: string;
  restrictionsJson?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ParkingSession = {
  id: string;
  userId: string;
  vehicleId: string;
  zoneId: string;
  startTime: Date;
  endTime?: Date;
  scheduledEndTime: Date;
  durationHours: number;
  baseCost: number;
  taxAmount: number;
  processingFee: number;
  totalCost: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED' | 'EXTENDED';
  extendedFromSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  vehicle?: Vehicle;
  zone?: ParkingZone;
  transactions?: Transaction[];
};

export type Transaction = {
  id: string;
  userId: string;
  sessionId: string;
  stripeTransactionId?: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  session?: ParkingSession;
};

export type ParkingSessionWithDetails = ParkingSession & {
  user: User;
  vehicle: Vehicle;
  zone: ParkingZone;
  transactions: Transaction[];
};

export type CreateVehicleInput = {
  licensePlate: string;
  state: string;
  nickname?: string;
};

export type CreateParkingSessionInput = {
  vehicleId: string;
  zoneId: string;
  durationHours: number;
};

export type ExtendParkingSessionInput = {
  sessionId: string;
  additionalHours: number;
};

export type PaymentIntent = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
};

export type ZoneRestrictions = {
  timeRestrictions?: {
    startTime: string;
    endTime: string;
    daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
    restrictionType: 'RUSH_HOUR' | 'STREET_CLEANING' | 'PERMIT_ONLY' | 'NO_PARKING' | 'LOADING_ZONE';
    description: string;
  }[];
  vehicleTypeRestrictions?: string[];
  permitRequired?: boolean;
  handicapOnly?: boolean;
  maxVehicleLength?: number;
  allowedDuringRestrictions?: boolean;
};

export type RestrictionCheckResult = {
  canPark: boolean;
  restrictions: Array<{
    type: string;
    description: string;
    activeUntil?: Date;
  }>;
  warnings?: Array<{
    type: string;
    message: string;
    warningTime?: Date;
  }>;
};

export type DashboardStats = {
  totalRevenue: number;
  activeSessions: number;
  totalSessions: number;
  todaysRevenue: number;
  recentSessions: ParkingSessionWithDetails[];
};

export type SessionStatus = 'active' | 'expiring' | 'expired' | 'completed';

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type SessionFilters = {
  status?: string;
  zoneId?: string;
  licensePlate?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

export type CostBreakdown = {
  baseCost: number;
  taxAmount: number;
  processingFee: number;
  totalCost: number;
  taxRate: number;
  processingFeeRate: number;
};

export type PaymentIntentResponse = {
  clientSecret: string;
  paymentIntentId: string;
  costBreakdown: CostBreakdown;
  sessionDetails: {
    vehicle: {
      id: string;
      licensePlate: string;
      state: string;
      nickname?: string;
    };
    zone: {
      id: string;
      zoneNumber: string;
      zoneName: string;
      ratePerHour: number;
    };
    duration: number;
    scheduledEndTime: string;
  };
};

export type ProcessPaymentResponse = {
  success: boolean;
  session: {
    id: string;
    status: string;
    vehicle: {
      licensePlate: string;
      state: string;
      nickname?: string;
    };
    zone: {
      zoneNumber: string;
      zoneName: string;
      ratePerHour: number;
    };
    startTime: string;
    scheduledEndTime: string;
    duration: number;
    costBreakdown: CostBreakdown;
  };
  transaction: {
    id: string;
    stripeTransactionId: string;
    amount: number;
    status: string;
  };
};