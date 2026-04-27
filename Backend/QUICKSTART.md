# 🚀 Yaatri Backend - Quick Start Guide

## ✅ Setup Complete!

Your complete Yaatri backend has been scaffolded and built successfully. Here's what's been created:

### 📁 Project Structure

```
d:\Yatri/
├── app/api/                          # API routes
│   ├── sankalps/route.ts             # GET all sankalps
│   ├── circuits/route.ts             # GET circuits by sankalp
│   ├── circuits/[id]/muhurats/       # GET muhurats for circuit
│   └── bookings/
│       ├── route.ts                  # POST create booking
│       └── [id]/
│           ├── route.ts              # GET/PATCH booking
│           └── submit/route.ts       # POST submit booking
├── lib/
│   └── prisma.ts                     # Prisma client singleton
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── seed.ts                       # Seed script
├── .env.local                        # Environment variables (template)
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript config
├── next.config.js                    # Next.js config
└── README.md                         # Full documentation
```

## 🔧 Environment Setup

1. **Create PostgreSQL database** (choose one):
   - Neon: https://console.neon.tech (free tier available)
   - Supabase: https://app.supabase.com
   - Railway: https://railway.app

2. **Update `.env.local`:**
   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/yaatri"
   MEERA_WHATSAPP_NUMBER="+91 XXXXXXXXXX"
   ```

3. **Initialize database:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

## 🎯 6 API Endpoints Ready

| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 1 | GET | `/api/sankalps` | Fetch all intentions |
| 2 | GET | `/api/circuits?sankalpId=2` | Fetch routes by intention |
| 3 | GET | `/api/circuits/[id]/muhurats` | Fetch auspicious dates |
| 4 | POST | `/api/bookings` | Create booking |
| 5 | PATCH | `/api/bookings/[id]` | Update booking |
| 6 | POST | `/api/bookings/[id]/submit` | Finalize booking |

## 🏃 Run Development Server

```bash
npm run dev
```

Server runs at: **http://localhost:3000**

## 📊 Database

### View & Edit Database
```bash
npm run db:studio
```

### Master Data Included
- ✅ 6 Sankalps (spiritual intentions)
- ✅ 4 Circuits (pilgrimage routes)
- ✅ 7 Muhurats (auspicious dates)

## 🧪 Test API Endpoints

```bash
# Fetch all sankalps
curl http://localhost:3000/api/sankalps

# Fetch circuits for sankalp 2
curl http://localhost:3000/api/circuits?sankalpId=2

# Fetch muhurats for circuit 1
curl http://localhost:3000/api/circuits/1/muhurats

# Create a booking
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

## 📝 Next Steps

1. ✅ Install dependencies: `npm install` (done)
2. ✅ Prisma client generated (done)
3. ✅ Project built successfully (done)
4. ⏭️ **Set up PostgreSQL database**
5. ⏭️ Update `.env.local` with DATABASE_URL
6. ⏭️ Run `npm run db:migrate`
7. ⏭️ Run `npm run db:seed`
8. ⏭️ Start dev server: `npm run dev`
9. ⏭️ Test endpoints with curl or Postman

## 📚 Documentation

See `README.md` for complete documentation including:
- Detailed API specifications
- Database schema explanation
- Business logic notes
- Deployment instructions
- Future enhancements

## ✨ Key Features

- ✅ TypeScript for type safety
- ✅ Prisma ORM with PostgreSQL
- ✅ Zod validation for all inputs
- ✅ RESTful API design
- ✅ Error handling & proper HTTP status codes
- ✅ Database seeding with master data
- ✅ Production-ready build
- ✅ Environment configuration
- ✅ WhatsApp integration ready (Twilio)
- ✅ Email notifications ready (optional)

## 🚨 Important Notes

1. **Database Required**: PostgreSQL is mandatory (not SQLite)
2. **Dates**: All dates are ISO 8601 format (e.g., "2025-05-12T00:00:00Z")
3. **Prices**: In INR (₹), calculated as `circuit.basePrice × groupSize`
4. **Status Flow**: pending → confirmed → paid → (or cancelled)
5. **No Auth Yet**: Current implementation uses email for identification

## 🔐 Deployment

Ready for deployment to:
- ✅ Vercel (recommended)
- ✅ Railway
- ✅ Fly.io
- ✅ Any Node.js host

## 📞 Support

Check the following for help:
- `README.md` - Complete API documentation
- `.github/copilot-instructions.md` - Development guide
- API test examples in this file above

---

**You're all set! Database → Migrate → Seed → Dev → Test** 🎉
