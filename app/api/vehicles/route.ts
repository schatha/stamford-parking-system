import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/helpers';
import { getUserVehicles, createVehicle } from '@/lib/db/vehicles';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const vehicles = await getUserVehicles(user.id);

    return NextResponse.json({
      success: true,
      data: vehicles,
    });
  } catch (error: any) {
    console.error('GET /api/vehicles error:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { licensePlate, state, nickname } = body;

    if (!licensePlate || !state) {
      return NextResponse.json(
        { error: 'License plate and state are required' },
        { status: 400 }
      );
    }

    const vehicle = await createVehicle(user.id, {
      licensePlate,
      state,
      nickname,
    });

    return NextResponse.json({
      success: true,
      data: vehicle,
      message: 'Vehicle added successfully',
    });
  } catch (error: any) {
    console.error('POST /api/vehicles error:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create vehicle' },
      { status: 400 }
    );
  }
}