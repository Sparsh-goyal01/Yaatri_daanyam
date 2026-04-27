# 🙏 Yaatri - Pilgrimage Booking Backend

A complete REST API backend for the Yaatri pilgrimage booking system built with Next.js, Prisma, and PostgreSQL.

## 🎯 Features

- ✅ PostgreSQL database with Prisma ORM
- ✅ 6 REST API endpoints
- ✅ Master data (Sankalps, Circuits, Muhurats)
- ✅ Business logic (price calculation, validation)
- ✅ Validation with Zod
- ✅ Error handling & proper HTTP responses
- ✅ Environment configuration
- ✅ Database seeding

## 🛠️ Tech Stack

```
Next.js 14+ (API Routes)
├─ TypeScript
├─ Prisma ORM
├─ PostgreSQL (Neon, Supabase, or Railway)
└─ Zod (validation)
```

## 📋 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/sankalps` | Fetch all spiritual intentions |
| GET | `/api/circuits?sankalpId=2` | Fetch pilgrimage routes by intention |
| GET | `/api/circuits/[id]/muhurats` | Fetch auspicious dates for circuit |
| POST | `/api/bookings` | Create new booking |
| GET | `/api/bookings/[id]` | Retrieve booking details |
| PATCH | `/api/bookings/[id]` | Update booking |
| POST | `/api/bookings/[id]/submit` | Finalize and submit booking |

## 🚀 Quick Start

### 1. Setup Database

Copy `.env.local` and update `DATABASE_URL`:

```bash
# Option A: Neon (Recommended)
DATABASE_URL="postgresql://user:password@host/yaatri"

# Option B: Supabase
DATABASE_URL="postgresql://postgres.[project]:[password]@aws-0-region.pooler.supabase.com:6543/postgres"

# Option C: Railway
DATABASE_URL="postgresql://user:password@railway-host:5432/yaatri"
```

### 2. Install & Initialize

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create database schema
npx prisma migrate dev --name init

# Seed master data
npm run db:seed
```

### 2.1 Frontend Integration Environment

Add `CORS_ORIGIN` (comma-separated if multiple origins):

```bash
CORS_ORIGIN="http://localhost:5500,http://127.0.0.1:5500"
```

For development from `file://` pages, backend allows `Origin: null` automatically.

### 3. Run Development Server

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

## 📊 Database Schema

### Sankalp
Spiritual intention categories:
- Ancestral rites
- Darshan & devotion
- Mannat & fulfilment
- Spiritual seeking
- Festival & Kumbh
- Char Dham Yatra

### Circuit
Pilgrimage routes with stops, days, price, and highlights

### Muhurat
Auspicious date ranges with tithi, significance, and astrological reasoning

### Booking
User bookings with journey details, traveller info, pricing, and status

## 🧪 Test API Endpoints

```bash
# Fetch all sankalps
curl http://localhost:3000/api/sankalps

# Fetch circuits for a sankalp
curl http://localhost:3000/api/circuits?sankalpId=2

# Fetch muhurats for a circuit
curl http://localhost:3000/api/circuits/1/muhurats

# Create booking
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

# Submit booking
curl -X POST http://localhost:3000/api/bookings/1/submit
```

## 📝 Seeding Data

The project includes pre-seeded master data:

- **6 Sankalps** - Spiritual intentions
- **4 Circuits** - Pilgrimage routes
- **7 Muhurats** - Auspicious dates for next 6 months

Modify `prisma/seed.ts` to add more data.

## 🔧 Database Management

```bash
# View and edit database visually
npm run db:studio

# Run migrations
npm run db:migrate

# Push schema without migrations (development only)
npm run db:push
```

## 🚨 Important Notes

1. **Prices**: Always multiply `circuit.basePrice × groupSize`
2. **Status Workflow**: pending → confirmed → paid → (or cancelled)
3. **Dates**: All dates sent as ISO 8601 strings
4. **Validation**: All input validated with Zod
5. **Authentication**: Currently email-based (future auth optional)
6. **WhatsApp**: Meera integration ready for Twilio setup

## 📈 Future Enhancements

- [ ] JWT authentication
- [ ] Twilio WhatsApp integration for Meera
- [ ] Email notifications (SendGrid/Resend)
- [ ] Payment gateway integration
- [ ] Advanced search & filters
- [ ] Analytics dashboard
- [ ] Admin panel

## 📦 Deployment

### Vercel (Recommended)

```bash
# Link to Vercel
vercel

# Set environment variables in Vercel dashboard
# DATABASE_URL
# MEERA_WHATSAPP_NUMBER
# TWILIO_* (optional)
```

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📞 Support

For backend API questions, check the endpoints above and test with the curl commands provided.

---

**Built with ❤️ for pilgrims**
