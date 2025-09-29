import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const zoneId = params.id;

    const zone = await prisma.parkingZone.findUnique({
      where: {
        id: zoneId
      }
    });

    if (!zone || !zone.isActive) {
      return NextResponse.json(
        { error: 'Parking zone not found or inactive' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: zone
    });

  } catch (error) {
    console.error('Get zone error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}