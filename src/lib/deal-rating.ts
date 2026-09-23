import { prisma } from './prisma';

export type DealRatingType = 'GREAT' | 'FAIR' | 'HIGH';

export interface DealRatingResult {
  rating: DealRatingType;
  label: string;
  badgeClass: string;
  avgMarketPrice: number;
  diffAmount: number; // positive = below market (savings), negative = above market
  diffPercent: number; // e.g. 14.5% below market
  comparableCount: number;
  description: string;
}

/**
 * Calculates the CarGurus-style deal rating for a listing.
 * Compares against listings with same make & model, year +/- 1, and mileage within +/- 15%.
 */
export async function calculateDealRating(listing: {
  id?: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  bodyType?: string;
}): Promise<DealRatingResult> {
  const minMileage = Math.max(0, Math.round(listing.mileage * 0.85));
  const maxMileage = Math.round(listing.mileage * 1.15);
  const minYear = listing.year - 1;
  const maxYear = listing.year + 1;

  // 1. Primary strict match: same make, model, year +/- 1, mileage +/- 15%
  let comparables = await prisma.listing.findMany({
    where: {
      id: listing.id ? { not: listing.id } : undefined,
      make: { equals: listing.make },
      model: { equals: listing.model },
      year: { gte: minYear, lte: maxYear },
      mileage: { gte: minMileage, lte: maxMileage },
      status: 'ACTIVE',
    },
    select: { price: true, mileage: true, year: true },
  });

  // 2. Fallback: broaden year to +/- 2 if fewer than 2 comparables
  if (comparables.length < 2) {
    comparables = await prisma.listing.findMany({
      where: {
        id: listing.id ? { not: listing.id } : undefined,
        make: { equals: listing.make },
        model: { equals: listing.model },
        year: { gte: listing.year - 2, lte: listing.year + 2 },
        status: 'ACTIVE',
      },
      select: { price: true, mileage: true, year: true },
    });
  }

  // 3. Fallback: broaden to same make and bodyType
  if (comparables.length < 2 && listing.bodyType) {
    comparables = await prisma.listing.findMany({
      where: {
        id: listing.id ? { not: listing.id } : undefined,
        make: { equals: listing.make },
        bodyType: { equals: listing.bodyType },
        status: 'ACTIVE',
      },
      select: { price: true, mileage: true, year: true },
    });
  }

  // If still no comparables, synthesize baseline based on car price
  let avgMarketPrice = listing.price;
  let compCount = comparables.length;

  if (comparables.length > 0) {
    const sum = comparables.reduce((acc, curr) => acc + curr.price, 0);
    avgMarketPrice = Math.round(sum / comparables.length);
  } else {
    // If solitary listing, assume it represents fair baseline market price
    avgMarketPrice = listing.price;
    compCount = 1;
  }

  const diffAmount = avgMarketPrice - listing.price;
  const diffPercent = Math.round(((avgMarketPrice - listing.price) / avgMarketPrice) * 1000) / 10;

  let rating: DealRatingType = 'FAIR';
  let label = 'Fair Deal';
  let badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
  let description = 'Priced around market average.';

  if (diffPercent > 10) {
    rating = 'GREAT';
    label = 'Great Deal';
    badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    description = `$${Math.abs(Math.round(diffAmount)).toLocaleString()} below estimated market value!`;
  } else if (diffPercent < -10) {
    rating = 'HIGH';
    label = 'High Price';
    badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
    description = `$${Math.abs(Math.round(diffAmount)).toLocaleString()} above estimated market value.`;
  } else {
    description = `Within $${Math.abs(Math.round(diffAmount)).toLocaleString()} of estimated market value.`;
  }

  return {
    rating,
    label,
    badgeClass,
    avgMarketPrice,
    diffAmount,
    diffPercent,
    comparableCount: compCount,
    description,
  };
}
