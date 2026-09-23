import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateDealRating } from '@/lib/deal-rating';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const bodyType = searchParams.get('bodyType');
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const minYear = searchParams.get('minYear') ? parseInt(searchParams.get('minYear')!) : undefined;
    const maxYear = searchParams.get('maxYear') ? parseInt(searchParams.get('maxYear')!) : undefined;
    const maxMileage = searchParams.get('maxMileage') ? parseInt(searchParams.get('maxMileage')!) : undefined;
    const fuelType = searchParams.get('fuelType');
    const transmission = searchParams.get('transmission');
    const drivetrain = searchParams.get('drivetrain');
    const condition = searchParams.get('condition');
    const dealRatingFilter = searchParams.get('dealRating')?.toUpperCase(); // GREAT, FAIR, HIGH
    const query = searchParams.get('q');
    const sort = searchParams.get('sort') || 'best_deal';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '12')));

    // Build Prisma where clause
    const where: any = {
      status: 'ACTIVE',
    };

    if (make) where.make = { equals: make };
    if (model) where.model = { equals: model };
    if (bodyType) where.bodyType = { equals: bodyType };
    if (fuelType) where.fuelType = { equals: fuelType };
    if (transmission) where.transmission = { equals: transmission };
    if (drivetrain) where.drivetrain = { equals: drivetrain };
    if (condition) where.condition = { equals: condition };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (minYear !== undefined || maxYear !== undefined) {
      where.year = {};
      if (minYear !== undefined) where.year.gte = minYear;
      if (maxYear !== undefined) where.year.lte = maxYear;
    }

    if (maxMileage !== undefined) {
      where.mileage = { lte: maxMileage };
    }

    if (query) {
      where.OR = [
        { make: { contains: query } },
        { model: { contains: query } },
        { trim: { contains: query } },
        { description: { contains: query } },
        { city: { contains: query } },
        { state: { contains: query } },
        { zip: { contains: query } },
      ];
    }

    // Determine database order by
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'mileage_asc') orderBy = { mileage: 'asc' };
    else if (sort === 'year_desc') orderBy = { year: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    // Fetch listings matching basic criteria
    const rawListings = await prisma.listing.findMany({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        seller: {
          select: {
            id: true,
            name: true,
            dealerName: true,
            dealerRating: true,
            phone: true,
            dealerCity: true,
            dealerState: true,
          },
        },
      },
      orderBy,
    });

    // Compute deal rating for each listing
    const listingsWithDeals = await Promise.all(
      rawListings.map(async (car) => {
        const deal = await calculateDealRating({
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          mileage: car.mileage,
          price: car.price,
          bodyType: car.bodyType,
        });
        return {
          ...car,
          dealRating: deal,
        };
      })
    );

    // Filter by deal rating if requested
    let filteredListings = listingsWithDeals;
    if (dealRatingFilter && ['GREAT', 'FAIR', 'HIGH'].includes(dealRatingFilter)) {
      filteredListings = filteredListings.filter(
        (l) => l.dealRating.rating === dealRatingFilter
      );
    }

    // Sort by best_deal if selected (highest % below market first)
    if (sort === 'best_deal') {
      filteredListings.sort((a, b) => b.dealRating.diffPercent - a.dealRating.diffPercent);
    }

    // Apply pagination
    const total = filteredListings.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = filteredListings.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      listings: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings', details: error.message },
      { status: 500 }
    );
  }
}
