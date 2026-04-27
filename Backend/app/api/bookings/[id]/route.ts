import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const partialBookingSchema = z.object({
  sankalpId: z.number().int().positive().optional(),
  customSankalp: z.string().optional(),
  circuitId: z.number().int().positive().optional(),
  muhuratId: z.number().int().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupSize: z.number().int().min(1).max(20).optional(),
  hasSenior: z.boolean().optional(),
  mobilityNeeds: z.array(z.string()).optional(),
  dietaryPreference: z.string().optional(),
  specialRequests: z.string().optional(),
  language: z.enum(['en', 'hi', 'bi']).optional(),
});

// GET: Retrieve booking
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        sankalp: true,
        circuit: true,
        muhurat: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(booking, { status: 200 });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PATCH: Update booking
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    const body = await req.json();

    const validated = partialBookingSchema.parse(body);

    // Recalculate price if circuit changed
    let updateData: any = { ...validated };
    if (validated.circuitId) {
      const circuit = await prisma.circuit.findUnique({
        where: { id: validated.circuitId },
        select: { basePrice: true },
      });

      if (circuit) {
        // Use new groupSize if provided, else fetch current
        const groupSize = validated.groupSize ||
          (await prisma.booking.findUnique({
            where: { id: bookingId },
            select: { groupSize: true },
          }))?.groupSize || 1;

        updateData.estimatedPrice = circuit.basePrice * groupSize;
      }
    }

    // Update with date conversion
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...updateData,
        startDate: validated.startDate ? new Date(validated.startDate) : undefined,
        endDate: validated.endDate ? new Date(validated.endDate) : undefined,
      },
      include: {
        sankalp: true,
        circuit: true,
        muhurat: true,
      },
    });

    return NextResponse.json(booking, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
