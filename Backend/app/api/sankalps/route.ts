import { NextResponse } from 'next/server';
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
