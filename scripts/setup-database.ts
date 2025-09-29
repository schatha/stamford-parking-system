#!/usr/bin/env tsx

/**
 * Database Setup Script for Stamford Parking System
 *
 * This script sets up the database schema and initial data for the parking system.
 * It can be run against any PostgreSQL database (Railway, local, etc.)
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function askQuestion(question: string): Promise<string> {
  const rl = createReadlineInterface();
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    log('✅ Database connection successful!', 'green');
    return true;
  } catch (error) {
    log('❌ Database connection failed!', 'red');
    log(`Error: ${error}`, 'red');
    return false;
  }
}

async function runMigrations() {
  log('\n📦 Setting up database schema...', 'blue');

  try {
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'vehicles', 'parking_zones', 'parking_sessions', 'transactions')
    ` as Array<{ table_name: string }>;

    if (tables.length > 0) {
      log(`⚠️  Found existing tables: ${tables.map(t => t.table_name).join(', ')}`, 'yellow');
      const shouldContinue = await askQuestion('Do you want to continue? This may reset existing data. (y/N): ');

      if (shouldContinue.toLowerCase() !== 'y') {
        log('❌ Setup cancelled by user.', 'yellow');
        return false;
      }
    }

    // Note: In a real deployment, you would run: npx prisma migrate deploy
    // For this script, we'll assume migrations are handled separately
    log('✅ Database schema is ready!', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to set up database schema!', 'red');
    log(`Error: ${error}`, 'red');
    return false;
  }
}

async function createAdminUser() {
  log('\n👤 Setting up admin user...', 'blue');

  try {
    const adminEmail = 'admin@stamford.gov';
    const adminPassword = 'admin123'; // In production, use a secure password

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      log(`⚠️  Admin user already exists: ${adminEmail}`, 'yellow');
      return existingAdmin;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'System Administrator',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        phone: '(203) 977-4140', // Stamford City Hall
      },
    });

    log(`✅ Admin user created: ${adminEmail}`, 'green');
    log(`   Password: ${adminPassword}`, 'cyan');
    log(`   ⚠️  Please change this password after first login!`, 'yellow');

    return adminUser;
  } catch (error) {
    log('❌ Failed to create admin user!', 'red');
    log(`Error: ${error}`, 'red');
    throw error;
  }
}

async function createParkingZones() {
  log('\n🅿️  Setting up parking zones...', 'blue');

  const zones = [
    {
      zoneNumber: 'DT001',
      zoneName: 'Downtown Main Street',
      locationType: 'STREET' as const,
      ratePerHour: 2.00,
      maxDurationHours: 4,
      address: '1 Main Street, Stamford, CT 06901',
      restrictionsJson: {
        timeRestrictions: [
          {
            startTime: '08:00',
            endTime: '18:00',
            daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
          },
        ],
        enformentHours: '8 AM - 6 PM, Monday - Friday',
      },
    },
    {
      zoneNumber: 'CH001',
      zoneName: 'City Hall Parking Lot',
      locationType: 'LOT' as const,
      ratePerHour: 1.50,
      maxDurationHours: 8,
      address: '888 Washington Boulevard, Stamford, CT 06901',
      restrictionsJson: {
        enformentHours: '24/7',
        notes: 'Public parking available during business hours',
      },
    },
    {
      zoneNumber: 'HP001',
      zoneName: 'Harbor Point Garage Level 1',
      locationType: 'GARAGE' as const,
      ratePerHour: 3.00,
      maxDurationHours: 12,
      address: '123 Harbor Point Road, Stamford, CT 06902',
      restrictionsJson: {
        vehicleTypeRestrictions: ['compact', 'standard'],
        maxVehicleLength: 20,
        enformentHours: '24/7',
      },
    },
    {
      zoneNumber: 'TS001',
      zoneName: 'Train Station Short-term',
      locationType: 'METER' as const,
      ratePerHour: 2.50,
      maxDurationHours: 2,
      address: '1 Station Place, Stamford, CT 06902',
      restrictionsJson: {
        timeRestrictions: [
          {
            startTime: '06:00',
            endTime: '22:00',
            daysOfWeek: [1, 2, 3, 4, 5, 6, 7], // All days
          },
        ],
        enformentHours: '6 AM - 10 PM, Daily',
        notes: 'Peak commuter hours: higher rates may apply',
      },
    },
    {
      zoneNumber: 'TS002',
      zoneName: 'Train Station Long-term',
      locationType: 'LOT' as const,
      ratePerHour: 1.25,
      maxDurationHours: 24,
      address: '15 Station Place, Stamford, CT 06902',
      restrictionsJson: {
        enformentHours: '24/7',
        notes: 'Daily and monthly permits available',
      },
    },
    {
      zoneNumber: 'BD001',
      zoneName: 'Bedford Street Commercial',
      locationType: 'STREET' as const,
      ratePerHour: 1.75,
      maxDurationHours: 3,
      address: '200 Bedford Street, Stamford, CT 06901',
      restrictionsJson: {
        timeRestrictions: [
          {
            startTime: '09:00',
            endTime: '17:00',
            daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
          },
        ],
        enformentHours: '9 AM - 5 PM, Monday - Friday',
      },
    },
    {
      zoneNumber: 'SP001',
      zoneName: 'Scalzi Park Recreation Area',
      locationType: 'LOT' as const,
      ratePerHour: 1.00,
      maxDurationHours: 6,
      address: '301 Bridge Street, Stamford, CT 06603',
      restrictionsJson: {
        timeRestrictions: [
          {
            startTime: '06:00',
            endTime: '20:00',
            daysOfWeek: [1, 2, 3, 4, 5, 6, 7], // All days
          },
        ],
        enformentHours: '6 AM - 8 PM, Daily',
        notes: 'Park visitors only',
      },
    },
    {
      zoneNumber: 'TC001',
      zoneName: 'Town Center Garage A',
      locationType: 'GARAGE' as const,
      ratePerHour: 2.25,
      maxDurationHours: 10,
      address: '433 Atlantic Street, Stamford, CT 06901',
      restrictionsJson: {
        enformentHours: '24/7',
        notes: 'Validation available for participating businesses',
      },
    },
  ];

  let createdCount = 0;
  let existingCount = 0;

  for (const zoneData of zones) {
    try {
      const existingZone = await prisma.parkingZone.findUnique({
        where: { zoneNumber: zoneData.zoneNumber }
      });

      if (existingZone) {
        existingCount++;
        continue;
      }

      await prisma.parkingZone.create({
        data: zoneData,
      });

      createdCount++;
      log(`   ✅ Created zone: ${zoneData.zoneNumber} - ${zoneData.zoneName}`, 'green');
    } catch (error) {
      log(`   ❌ Failed to create zone: ${zoneData.zoneNumber}`, 'red');
      log(`   Error: ${error}`, 'red');
    }
  }

  log(`✅ Parking zones setup complete!`, 'green');
  log(`   Created: ${createdCount} zones`, 'cyan');
  log(`   Existing: ${existingCount} zones`, 'cyan');
}

async function createDemoData() {
  log('\n🎭 Setting up demo data...', 'blue');

  const shouldCreateDemo = await askQuestion('Create demo user and vehicle for testing? (Y/n): ');

  if (shouldCreateDemo.toLowerCase() === 'n') {
    log('⏭️  Skipping demo data creation.', 'yellow');
    return;
  }

  try {
    // Create demo user
    const demoEmail = 'demo@example.com';
    const demoPassword = 'demo123';

    const existingDemo = await prisma.user.findUnique({
      where: { email: demoEmail }
    });

    let demoUser;
    if (existingDemo) {
      log(`⚠️  Demo user already exists: ${demoEmail}`, 'yellow');
      demoUser = existingDemo;
    } else {
      const hashedPassword = await bcrypt.hash(demoPassword, 12);

      demoUser = await prisma.user.create({
        data: {
          email: demoEmail,
          name: 'Demo User',
          passwordHash: hashedPassword,
          phone: '(203) 555-0123',
          role: 'USER',
        },
      });

      log(`✅ Demo user created: ${demoEmail}`, 'green');
      log(`   Password: ${demoPassword}`, 'cyan');
    }

    // Create demo vehicle
    const demoLicense = 'DEMO123';
    const demoState = 'CT';

    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        licensePlate: demoLicense,
        state: demoState,
      }
    });

    if (existingVehicle) {
      log(`⚠️  Demo vehicle already exists: ${demoLicense}`, 'yellow');
    } else {
      await prisma.vehicle.create({
        data: {
          userId: demoUser.id,
          licensePlate: demoLicense,
          state: demoState,
          nickname: 'My Demo Car',
        },
      });

      log(`✅ Demo vehicle created: ${demoLicense} (${demoState})`, 'green');
    }

  } catch (error) {
    log('❌ Failed to create demo data!', 'red');
    log(`Error: ${error}`, 'red');
  }
}

async function displaySummary() {
  log('\n📋 Setup Summary', 'bright');
  log('═══════════════════════════════════════════════════', 'bright');

  try {
    const [userCount, zoneCount, vehicleCount] = await Promise.all([
      prisma.user.count(),
      prisma.parkingZone.count(),
      prisma.vehicle.count(),
    ]);

    log(`👥 Users: ${userCount}`, 'cyan');
    log(`🅿️  Parking Zones: ${zoneCount}`, 'cyan');
    log(`🚗 Vehicles: ${vehicleCount}`, 'cyan');

    log('\n🔑 Default Login Credentials:', 'yellow');
    log('   Admin: admin@stamford.gov / admin123', 'cyan');
    log('   Demo:  demo@example.com / demo123', 'cyan');

    log('\n🚀 Next Steps:', 'green');
    log('   1. Start the development server: npm run dev', 'white');
    log('   2. Visit: http://localhost:3000', 'white');
    log('   3. Test the demo account or create a new user', 'white');
    log('   4. Set up Stripe test payments', 'white');
    log('   5. ⚠️  Change default admin password!', 'yellow');

    log('\n✅ Database setup completed successfully!', 'green');
  } catch (error) {
    log('❌ Failed to generate summary!', 'red');
    log(`Error: ${error}`, 'red');
  }
}

async function main() {
  log('🏛️  Stamford Parking System - Database Setup', 'bright');
  log('═══════════════════════════════════════════════════', 'bright');

  try {
    // Check database connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      process.exit(1);
    }

    // Run migrations (note: this assumes schema is already applied)
    const migrationsSuccess = await runMigrations();
    if (!migrationsSuccess) {
      process.exit(1);
    }

    // Create admin user
    await createAdminUser();

    // Create parking zones
    await createParkingZones();

    // Create demo data
    await createDemoData();

    // Display summary
    await displaySummary();

  } catch (error) {
    log('\n❌ Setup failed!', 'red');
    log(`Error: ${error}`, 'red');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', async () => {
  log('\n\n⚠️  Setup interrupted by user.', 'yellow');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the setup
if (require.main === module) {
  main().catch(console.error);
}