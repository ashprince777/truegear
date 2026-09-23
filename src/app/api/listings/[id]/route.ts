import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateDealRating } from '@/lib/deal-rating';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            dealerName: true,
            dealerRating: true,
            dealerCity: true,
            dealerState: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Calculate deal rating
    const dealRating = await calculateDealRating({
      id: listing.id,
      make: listing.make,
      model: listing.model,
      year: listing.year,
      mileage: listing.mileage,
      price: listing.price,
      bodyType: listing.bodyType,
    });

    // Find similar listings (same make or bodyType, excluding current)
    const rawSimilar = await prisma.listing.findMany({
      where: {
        id: { not: listing.id },
        status: 'ACTIVE',
        OR: [
          { make: listing.make },
          { bodyType: listing.bodyType },
        ],
      },
      take: 4,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        seller: {
          select: {
            name: true,
            dealerName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const similarListings = await Promise.all(
      rawSimilar.map(async (car) => {
        const deal = await calculateDealRating({
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          mileage: car.mileage,
          price: car.price,
          bodyType: car.bodyType,
        });
        return { ...car, dealRating: deal };
      })
    );

    return NextResponse.json({
      listing: {
        ...listing,
        dealRating,
      },
      similarListings,
    });
  } catch (error: any) {
    console.error('Error fetching listing details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing', details: error.message },
      { status: 500 }
    );
  }
}
