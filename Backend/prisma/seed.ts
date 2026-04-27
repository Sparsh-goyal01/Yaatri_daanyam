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
        description: "Krishna's birthplace and divine love sites",
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
      {
        startDate: new Date('2025-06-15'),
        endDate: new Date('2025-06-19'),
        tithi: 'Ashadha Shukla Dashami',
        significance: 'Best',
        reason: 'Ideal for pilgrimage completion',
        circuitId: 3,
      },
      {
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-06'),
        tithi: 'Ashadha Krishna Amavasya',
        significance: 'Good',
        reason: 'Monsoon mystique enhances devotion',
        circuitId: 4,
      },
      {
        startDate: new Date('2025-07-20'),
        endDate: new Date('2025-07-25'),
        tithi: 'Shravan Shukla Panchami',
        significance: 'Best',
        reason: 'Sacred month for Hindu pilgrims',
        circuitId: 1,
      },
      {
        startDate: new Date('2025-08-10'),
        endDate: new Date('2025-08-15'),
        tithi: 'Shravan Shukla Purnima',
        significance: 'Best',
        reason: 'Full moon amplifies sacred energy',
        circuitId: 2,
      },
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
