import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateDealRating } from '@/lib/deal-rating';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        listing: {
          include: {
            images: { orderBy: { order: 'asc' } },
            seller: {
              select: { name: true, dealerName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const listingsWithDeals = await Promise.all(
      favorites.map(async (fav) => {
        const car = fav.listing;
        const dealRating = await calculateDealRating({
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          mileage: car.mileage,
          price: car.price,
          bodyType: car.bodyType,
        });
        return {
          favoriteId: fav.id,
          savedAt: fav.createdAt,
          ...car,
          dealRating,
        };
      })
    );

    return NextResponse.json({ favorites: listingsWithDeals });
  } catch (error: any) {
    console.error('Favorites error:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to save favorites' }, { status: 401 });
    }

    const { listingId } = await request.json();
    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isFavorite: false, message: 'Removed from favorites' });
    } else {
      await prisma.favorite.create({
        data: {
          userId: user.id,
          listingId,
        },
      });
      return NextResponse.json({ isFavorite: true, message: 'Added to favorites' });
    }
  } catch (error: any) {
    console.error('Toggle favorite error:', error);
    return NextResponse.json({ error: 'Failed to update favorite' }, { status: 500 });
  }
}
