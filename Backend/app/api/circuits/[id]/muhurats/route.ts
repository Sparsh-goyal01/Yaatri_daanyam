import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const circuitId = parseInt(id);

    // Validate circuit exists
    const circuit = await prisma.circuit.findUnique({
      where: { id: circuitId },
    });

    if (!circuit) {
      return NextResponse.json(
        { error: 'Circuit not found' },
        { status: 404 }
      );
    }

    // Get muhurats for next 6 months
    const now = new Date();
    const sixMonthsLater = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

    let muhurats = await prisma.muhurat.findMany({
      where: {
        circuitId,
        startDate: { gte: now, lte: sixMonthsLater },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        tithi: true,
        significance: true,
        reason: true,
      },
      orderBy: { startDate: 'asc' },
      take: 10, // Limit to 10 options
    });

    // If there are no upcoming records, return the most recent options for this circuit
    // so frontend can still proceed with selection/submission in demo/dev data.
    if (!muhurats.length) {
      muhurats = await prisma.muhurat.findMany({
        where: { circuitId },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          tithi: true,
          significance: true,
          reason: true,
        },
        orderBy: { startDate: 'desc' },
        take: 10,
      });
    }

    return NextResponse.json(muhurats, { status: 200 });
  } catch (error) {
    console.error('Error fetching muhurats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch muhurats' },
      { status: 500 }
    );
  }
}
