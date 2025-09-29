import { NextRequest, NextResponse } from 'next/server';
import { getAllActiveZones, searchZones } from '@/lib/db/zones';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    let zones;
    if (query) {
      zones = await searchZones(query);
    } else {
      zones = await getAllActiveZones();
    }

    return NextResponse.json({
      success: true,
      data: zones,
    });
  } catch (error: any) {
    console.error('GET /api/zones error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch zones' },
      { status: 500 }
    );
  }
}