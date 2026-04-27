# YAATRI - BACKEND DEVELOPER GUIDE

## 🎯 YOUR RESPONSIBILITY

You are building the **entire backend** for the Yaatri pilgrimage booking system. Your deliverable is a fully functional REST API that the frontend will call.

---

## 📋 WHAT YOU'RE BUILDING

### **Core Deliverables:**

1. ✅ PostgreSQL database with Prisma ORM
2. ✅ 6 REST API endpoints
3. ✅ Master data (Sankalps, Circuits, Muhurats)
4. ✅ Business logic (price calculation, validation)
5. ✅ Third-party integrations (WhatsApp for Meera)
6. ✅ Error handling & validation
7. ✅ Environment configuration

### **NOT Your Responsibility:**
- ❌ UI/CSS/Styling
- ❌ React components
- ❌ Form handling
- ❌ Mobile responsiveness
- ❌ localStorage management

---

## 🛠️ TECH STACK (Your Side)

```
Next.js 14+ (API Routes)
├─ /app/api folder structure
├─ TypeScript
└─ Built-in fetch capabilities

Prisma ORM
├─ Schema file (schema.prisma)
├─ Migrations
└─ Type generation

PostgreSQL
├─ Database provider (Neon, Supabase, Railway)
└─ Connection pooling

External APIs
├─ Twilio (WhatsApp)
└─ Optional: SendGrid/Resend (email)

Libraries
├─ zod (validation)
├─ jsonwebtoken (optional - if auth needed)
└─ bcrypt (optional - password hashing)
```

---

## 📊 DATABASE SCHEMA (COMPLETE)

### **Prisma Schema File**

Create `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ============ MASTER DATA (Static - Seed Once) ============

model Sankalp {
  id          Int       @id @default(autoincrement())
  title       String    @unique
  description String
  category    String    // "devotion", "ancestral", "mannat", "spiritual", "festival", "char_dham"
  icon        String?   // Icon identifier or SVG name
  
  circuits    Circuit[]
  bookings    Booking[]
  
  @@index([category])
}

model Circuit {
  id              Int       @id @default(autoincrement())
  name            String    @unique
  description     String?
  
  // Data from design
  stops           String[]  // ["Varanasi", "Allahabad", "Triveni Sangam"]
  defaultDays     Int       // Duration in days
  basePrice       Float     // Price per person in INR
  highlights      String[]  // ["Ganga Aarti", "Triveni Sangam", "Kaal Bhairav"]
  
  // Relationship
  sankalp         Sankalp   @relation(fields: [sankalpId], references: [id], onDelete: Cascade)
  sankalpId       Int
  
  muhurats        Muhurat[]
  bookings        Booking[]
  
  @@index([sankalpId])
}

model Muhurat {
  id              Int       @id @default(autoincrement())
  
  // Dates
  startDate       DateTime
  endDate         DateTime
  
  // Astrological data (pre-calculated)
  tithi           String?   // "Jyeshtha Shukla Panchami"
  significance    String    // "Best" | "Good" | "Average"
  reason          String?   // "Ascendant is strong, minimal dosha"
  
  // Relationship
  circuit         Circuit   @relation(fields: [circuitId], references: [id], onDelete: Cascade)
  circuitId       Int
  
  bookings        Booking[]
  
  @@index([circuitId])
  @@index([startDate])
}

// ============ USER DATA (Dynamic - User Bookings) ============

model Booking {
  id                      Int       @id @default(autoincrement())
  
  // === STEP 1: SANKALP ===
  sankalp                 Sankalp   @relation(fields: [sankalpId], references: [id])
  sankalpId               Int
  customSankalp          String?   // If user wrote their own intention
  
  // === STEP 2: CIRCUIT ===
  circuit                 Circuit   @relation(fields: [circuitId], references: [id])
  circuitId               Int
  
  // === STEP 3: MUHURAT ===
  muhurat                 Muhurat   @relation(fields: [muhuratId], references: [id])
  muhuratId               Int
  startDate               DateTime  // Selected date range
  endDate                 DateTime
  
  // === STEP 4: TRAVELLERS ===
  groupSize               Int       // 1-8 people
  hasSenior              Boolean   // 60+ in group
  mobilityNeeds          String[]  // ["Wheelchair", "Palki", "Elevator", "None"]
  dietaryPreference      String    // "Satvik", "Jain", "No onion-garlic", "No preference"
  specialRequests        String?   // User's custom text
  
  // === STEP 5: PRICING ===
  estimatedPrice         Float     // circuit.basePrice × groupSize
  finalPrice             Float?    // Set by Meera after confirmation
  
  // === STATUS & WORKFLOW ===
  status                 String    @default("pending") // "pending" | "confirmed" | "paid" | "cancelled"
  
  // === USER CONTACT ===
  userEmail              String
  userPhone              String?
  
  // === CONTEXT ===
  userContext            String?   // "Planning for mother's 70th birthday..."
  language               String    @default("bi") // "en" | "hi" | "bi"
  
  // === MEERA (CONCIERGE) ===
  conciergeNotes         String?   // Meera's internal notes
  whatsappLink           String?   // Direct WhatsApp chat link
  
  // === TIMESTAMPS ===
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
  
  @@index([userEmail])
  @@index([status])
  @@index([createdAt])
}

// ============ OPTIONAL: USER ACCOUNTS (Future Auth) ============

model User {
  id              Int       @id @default(autoincrement())
  email           String    @unique
  password        String?   // Hashed (if auth added)
  name            String?
  phone           String?
  
  preferredLanguage String  @default("bi")
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

---

## 🚀 API ROUTES (6 Endpoints)

### **Directory Structure:**

```
app/api/
├── sankalps/
│   └── route.ts
├── circuits/
│   ├── route.ts
│   └── [id]/
│       └── muhurats/
│           └── route.ts
└── bookings/
    ├── route.ts
    └── [id]/
        ├── route.ts
        └── submit/
            └── route.ts
```

---

### **ENDPOINT 1: GET /api/sankalps**

**Purpose:** Fetch all spiritual intentions (for Step 1)

```typescript
// app/api/sankalps/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sankalps = await prisma.sankalp.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        icon: true,
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(sankalps, { status: 200 });
  } catch (error) {
    console.error('Error fetching sankalps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sankalps' },
      { status: 500 }
    );
  }
}
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Ancestral rites",
    "description": "Pitru tarpan, shraddha, pind daan for departed family",
    "category": "ancestral",
    "icon": "ancestral-icon"
  },
  {
    "id": 2,
    "title": "Darshan & devotion",
    "description": "Temple visits, abhishek, puja at sacred shrines",
    "category": "devotion",
    "icon": "devotion-icon"
  }
]
```

---

### **ENDPOINT 2: GET /api/circuits?sankalpId=2**

**Purpose:** Fetch pilgrimage routes for selected intention (for Step 2)

```typescript
// app/api/circuits/route.ts
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
```

**Response:**
```json
[
  {
    "id": 5,
    "name": "Kashi–Prayagraj",
    "description": "Sacred Varanasi and Prayagraj circuit",
    "stops": ["Varanasi", "Allahabad", "Triveni Sangam"],
    "defaultDays": 7,
    "basePrice": 12000,
    "highlights": ["Ganga Aarti", "Triveni Sangam", "Kaal Bhairav"],
    "sankalp": { "title": "Darshan & devotion" }
  }
]
```

---

### **ENDPOINT 3: GET /api/circuits/[id]/muhurats**

**Purpose:** Fetch auspicious dates for selected circuit (for Step 3)

```typescript
// app/api/circuits/[id]/muhurats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const circuitId = parseInt(params.id);

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

    const muhurats = await prisma.muhurat.findMany({
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

    return NextResponse.json(muhurats, { status: 200 });
  } catch (error) {
    console.error('Error fetching muhurats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch muhurats' },
      { status: 500 }
    );
  }
}
```

**Response:**
```json
[
  {
    "id": 12,
    "startDate": "2025-05-12T00:00:00Z",
    "endDate": "2025-05-18T00:00:00Z",
    "tithi": "Jyeshtha Shukla Panchami",
    "significance": "Best",
    "reason": "Ascendant is strong, minimal dosha"
  },
  {
    "id": 13,
    "startDate": "2025-06-02T00:00:00Z",
    "endDate": "2025-06-08T00:00:00Z",
    "tithi": "Ashadha Shukla Tritiya",
    "significance": "Good",
    "reason": "Planetary alignment favourable for darshan"
  }
]
```

---

### **ENDPOINT 4: POST /api/bookings**

**Purpose:** Create new booking (called after Intention Screen) - Saves Steps 1-4

```typescript
// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const bookingSchema = z.object({
  sankalpId: z.number().int().positive(),
  customSankalp: z.string().optional(),
  circuitId: z.number().int().positive().optional(),
  muhuratId: z.number().int().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
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
        startDate: validated.startDate ? new Date(validated.startDate) : undefined,
        endDate: validated.endDate ? new Date(validated.endDate) : undefined,
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
        { error: 'Validation error', details: error.errors },
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
```

**Request Body:**
```json
{
  "sankalpId": 2,
  "circuitId": 5,
  "muhuratId": 12,
  "startDate": "2025-05-12T00:00:00Z",
  "endDate": "2025-05-18T00:00:00Z",
  "groupSize": 3,
  "hasSenior": true,
  "mobilityNeeds": ["Wheelchair"],
  "dietaryPreference": "Satvik",
  "specialRequests": "Planning for mother's 70th birthday",
  "userEmail": "user@example.com",
  "userPhone": "+91 98765 43210",
  "userContext": "Family pilgrimage",
  "language": "bi"
}
```

**Response:**
```json
{
  "id": 142,
  "sankalpId": 2,
  "circuitId": 5,
  "muhuratId": 12,
  "groupSize": 3,
  "hasSenior": true,
  "estimatedPrice": 36000,
  "finalPrice": null,
  "status": "pending",
  "createdAt": "2025-04-26T10:30:00Z",
  "updatedAt": "2025-04-26T10:30:00Z"
}
```

---

### **ENDPOINT 5: PATCH /api/bookings/[id]**

**Purpose:** Update booking when user goes back/edits steps

```typescript
// app/api/bookings/[id]/route.ts
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
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = parseInt(params.id);

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
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = parseInt(params.id);
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
        { error: 'Validation error', details: error.errors },
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
```

---

### **ENDPOINT 6: POST /api/bookings/[id]/submit**

**Purpose:** Finalize booking and send to Meera (final step)

```typescript
// app/api/bookings/[id]/submit/route.ts
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
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = parseInt(params.id);

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
```

**Response:**
```json
{
  "success": true,
  "message": "Booking submitted successfully",
  "booking": {
    "id": 142,
    "status": "confirmed",
    "estimatedPrice": 36000,
    "createdAt": "2025-04-26T10:30:00Z"
  },
  "meera": {
    "name": "Meera",
    "expectedResponseTime": "2 hours",
    "whatsappNote": "Meera will contact you via WhatsApp"
  }
}
```

---

## 📦 MASTER DATA SEEDING

### **Prisma Seed Script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // === SANKALPS ===
  const sankalps = await prisma.sankalp.createMany({
    data: [
      {
        title: 'Ancestral rites',
        description: 'Pitru tarpan, shraddha, pind daan for departed family',
        category: 'ancestral',
        icon: 'ancestral-icon',
      },
      {
        title: 'Darshan & devotion',
        description: 'Temple visits, abhishek, puja at sacred shrines',
        category: 'devotion',
        icon: 'devotion-icon',
      },
      {
        title: 'Mannat & fulfilment',
        description: 'Completion of a vow made to the divine',
        category: 'mannat',
        icon: 'mannat-icon',
      },
      {
        title: 'Spiritual seeking',
        description: 'Meditation retreats, satsang, inner pilgrimage',
        category: 'spiritual',
        icon: 'spiritual-icon',
      },
      {
        title: 'Festival & Kumbh',
        description: 'Maha Kumbh, Navratri, Karthik Purnima circuits',
        category: 'festival',
        icon: 'festival-icon',
      },
      {
        title: 'Char Dham Yatra',
        description: 'Badrinath, Kedarnath, Gangotri, Yamunotri',
        category: 'char_dham',
        icon: 'char_dham-icon',
      },
    ],
  });

  console.log(`✓ Created ${sankalps.count} sankalps`);

  // === CIRCUITS ===
  const circuits = await prisma.circuit.createMany({
    data: [
      {
        name: 'Kashi–Prayagraj',
        description: 'Sacred Varanasi and Prayagraj pilgrimage',
        stops: ['Varanasi', 'Allahabad', 'Triveni Sangam'],
        defaultDays: 7,
        basePrice: 12000,
        highlights: ['Ganga Aarti', 'Triveni Sangam', 'Kaal Bhairav'],
        sankalpId: 2, // Devotion
      },
      {
        name: 'Char Dham Complete',
        description: 'Four sacred dhams of Uttarakhand',
        stops: ['Badrinath', 'Kedarnath', 'Gangotri', 'Yamunotri'],
        defaultDays: 14,
        basePrice: 25000,
        highlights: ['Alpine meadows', 'Sacred peaks', 'Pristine rivers'],
        sankalpId: 6, // Char Dham
      },
      {
        name: 'Mathura–Vrindavan',
        description: 'Krishna\'s birthplace and divine love sites',
        stops: ['Mathura', 'Vrindavan', 'Govardhan'],
        defaultDays: 5,
        basePrice: 8000,
        highlights: ['Krishna Janmabhoomi', 'Banke Bihari', 'Radha Kund'],
        sankalpId: 2, // Devotion
      },
      {
        name: 'Maha Kumbh 2025',
        description: 'Prayagraj Kumbh Mela circuit',
        stops: ['Prayagraj', 'Triveni', 'Sangam'],
        defaultDays: 5,
        basePrice: 15000,
        highlights: ['Triveni Sangam dip', 'Akshaya Vat', 'Patalpuri Temple'],
        sankalpId: 5, // Festival
      },
    ],
  });

  console.log(`✓ Created ${circuits.count} circuits`);

  // === MUHURATS (Auspicious dates - next 6 months) ===
  const muhurats = await prisma.muhurat.createMany({
    data: [
      {
        startDate: new Date('2025-05-12'),
        endDate: new Date('2025-05-18'),
        tithi: 'Jyeshtha Shukla Panchami',
        significance: 'Best',
        reason: 'Ascendant is strong, minimal dosha',
        circuitId: 1,
      },
      {
        startDate: new Date('2025-05-20'),
        endDate: new Date('2025-05-27'),
        tithi: 'Jyeshtha Shukla Navami',
        significance: 'Good',
        reason: 'Planetary alignment favourable for darshan',
        circuitId: 1,
      },
      {
        startDate: new Date('2025-06-02'),
        endDate: new Date('2025-06-08'),
        tithi: 'Ashadha Shukla Tritiya',
        significance: 'Good',
        reason: 'Summer solstice favours spiritual journeys',
        circuitId: 2,
      },
      // Add more muhurats as needed
    ],
  });

  console.log(`✓ Created ${muhurats.count} muhurats`);
  console.log('✅ Seeding complete!');
}

main()
  .catch(e => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run seeding:**
```bash
npx prisma db seed
```

---

## 🔧 SETUP INSTRUCTIONS

### **1. Initialize Next.js Project**

```bash
npx create-next-app@latest yaatri-backend --typescript --tailwind
cd yaatri-backend
```

### **2. Install Prisma**

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

### **3. Configure Database**

Create `.env.local`:
```env
DATABASE_URL="postgresql://user:password@host:5432/yaatri"
NEXT_PUBLIC_API_URL="http://localhost:3000"
MEERA_WHATSAPP_NUMBER="+91 XXXXXXXXXX"
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
```

### **4. Create Prisma Schema**

Copy schema from above into `prisma/schema.prisma`

### **5. Run Migrations**

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### **6. Create Prisma Client**

Create `lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### **7. Create API Routes**

Copy all 6 route files from above into `app/api/`

### **8. Test Locally**

```bash
npm run dev
```

Test endpoints:
```bash
curl http://localhost:3000/api/sankalps
curl http://localhost:3000/api/circuits?sankalpId=2
```

---

## 📋 IMPLEMENTATION CHECKLIST

- [ ] Database schema created (`schema.prisma`)
- [ ] PostgreSQL database connected (Neon/Supabase)
- [ ] Prisma migrations run
- [ ] Seed data inserted
- [ ] GET /api/sankalps working
- [ ] GET /api/circuits working
- [ ] GET /api/circuits/[id]/muhurats working
- [ ] POST /api/bookings working
- [ ] PATCH /api/bookings/[id] working
- [ ] GET /api/bookings/[id] working
- [ ] POST /api/bookings/[id]/submit working
- [ ] Error handling complete
- [ ] TypeScript types defined
- [ ] Twilio WhatsApp integration (optional for MVP)
- [ ] Email notifications (optional for MVP)
- [ ] Deployed to Vercel

---

## 🧪 TESTING YOUR APIS

### **Test Sankalps**
```bash
curl http://localhost:3000/api/sankalps
```

### **Test Circuits**
```bash
curl http://localhost:3000/api/circuits?sankalpId=2
```

### **Test Create Booking**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "sankalpId": 2,
    "circuitId": 1,
    "muhuratId": 1,
    "startDate": "2025-05-12T00:00:00Z",
    "endDate": "2025-05-18T00:00:00Z",
    "groupSize": 3,
    "hasSenior": true,
    "mobilityNeeds": ["Wheelchair"],
    "dietaryPreference": "Satvik",
    "userEmail": "test@example.com",
    "userPhone": "+91 98765 43210"
  }'
```

---

## 🚨 IMPORTANT NOTES FOR YOU

1. **Price Calculation:** Always multiply `circuit.basePrice × groupSize`
2. **Status Workflow:** pending → confirmed → paid → (or cancelled)
3. **No Authentication Yet:** User is identified by email + booking ID
4. **Meera Integration:** WhatsApp notification is critical (implement with Twilio)
5. **Error Handling:** Always validate input with Zod
6. **Database:** PostgreSQL only (Neon, Supabase, or Railway)
7. **CORS:** Configure if frontend is on different domain
8. **Environment Variables:** Never hardcode secrets

---

## 📞 API CONTRACT WITH FRONTEND

**All dates sent as ISO 8601 strings:**
```typescript
"2025-05-12T00:00:00Z"
```

**All prices in INR (₹):**
```typescript
{
  "basePrice": 12000,
  "estimatedPrice": 36000
}
```

**All arrays must be included (even if empty):**
```typescript
{
  "mobilityNeeds": ["Wheelchair"],  // Never null
  "dietaryPreference": "Satvik"
}
```

**Status values only:**
- `"pending"` - Just created
- `"confirmed"` - Meera confirmed
- `"paid"` - Payment received
- `"cancelled"` - Cancelled

---

That's everything you need to build the backend! 🚀
