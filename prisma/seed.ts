import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Admin User',
      passwordHash: hashedPassword,
      phone: '(203) 555-0001',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create demo user
  const demoHashedPassword = await bcrypt.hash('demo123', 12);

  const demoUser = await prisma.user.upsert({
    where: { email: 'user@demo.com' },
    update: {},
    create: {
      email: 'user@demo.com',
      name: 'Demo User',
      passwordHash: demoHashedPassword,
      phone: '(203) 555-0123',
      role: 'USER',
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create parking zones (10 zones with mix of types)
  const zones = [
    {
      zoneNumber: 'A1',
      zoneName: 'Downtown Main Street',
      locationType: 'STREET' as const,
      ratePerHour: 2.00,
      maxDurationHours: 4,
      address: '123 Main Street, Stamford, CT',
      restrictionsJson: {
        timeRestrictions: [
          {
            startTime: '08:00',
            endTime: '18:00',
            daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
          },
        ],
      },
    },
    {
      zoneNumber: 'B2',
      zoneName: 'City Hall Parking Lot',
      locationType: 'LOT' as const,
      ratePerHour: 1.50,
      maxDurationHours: 8,
      address: '888 Washington Blvd, Stamford, CT',
      restrictionsJson: null,
    },
    {
      zoneNumber: 'C3',
      zoneName: 'Harbor Point Garage',
      locationType: 'GARAGE' as const,
      ratePerHour: 3.00,
      maxDurationHours: 12,
      address: '123 Harbor Point Road, Stamford, CT',
      restrictionsJson: {
        vehicleTypeRestrictions: ['compact', 'standard'],
        maxVehicleLength: 20,
      },
    },
    {
      zoneNumber: 'D4',
      zoneName: 'Train Station North',
      locationType: 'METER' as const,
      ratePerHour: 2.50,
      maxDurationHours: 2,
      address: '1 Station Place, Stamford, CT',
      restrictionsJson: {
        timeRestrictions: [
          {
            startTime: '06:00',
            endTime: '22:00',
            daysOfWeek: [1, 2, 3, 4, 5, 6, 7], // All days
          },
        ],
      },
    },
    {
      zoneNumber: 'E5',
      zoneName: 'Bedford Street',
      locationType: 'STREET' as const,
      ratePerHour: 1.75,
      maxDurationHours: 3,
      address: '456 Bedford Street, Stamford, CT',
      restrictionsJson: null,
    },
    {
      zoneNumber: 'F6',
      zoneName: 'Stamford Town Center Garage',
      locationType: 'GARAGE' as const,
      ratePerHour: 2.75,
      maxDurationHours: 10,
      address: '100 Greyrock Place, Stamford, CT',
      restrictionsJson: {
        heightRestriction: 7.5, // feet
        weekendRates: true,
      },
    },
    {
      zoneNumber: 'G7',
      zoneName: 'Atlantic Street Lot',
      locationType: 'LOT' as const,
      ratePerHour: 1.25,
      maxDurationHours: 6,
      address: '200 Atlantic Street, Stamford, CT',
      restrictionsJson: {
        weekendFree: true,
        timeRestrictions: [
          {
            startTime: '07:00',
            endTime: '19:00',
            daysOfWeek: [1, 2, 3, 4, 5],
          },
        ],
      },
    },
    {
      zoneNumber: 'H8',
      zoneName: 'Summer Street Meters',
      locationType: 'METER' as const,
      ratePerHour: 2.25,
      maxDurationHours: 2,
      address: '345 Summer Street, Stamford, CT',
      restrictionsJson: {
        timeRestrictions: [
          {
            startTime: '09:00',
            endTime: '17:00',
            daysOfWeek: [1, 2, 3, 4, 5],
          },
        ],
      },
    },
    {
      zoneNumber: 'I9',
      zoneName: 'Forest Street',
      locationType: 'STREET' as const,
      ratePerHour: 1.50,
      maxDurationHours: 4,
      address: '567 Forest Street, Stamford, CT',
      restrictionsJson: {
        noOvernightParking: true,
        timeRestrictions: [
          {
            startTime: '08:00',
            endTime: '20:00',
            daysOfWeek: [1, 2, 3, 4, 5, 6],
          },
        ],
      },
    },
    {
      zoneNumber: 'J10',
      zoneName: 'Government Center Garage',
      locationType: 'GARAGE' as const,
      ratePerHour: 2.50,
      maxDurationHours: 12,
      address: '888 Washington Blvd, Stamford, CT',
      restrictionsJson: {
        validatedParking: true,
        discountHours: [11, 12, 13, 14], // lunch discount
      },
    },
  ];

  const createdZones = [];
  for (const zone of zones) {
    const createdZone = await prisma.parkingZone.upsert({
      where: { zoneNumber: zone.zoneNumber },
      update: {},
      create: zone,
    });
    createdZones.push(createdZone);
    console.log('✅ Created parking zone:', createdZone.zoneNumber);
  }

  // Create demo vehicles
  const demoVehicle = await prisma.vehicle.upsert({
    where: {
      licensePlate_state: {
        licensePlate: 'DEMO123',
        state: 'CT'
      }
    },
    update: {},
    create: {
      userId: demoUser.id,
      licensePlate: 'DEMO123',
      state: 'CT',
      nickname: 'My Honda Civic',
    },
  });

  const adminVehicle = await prisma.vehicle.upsert({
    where: {
      licensePlate_state: {
        licensePlate: 'ADMIN99',
        state: 'CT'
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      licensePlate: 'ADMIN99',
      state: 'CT',
      nickname: 'City Vehicle',
    },
  });

  console.log('✅ Created demo vehicles:', demoVehicle.licensePlate, adminVehicle.licensePlate);

  // Create completed parking sessions and transactions (historical data)
  const now = new Date();
  const completedSessions = [];

  for (let i = 0; i < 5; i++) {
    const startTime = new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000 - Math.random() * 8 * 60 * 60 * 1000);
    const durationHours = 1 + Math.random() * 3; // 1-4 hours
    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
    const zone = createdZones[Math.floor(Math.random() * createdZones.length)];
    const vehicle = Math.random() > 0.5 ? demoVehicle : adminVehicle;
    const user = vehicle.userId === demoUser.id ? demoUser : adminUser;

    const baseCost = zone.ratePerHour * durationHours;
    const taxAmount = baseCost * 0.0625; // 6.25% CT sales tax
    const processingFee = 0.50;
    const totalCost = baseCost + taxAmount + processingFee;

    const session = await prisma.parkingSession.create({
      data: {
        userId: user.id,
        vehicleId: vehicle.id,
        zoneId: zone.id,
        startTime,
        endTime,
        scheduledEndTime: endTime,
        durationHours,
        baseCost,
        taxAmount,
        processingFee,
        totalCost,
        status: 'COMPLETED',
      },
    });

    // Create successful transaction
    await prisma.transaction.create({
      data: {
        userId: user.id,
        sessionId: session.id,
        amount: totalCost,
        status: 'COMPLETED',
        stripeTransactionId: `pi_demo_${Math.random().toString(36).substring(7)}`,
      },
    });

    completedSessions.push(session);
    console.log(`✅ Created completed session ${i + 1}/5 in zone ${zone.zoneNumber}`);
  }

  // Create 2 active parking sessions
  const activeSessions = [];

  // Active session 1 - Demo user
  const activeStart1 = new Date(now.getTime() - 45 * 60 * 1000); // Started 45 minutes ago
  const activeDuration1 = 2; // 2 hours
  const activeEnd1 = new Date(activeStart1.getTime() + activeDuration1 * 60 * 60 * 1000);
  const activeZone1 = createdZones[0]; // Downtown Main Street

  const activeBaseCost1 = activeZone1.ratePerHour * activeDuration1;
  const activeTaxAmount1 = activeBaseCost1 * 0.0625;
  const activeProcessingFee1 = 0.50;
  const activeTotalCost1 = activeBaseCost1 + activeTaxAmount1 + activeProcessingFee1;

  const activeSession1 = await prisma.parkingSession.create({
    data: {
      userId: demoUser.id,
      vehicleId: demoVehicle.id,
      zoneId: activeZone1.id,
      startTime: activeStart1,
      endTime: null,
      scheduledEndTime: activeEnd1,
      durationHours: activeDuration1,
      baseCost: activeBaseCost1,
      taxAmount: activeTaxAmount1,
      processingFee: activeProcessingFee1,
      totalCost: activeTotalCost1,
      status: 'ACTIVE',
    },
  });

  // Create successful transaction for active session
  await prisma.transaction.create({
    data: {
      userId: demoUser.id,
      sessionId: activeSession1.id,
      amount: activeTotalCost1,
      status: 'COMPLETED',
      stripeTransactionId: `pi_demo_active_${Math.random().toString(36).substring(7)}`,
    },
  });

  activeSessions.push(activeSession1);

  // Active session 2 - Admin user
  const activeStart2 = new Date(now.getTime() - 30 * 60 * 1000); // Started 30 minutes ago
  const activeDuration2 = 4; // 4 hours
  const activeEnd2 = new Date(activeStart2.getTime() + activeDuration2 * 60 * 60 * 1000);
  const activeZone2 = createdZones[2]; // Harbor Point Garage

  const activeBaseCost2 = activeZone2.ratePerHour * activeDuration2;
  const activeTaxAmount2 = activeBaseCost2 * 0.0625;
  const activeProcessingFee2 = 0.50;
  const activeTotalCost2 = activeBaseCost2 + activeTaxAmount2 + activeProcessingFee2;

  const activeSession2 = await prisma.parkingSession.create({
    data: {
      userId: adminUser.id,
      vehicleId: adminVehicle.id,
      zoneId: activeZone2.id,
      startTime: activeStart2,
      endTime: null,
      scheduledEndTime: activeEnd2,
      durationHours: activeDuration2,
      baseCost: activeBaseCost2,
      taxAmount: activeTaxAmount2,
      processingFee: activeProcessingFee2,
      totalCost: activeTotalCost2,
      status: 'ACTIVE',
    },
  });

  // Create successful transaction for active session
  await prisma.transaction.create({
    data: {
      userId: adminUser.id,
      sessionId: activeSession2.id,
      amount: activeTotalCost2,
      status: 'COMPLETED',
      stripeTransactionId: `pi_demo_active_${Math.random().toString(36).substring(7)}`,
    },
  });

  activeSessions.push(activeSession2);

  console.log('✅ Created 2 active parking sessions');

  // Summary
  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📊 Demo Data Summary:');
  console.log(`👥 Users: 2 (admin@demo.com, user@demo.com)`);
  console.log(`🚗 Vehicles: 2 (DEMO123, ADMIN99)`);
  console.log(`🅿️ Parking Zones: ${createdZones.length}`);
  console.log(`   - Street: ${createdZones.filter(z => z.locationType === 'STREET').length}`);
  console.log(`   - Garage: ${createdZones.filter(z => z.locationType === 'GARAGE').length}`);
  console.log(`   - Lot: ${createdZones.filter(z => z.locationType === 'LOT').length}`);
  console.log(`   - Meter: ${createdZones.filter(z => z.locationType === 'METER').length}`);
  console.log(`📝 Completed Sessions: 5`);
  console.log(`⏱️ Active Sessions: 2`);
  console.log(`💳 Total Transactions: 7`);
  console.log('\n🔑 Login Credentials:');
  console.log('  Admin: admin@demo.com / admin123');
  console.log('  User:  user@demo.com / demo123');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });