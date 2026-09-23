import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateDealRating } from '@/lib/deal-rating';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const listings = await prisma.listing.findMany({
      where: { sellerId: user.id },
      include: {
        images: { orderBy: { order: 'asc' } },
        inquiries: { orderBy: { createdAt: 'desc' } },
        _count: { select: { favorites: true, inquiries: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const listingsWithDeals = await Promise.all(
      listings.map(async (car) => {
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

    const totalActive = listings.filter((l) => l.status === 'ACTIVE').length;
    const totalViews = listings.reduce((sum, l) => sum + l.views, 0);
    const totalInquiries = listings.reduce((sum, l) => sum + l._count.inquiries, 0);
    const totalInventoryValue = listings
      .filter((l) => l.status === 'ACTIVE')
      .reduce((sum, l) => sum + l.price, 0);

    return NextResponse.json({
      listings: listingsWithDeals,
      stats: {
        totalListings: listings.length,
        totalActive,
        totalViews,
        totalInquiries,
        totalInventoryValue,
      },
    });
  } catch (error: any) {
    console.error('Dealer listings error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      make,
      model,
      year,
      trim,
      bodyType,
      mileage,
      price,
      vin,
      description,
      city,
      state,
      zip,
      fuelType,
      transmission,
      drivetrain,
      exteriorColor,
      interiorColor,
      condition,
      engine,
      features,
      images = [],
    } = body;

    if (!make || !model || !year || !price || !mileage || !vin || !bodyType) {
      return NextResponse.json(
        { error: 'Make, model, year, price, mileage, body type, and VIN are required' },
        { status: 400 }
      );
    }

    // Check VIN uniqueness
    const existingVin = await prisma.listing.findUnique({ where: { vin } });
    if (existingVin) {
      return NextResponse.json(
        { error: 'A listing with this VIN already exists' },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.create({
      data: {
        sellerId: user.id,
        make,
        model,
        year: parseInt(year),
        trim: trim || null,
        bodyType,
        mileage: parseInt(mileage),
        price: parseFloat(price),
        vin: vin.toUpperCase(),
        description: description || `${year} ${make} ${model} ${trim || ''} in great condition.`,
        city: city || 'Dallas',
        state: state || 'TX',
        zip: zip || '75201',
        location: `${city || 'Dallas'}, ${state || 'TX'}`,
        fuelType: fuelType || 'Gasoline',
        transmission: transmission || 'Automatic',
        drivetrain: drivetrain || 'FWD',
        exteriorColor: exteriorColor || 'Silver',
        interiorColor: interiorColor || 'Black',
        condition: condition || 'Used',
        engine: engine || 'Standard Engine',
        features: Array.isArray(features) ? JSON.stringify(features) : features || '[]',
        status: 'ACTIVE',
      },
    });

    // Attach images
    const imageList = Array.isArray(images) && images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&auto=format&fit=crop&q=80',
    ];

    for (let i = 0; i < imageList.length; i++) {
      await prisma.listingImage.create({
        data: {
          listingId: listing.id,
          url: imageList[i],
          order: i,
          isPrimary: i === 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      listingId: listing.id,
      message: 'Listing published successfully!',
    });
  } catch (error: any) {
    console.error('Create listing error:', error);
    return NextResponse.json(
      { error: 'Failed to create listing', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, price, status, description, mileage } = body;

    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing || (existing.sellerId !== user.id && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Listing not found or access denied' }, { status: 403 });
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        price: price ? parseFloat(price) : undefined,
        status: status || undefined,
        description: description || undefined,
        mileage: mileage ? parseInt(mileage) : undefined,
      },
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing || (existing.sellerId !== user.id && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.listing.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}
