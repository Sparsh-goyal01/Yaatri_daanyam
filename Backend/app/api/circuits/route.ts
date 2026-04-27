import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sankalpId = searchParams.get('sankalpId');

    const where = sankalpId ? { sankalpId: parseInt(sankalpId) } : {};

    const circuits = await prisma.circuit.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        stops: true,
        defaultDays: true,
        basePrice: true,
        highlights: true,
        sankalp: { select: { title: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(circuits, { status: 200 });
  } catch (error) {
    console.error('Error fetching circuits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch circuits' },
      { status: 500 }
    );
  }
}
