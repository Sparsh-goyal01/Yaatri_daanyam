import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper: Format booking for Meera's WhatsApp
function formatBookingForMeera(booking: any): string {
  const startDate = new Date(booking.startDate).toLocaleDateString('en-IN');
  const endDate = new Date(booking.endDate).toLocaleDateString('en-IN');

  return `
🙏 *New Yaatri Booking* 🙏

*Booking ID:* #${booking.id}
*Name:* ${booking.userEmail}
*Phone:* ${booking.userPhone || 'N/A'}

*Sankalp:* ${booking.sankalp.title}
${booking.customSankalp ? `_(Custom: ${booking.customSankalp})_` : ''}

*Circuit:* ${booking.circuit.name}
*Dates:* ${startDate} - ${endDate}
*Muhurat:* ${booking.muhurat.tithi} ✦ ${booking.muhurat.significance}

*Travellers:* ${booking.groupSize} pilgrims
${booking.hasSenior ? '*Senior Mode:* ✓ Enabled' : ''}
*Mobility:* ${booking.mobilityNeeds.join(', ') || 'None needed'}
*Diet:* ${booking.dietaryPreference}

*Estimated Price:* ₹${booking.estimatedPrice.toLocaleString('en-IN')}

*Special Notes:* ${booking.specialRequests || 'None'}

*Context:* "${booking.userContext || 'Family pilgrimage'}"

_Please confirm final price and arrange details._
_Reply on WhatsApp_
  `.trim();
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);

    // Get booking with all relations
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

    if (booking.status !== 'pending') {
      return NextResponse.json(
        { error: `Booking is already ${booking.status}` },
        { status: 400 }
      );
    }

    // Update booking status
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'confirmed',
      },
      include: {
        sankalp: true,
        circuit: true,
        muhurat: true,
      },
    });

    // === TODO: SEND WHATSAPP TO MEERA ===
    // Uncomment when Twilio is set up
    // const message = formatBookingForMeera(updated);
    // await sendWhatsAppToMeera(
    //   process.env.MEERA_WHATSAPP_NUMBER,
    //   message
    // );
    
    // For now, just log it
    console.log('Booking confirmed. Message for Meera:');
    console.log(formatBookingForMeera(updated));

    // === TODO: SEND CONFIRMATION EMAIL ===
    // await sendConfirmationEmail(updated.userEmail, updated);

    return NextResponse.json(
      {
        success: true,
        message: 'Booking submitted successfully',
        booking: updated,
        meera: {
          name: 'Meera',
          expectedResponseTime: '2 hours',
          whatsappNote: 'Meera will contact you via WhatsApp',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error submitting booking:', error);
    return NextResponse.json(
      { error: 'Failed to submit booking' },
      { status: 500 }
    );
  }
}
