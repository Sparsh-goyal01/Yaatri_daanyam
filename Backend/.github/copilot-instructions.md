# Yaatri Backend - Development Guide

## Project Overview

This is a complete REST API backend for the Yaatri pilgrimage booking system. It provides 6 API endpoints for managing pilgrimage bookings with Sankalps, Circuits, Muhurats, and traveller information.

## Tech Stack

- **Framework**: Next.js 14+ with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Runtime**: Node.js

## Database Setup

Before running the project:

1. Set up a PostgreSQL database (Neon, Supabase, or Railway)
2. Update `DATABASE_URL` in `.env.local`
3. Run migrations: `npm run db:migrate`
4. Seed data: `npm run db:seed`

## Development Workflow

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Build for production
npm run db:studio  # View/edit database with Prisma Studio
```

## API Endpoints (6 Total)

### 1. GET /api/sankalps
Fetch all spiritual intentions (Step 1 - Intention Screen)

### 2. GET /api/circuits?sankalpId=2
Fetch pilgrimage routes by intention (Step 2 - Circuit Screen)

### 3. GET /api/circuits/[id]/muhurats
Fetch auspicious dates for a circuit (Step 3 - Muhurat Screen)

### 4. POST /api/bookings
Create new booking with all journey details (Steps 1-4)

### 5. PATCH /api/bookings/[id]
Update booking when user edits steps

### 6. POST /api/bookings/[id]/submit
Finalize booking and notify Meera via WhatsApp

## Database Models

- **Sankalp**: Spiritual intention categories (6 types)
- **Circuit**: Pilgrimage routes with stops, prices, highlights
- **Muhurat**: Auspicious dates with tithi and astrological info
- **Booking**: User bookings with traveller details and pricing
- **User**: Optional for future authentication

## Key Business Logic

1. **Price Calculation**: `circuit.basePrice × groupSize`
2. **Status Workflow**: pending → confirmed → paid → cancelled
3. **Booking Validation**: Uses Zod for schema validation
4. **Date Format**: ISO 8601 strings (2025-05-12T00:00:00Z)

## Environment Variables

See `.env.local` for required configurations:
- DATABASE_URL (PostgreSQL connection)
- NEXT_PUBLIC_API_URL (API endpoint)
- MEERA_WHATSAPP_NUMBER (Concierge WhatsApp)
- TWILIO_* (Optional - for WhatsApp integration)

## Seeding Master Data

Run `npm run db:seed` to populate:
- 6 Sankalps (intentions)
- 4 Circuits (routes)
- 7 Muhurats (auspicious dates)

Modify `prisma/seed.ts` to add more data.

## File Structure

```
.
├── app/
│   ├── api/
│   │   ├── sankalps/route.ts           # GET all sankalps
│   │   ├── circuits/route.ts           # GET circuits by sankalp
│   │   ├── circuits/[id]/muhurats/     # GET muhurats for circuit
│   │   └── bookings/
│   │       ├── route.ts                # POST create, (GET list)
│   │       └── [id]/
│   │           ├── route.ts            # GET, PATCH booking
│   │           └── submit/route.ts     # POST submit booking
│   └── page.tsx                        # API welcome page
├── lib/
│   └── prisma.ts                       # Prisma client singleton
├── prisma/
│   ├── schema.prisma                   # Database schema
│   └── seed.ts                         # Seed script
├── .env.local                          # Environment variables
├── next.config.js                      # Next.js config
├── tsconfig.json                       # TypeScript config
└── package.json                        # Dependencies & scripts
```

## Common Tasks

### Test an endpoint
```bash
curl http://localhost:3000/api/sankalps
```

### View database
```bash
npm run db:studio
```

### Run migrations
```bash
npm run db:migrate
```

### Build for production
```bash
npm run build
npm start
```

## Important Notes

1. All dates must be ISO 8601 format
2. All prices in INR (₹)
3. Mobile needs must be an array (never null)
4. Status values are fixed: pending, confirmed, paid, cancelled
5. User identified by email + booking ID (no authentication yet)
6. Meera WhatsApp integration ready for Twilio setup

## Deployment

Use Vercel for easy deployment:
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy on push

## Future Enhancements

- JWT authentication
- Twilio WhatsApp notifications
- Email confirmations
- Payment gateway
- Advanced search filters
- Admin dashboard

---

**For detailed API documentation, see README.md**
