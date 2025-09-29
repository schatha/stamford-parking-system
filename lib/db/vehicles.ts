import { prisma } from '@/lib/db';
import { Vehicle, CreateVehicleInput } from '@/types';
import { validateLicensePlate } from '@/lib/utils/validation';

export async function getUserVehicles(userId: string): Promise<Vehicle[]> {
  return prisma.vehicle.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getVehicleById(id: string, userId: string): Promise<Vehicle | null> {
  return prisma.vehicle.findFirst({
    where: { id, userId },
  });
}

export async function createVehicle(
  userId: string,
  data: CreateVehicleInput
): Promise<Vehicle> {
  if (!validateLicensePlate(data.licensePlate)) {
    throw new Error('Invalid license plate format');
  }

  const existing = await prisma.vehicle.findFirst({
    where: {
      licensePlate: data.licensePlate.toUpperCase(),
      state: data.state.toUpperCase(),
    },
  });

  if (existing) {
    throw new Error('Vehicle with this license plate and state already exists');
  }

  return prisma.vehicle.create({
    data: {
      userId,
      licensePlate: data.licensePlate.toUpperCase(),
      state: data.state.toUpperCase(),
      nickname: data.nickname?.trim() || null,
    },
  });
}

export async function updateVehicle(
  id: string,
  userId: string,
  data: Partial<CreateVehicleInput>
): Promise<Vehicle> {
  const vehicle = await getVehicleById(id, userId);
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  const updateData: any = {};

  if (data.licensePlate) {
    if (!validateLicensePlate(data.licensePlate)) {
      throw new Error('Invalid license plate format');
    }
    updateData.licensePlate = data.licensePlate.toUpperCase();
  }

  if (data.state) {
    updateData.state = data.state.toUpperCase();
  }

  if (data.nickname !== undefined) {
    updateData.nickname = data.nickname?.trim() || null;
  }

  return prisma.vehicle.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteVehicle(id: string, userId: string): Promise<void> {
  const vehicle = await getVehicleById(id, userId);
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  const activeSessions = await prisma.parkingSession.findFirst({
    where: {
      vehicleId: id,
      status: { in: ['PENDING', 'ACTIVE'] },
    },
  });

  if (activeSessions) {
    throw new Error('Cannot delete vehicle with active parking sessions');
  }

  await prisma.vehicle.delete({
    where: { id },
  });
}