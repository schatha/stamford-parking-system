-- =====================================================================================
-- Stamford Parking System Database Migration Script
-- =====================================================================================
-- This script creates the complete database schema for the municipal parking system
-- Compatible with PostgreSQL (Railway, local, or any PostgreSQL instance)
--
-- Run this script if you need to manually set up the database schema
-- Alternatively, use Prisma migrations: npx prisma migrate dev
-- =====================================================================================

-- Drop existing tables if they exist (be careful in production!)
-- Uncomment the following lines if you need to reset the database
-- DROP TABLE IF EXISTS "transactions" CASCADE;
-- DROP TABLE IF EXISTS "parking_sessions" CASCADE;
-- DROP TABLE IF EXISTS "parking_zones" CASCADE;
-- DROP TABLE IF EXISTS "vehicles" CASCADE;
-- DROP TABLE IF EXISTS "sessions" CASCADE;
-- DROP TABLE IF EXISTS "accounts" CASCADE;
-- DROP TABLE IF EXISTS "verification_tokens" CASCADE;
-- DROP TABLE IF EXISTS "users" CASCADE;

-- =====================================================================================
-- Create Enums
-- =====================================================================================

-- User roles
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'ENFORCEMENT');

-- Parking location types
CREATE TYPE "ParkingLocationType" AS ENUM ('STREET', 'GARAGE', 'LOT', 'METER');

-- Session status
CREATE TYPE "SessionStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED', 'EXTENDED');

-- Transaction status
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- =====================================================================================
-- Users Table
-- =====================================================================================

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create unique index on email
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- =====================================================================================
-- NextAuth.js Tables
-- =====================================================================================

-- Accounts table for OAuth providers
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- Sessions table for NextAuth.js
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- Verification tokens table
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- Create indexes for NextAuth.js tables
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- =====================================================================================
-- Vehicles Table
-- =====================================================================================

CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "license_plate" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "nickname" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- Create unique index on license plate and state combination
CREATE UNIQUE INDEX "vehicles_license_plate_state_key" ON "vehicles"("license_plate", "state");

-- =====================================================================================
-- Parking Zones Table
-- =====================================================================================

CREATE TABLE "parking_zones" (
    "id" TEXT NOT NULL,
    "zone_number" TEXT NOT NULL,
    "zone_name" TEXT NOT NULL,
    "location_type" "ParkingLocationType" NOT NULL,
    "rate_per_hour" DOUBLE PRECISION NOT NULL,
    "max_duration_hours" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "restrictions_json" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parking_zones_pkey" PRIMARY KEY ("id")
);

-- Create unique index on zone number
CREATE UNIQUE INDEX "parking_zones_zone_number_key" ON "parking_zones"("zone_number");

-- =====================================================================================
-- Parking Sessions Table
-- =====================================================================================

CREATE TABLE "parking_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "scheduled_end_time" TIMESTAMP(3) NOT NULL,
    "duration_hours" DOUBLE PRECISION NOT NULL,
    "base_cost" DOUBLE PRECISION NOT NULL,
    "tax_amount" DOUBLE PRECISION NOT NULL,
    "processing_fee" DOUBLE PRECISION NOT NULL,
    "total_cost" DOUBLE PRECISION NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'PENDING',
    "extended_from_session_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parking_sessions_pkey" PRIMARY KEY ("id")
);

-- =====================================================================================
-- Transactions Table
-- =====================================================================================

CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "stripe_transaction_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- =====================================================================================
-- Foreign Key Constraints
-- =====================================================================================

-- Accounts foreign keys
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sessions foreign keys
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Vehicles foreign keys
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Parking sessions foreign keys
ALTER TABLE "parking_sessions" ADD CONSTRAINT "parking_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "parking_sessions" ADD CONSTRAINT "parking_sessions_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "parking_sessions" ADD CONSTRAINT "parking_sessions_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "parking_zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "parking_sessions" ADD CONSTRAINT "parking_sessions_extended_from_session_id_fkey" FOREIGN KEY ("extended_from_session_id") REFERENCES "parking_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Transactions foreign keys
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "parking_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =====================================================================================
-- Indexes for Performance
-- =====================================================================================

-- User indexes
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- Vehicle indexes
CREATE INDEX "vehicles_user_id_idx" ON "vehicles"("user_id");
CREATE INDEX "vehicles_license_plate_idx" ON "vehicles"("license_plate");

-- Parking zones indexes
CREATE INDEX "parking_zones_location_type_idx" ON "parking_zones"("location_type");
CREATE INDEX "parking_zones_is_active_idx" ON "parking_zones"("is_active");
CREATE INDEX "parking_zones_rate_per_hour_idx" ON "parking_zones"("rate_per_hour");

-- Parking sessions indexes
CREATE INDEX "parking_sessions_user_id_idx" ON "parking_sessions"("user_id");
CREATE INDEX "parking_sessions_vehicle_id_idx" ON "parking_sessions"("vehicle_id");
CREATE INDEX "parking_sessions_zone_id_idx" ON "parking_sessions"("zone_id");
CREATE INDEX "parking_sessions_status_idx" ON "parking_sessions"("status");
CREATE INDEX "parking_sessions_start_time_idx" ON "parking_sessions"("start_time");
CREATE INDEX "parking_sessions_scheduled_end_time_idx" ON "parking_sessions"("scheduled_end_time");
CREATE INDEX "parking_sessions_created_at_idx" ON "parking_sessions"("created_at");

-- Transaction indexes
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");
CREATE INDEX "transactions_session_id_idx" ON "transactions"("session_id");
CREATE INDEX "transactions_stripe_transaction_id_idx" ON "transactions"("stripe_transaction_id");
CREATE INDEX "transactions_status_idx" ON "transactions"("status");
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");

-- =====================================================================================
-- Database Functions and Triggers (Optional)
-- =====================================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON "vehicles" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parking_zones_updated_at BEFORE UPDATE ON "parking_zones" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parking_sessions_updated_at BEFORE UPDATE ON "parking_sessions" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON "transactions" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================================
-- Insert Sample Data (Optional)
-- =====================================================================================

-- Note: This is basic sample data. Use the setup script for more comprehensive data.

-- Sample admin user (password: admin123, hashed with bcrypt rounds=12)
INSERT INTO "users" ("id", "email", "password_hash", "name", "role") VALUES
('admin-user-id', 'admin@stamford.gov', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.bnl/XM', 'System Administrator', 'ADMIN')
ON CONFLICT ("email") DO NOTHING;

-- Sample parking zones
INSERT INTO "parking_zones" ("id", "zone_number", "zone_name", "location_type", "rate_per_hour", "max_duration_hours", "address") VALUES
('zone-dt001', 'DT001', 'Downtown Main Street', 'STREET', 2.00, 4, '1 Main Street, Stamford, CT 06901'),
('zone-ch001', 'CH001', 'City Hall Parking Lot', 'LOT', 1.50, 8, '888 Washington Boulevard, Stamford, CT 06901'),
('zone-ts001', 'TS001', 'Train Station Short-term', 'METER', 2.50, 2, '1 Station Place, Stamford, CT 06902')
ON CONFLICT ("zone_number") DO NOTHING;

-- =====================================================================================
-- Database Setup Complete
-- =====================================================================================

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Stamford Parking System Database Setup Complete!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Tables created: %, %, %, %, %, %, %',
        'users', 'accounts', 'sessions', 'verification_tokens',
        'vehicles', 'parking_zones', 'parking_sessions', 'transactions';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run the setup script: npm run setup:db';
    RAISE NOTICE '2. Start the application: npm run dev';
    RAISE NOTICE '3. Visit: http://localhost:3000';
    RAISE NOTICE '=====================================================';
END $$;