import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const bookingSchema = z.object({
  sankalpId: z.number().int().positive(),
  customSankalp: z.string().optional(),
  circuitId: z.number().int().positive(),
  muhuratId: z.number().int().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  groupSize: z.number().int().min(1).max(20),
  hasSenior: z.boolean(),
  mobilityNeeds: z.array(z.string()),
  dietaryPreference: z.string(),
  specialRequests: z.string().optional(),
  userEmail: z.string().email(),
  userPhone: z.string().optional(),
  userContext: z.string().optional(),
  language: z.enum(['en', 'hi', 'bi']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate
    const validated = bookingSchema.parse(body);

    // Calculate price if circuit provided
    let estimatedPrice = 0;
    if (validated.circuitId) {
      const circuit = await prisma.circuit.findUnique({
        where: { id: validated.circuitId },
        select: { basePrice: true },
      });

      if (!circuit) {
        return NextResponse.json(
          { error: 'Circuit not found' },
          { status: 404 }
        );
      }

      estimatedPrice = circuit.basePrice * validated.groupSize;
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        sankalpId: validated.sankalpId,
        customSankalp: validated.customSankalp,
        circuitId: validated.circuitId,
        muhuratId: validated.muhuratId,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
        groupSize: validated.groupSize,
        hasSenior: validated.hasSenior,
        mobilityNeeds: validated.mobilityNeeds,
        dietaryPreference: validated.dietaryPreference,
        specialRequests: validated.specialRequests,
        userEmail: validated.userEmail,
        userPhone: validated.userPhone,
        userContext: validated.userContext,
        language: validated.language || 'bi',
        estimatedPrice,
        status: 'pending',
      },
      include: {
        sankalp: { select: { title: true } },
        circuit: { select: { name: true, basePrice: true } },
        muhurat: { select: { tithi: true, significance: true } },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
