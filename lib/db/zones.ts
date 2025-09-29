import { prisma } from '@/lib/db';
import { ParkingZone } from '@/types';
import { createSampleRestrictions } from '@/lib/utils/restrictions';

export async function getAllActiveZones(): Promise<ParkingZone[]> {
  return prisma.parkingZone.findMany({
    where: { isActive: true },
    orderBy: { zoneNumber: 'asc' },
  });
}

export async function getZoneById(id: string): Promise<ParkingZone | null> {
  return prisma.parkingZone.findUnique({
    where: { id },
  });
}

export async function getZoneByNumber(zoneNumber: string): Promise<ParkingZone | null> {
  return prisma.parkingZone.findUnique({
    where: { zoneNumber: zoneNumber.toUpperCase() },
  });
}

export async function createZone(data: {
  zoneNumber: string;
  zoneName: string;
  locationType: 'STREET' | 'GARAGE' | 'LOT' | 'METER';
  ratePerHour: number;
  maxDurationHours: number;
  address: string;
  restrictionsJson?: any;
}): Promise<ParkingZone> {
  const existing = await getZoneByNumber(data.zoneNumber);
  if (existing) {
    throw new Error('Zone number already exists');
  }

  return prisma.parkingZone.create({
    data: {
      ...data,
      zoneNumber: data.zoneNumber.toUpperCase(),
    },
  });
}

export async function updateZone(
  id: string,
  data: Partial<{
    zoneName: string;
    locationType: 'STREET' | 'GARAGE' | 'LOT' | 'METER';
    ratePerHour: number;
    maxDurationHours: number;
    address: string;
    restrictionsJson: any;
    isActive: boolean;
  }>
): Promise<ParkingZone> {
  const zone = await getZoneById(id);
  if (!zone) {
    throw new Error('Zone not found');
  }

  return prisma.parkingZone.update({
    where: { id },
    data,
  });
}

export async function deleteZone(id: string): Promise<void> {
  const zone = await getZoneById(id);
  if (!zone) {
    throw new Error('Zone not found');
  }

  const activeSessions = await prisma.parkingSession.findFirst({
    where: {
      zoneId: id,
      status: { in: ['PENDING', 'ACTIVE'] },
    },
  });

  if (activeSessions) {
    throw new Error('Cannot delete zone with active parking sessions');
  }

  await prisma.parkingZone.delete({
    where: { id },
  });
}

export async function searchZones(query: string): Promise<ParkingZone[]> {
  return prisma.parkingZone.findMany({
    where: {
      isActive: true,
      OR: [
        { zoneNumber: { contains: query, mode: 'insensitive' } },
        { zoneName: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { zoneNumber: 'asc' },
    take: 10,
  });
}

export async function createSampleZonesWithRestrictions(): Promise<ParkingZone[]> {
  const sampleZones = [
    {
      zoneNumber: 'ST-101',
      zoneName: 'Downtown Main Street',
      locationType: 'STREET' as const,
      ratePerHour: 3.50,
      maxDurationHours: 4,
      address: '100 Main Street, Stamford, CT',
      restrictionsJson: createSampleRestrictions()
    },
    {
      zoneNumber: 'ST-205',
      zoneName: 'Financial District',
      locationType: 'STREET' as const,
      ratePerHour: 4.00,
      maxDurationHours: 8,
      address: '200 Atlantic Street, Stamford, CT',
      restrictionsJson: {
        timeRestrictions: [
          {
            startTime: '07:30',
            endTime: '09:30',
            daysOfWeek: [1, 2, 3, 4, 5],
            restrictionType: 'RUSH_HOUR',
            description: 'Morning rush hour - No parking to maintain traffic flow'
          },
          {
            startTime: '17:00',
            endTime: '19:00',
            daysOfWeek: [1, 2, 3, 4, 5],
            restrictionType: 'RUSH_HOUR',
            description: 'Evening rush hour - No parking to maintain traffic flow'
          }
        ],
        allowedDuringRestrictions: false
      }
    }
  ];

  const createdZones: ParkingZone[] = [];

  for (const zoneData of sampleZones) {
    try {
      const existing = await getZoneByNumber(zoneData.zoneNumber);
      if (!existing) {
        const zone = await createZone(zoneData);
        createdZones.push(zone);
      }
    } catch (error) {
      console.error(`Failed to create zone ${zoneData.zoneNumber}:`, error);
    }
  }

  return createdZones;
}