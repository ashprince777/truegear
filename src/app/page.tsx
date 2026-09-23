import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { calculateDealRating } from '@/lib/deal-rating';
import { CarCard } from '@/components/CarCard';
import { PriceGauge } from '@/components/PriceGauge';
import {
  Car,
  Search,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  Award,
  ChevronRight,
  Truck,
  Zap,
} from 'lucide-react';

export const revalidate = 60; // ISR cache

export default async function HomePage() {
  // Fetch active listings count and featured / trending deals
  const [totalCarsCount, rawFeatured] = await Promise.all([
    prisma.listing.count({ where: { status: 'ACTIVE' } }),
    prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      take: 8,
      include: {
        images: { orderBy: { order: 'asc' } },
        seller: {
          select: {
            id: true,
            name: true,
            dealerName: true,
            dealerRating: true,
            dealerCity: true,
            dealerState: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const featuredCars = await Promise.all(
    rawFeatured.map(async (car) => {
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

  // Filter top great deals first
  const greatDeals = featuredCars
    .filter((c) => c.dealRating.rating === 'GREAT')
    .slice(0, 4);

  // Live counts by body type from DB
  const bodyGroupCounts = await prisma.listing.groupBy({
    by: ['bodyType'],
    _count: { id: true },
    where: { status: 'ACTIVE' },
  });
  const countMap: Record<string, number> = {};
  bodyGroupCounts.forEach((b) => {
    countMap[b.bodyType] = b._count.id;
  });

  const bodyTypes = [
    { name: 'SUV', label: 'SUVs & Crossovers', count: countMap['SUV'] || 0, image: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=500&auto=format&fit=crop&q=80' },
    { name: 'Sedan', label: 'Sedans', count: countMap['Sedan'] || 0, image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&auto=format&fit=crop&q=80' },
    { name: 'Truck', label: 'Pickup Trucks', count: countMap['Truck'] || 0, image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500&auto=format&fit=crop&q=80' },
    { name: 'Coupe', label: 'Coupes & Sports', count: countMap['Coupe'] || 0, image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80' },
    { name: 'Convertible', label: 'Convertibles', count: countMap['Convertible'] || 0, image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&auto=format&fit=crop&q=80' },
    { name: 'Hatchback', label: 'Hatchbacks', count: countMap['Hatchback'] || 0, image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=500&auto=format&fit=crop&q=80' },
    { name: 'Wagon', label: 'Station Wagons', count: countMap['Wagon'] || 0, image: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=500&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-16 md:py-24">
        {/* Background gradient & ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-400 text-xs font-bold tracking-wide uppercase mb-4 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unbiased Algorithmic Deal Ratings</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Know If It’s A <span className="text-emerald-400">Great Deal</span> Before You Buy.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              We analyze thousands of comparable car listings in real time to calculate true market values. Shop smart, compare side by side, and save thousands.
            </p>
          </div>

          {/* Quick Search Widget */}
          <div className="mt-8 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/20 text-slate-900">
            <form action="/cars" method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Make select */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Make
                </label>
                <select
                  name="make"
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">All Makes</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Ford">Ford</option>
                  <option value="Tesla">Tesla</option>
                  <option value="BMW">BMW</option>
                  <option value="Porsche">Porsche</option>
                  <option value="Jeep">Jeep</option>
                  <option value="Chevrolet">Chevrolet</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Subaru">Subaru</option>
                  <option value="Audi">Audi</option>
                  <option value="Mazda">Mazda</option>
                  <option value="Kia">Kia</option>
                  <option value="Lexus">Lexus</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="Volvo">Volvo</option>
                </select>
              </div>

              {/* Body Type */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Body Style
                </label>
                <select
                  name="bodyType"
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">All Body Styles</option>
                  <option value="SUV">SUV / Crossover</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Truck">Truck</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Convertible">Convertible</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Wagon">Wagon</option>
                </select>
              </div>

              {/* Max Price */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Max Price
                </label>
                <select
                  name="maxPrice"
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Any Price</option>
                  <option value="25000">Under $25,000</option>
                  <option value="35000">Under $35,000</option>
                  <option value="45000">Under $45,000</option>
                  <option value="60000">Under $60,000</option>
                  <option value="80000">Under $80,000</option>
                </select>
              </div>

              {/* Deal Rating Filter */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Deal Rating
                </label>
                <select
                  name="dealRating"
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold text-emerald-800 focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Any Deal Rating</option>
                  <option value="great">Great Deals (&gt; 10% below avg)</option>
                  <option value="fair">Fair Deals (Market rate)</option>
                  <option value="high">High Price (Above market rate)</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer h-[42px]"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Inventory</span>
                </button>
              </div>
            </form>

            {/* Quick popular tags */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">Popular Searches:</span>
              <Link href="/cars?make=Toyota&model=Camry" className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors">
                Toyota Camry
              </Link>
              <Link href="/cars?make=Ford&model=F-150" className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors">
                Ford F-150
              </Link>
              <Link href="/cars?make=Tesla&model=Model+3" className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors">
                Tesla Model 3
              </Link>
              <Link href="/cars?dealRating=great" className="px-2.5 py-1 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold transition-colors">
                ★ All Great Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED / TRENDING GREAT DEALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <TrendingDown className="w-4 h-4" />
              <span>Verified Market Bargains</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Great Deals
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Priced at least 10% below average market price for identical year, make, model & mileage.
            </p>
          </div>
          <Link
            href="/cars?dealRating=great"
            className="hidden sm:flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-hover transition-colors"
          >
            <span>View all great deals</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {greatDeals.map((car: any) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>

      {/* HOW DEAL RATINGS WORK SHOWCASE */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                <Award className="w-3.5 h-3.5" />
                <span>The TrueGear Advantage</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-snug">
                How our algorithm grades every single car deal
              </h2>
              <p className="text-slate-600 mt-4 leading-relaxed text-sm">
                Unlike traditional classified sites that just show asking prices, TrueGear compares each listing against identical vehicles in the market (matching make, model, year within ±1, and mileage within ±15%).
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    10%+
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Great Deal</h4>
                    <p className="text-xs text-slate-500">
                      Priced &gt; 10% below market average. Top value, high probability of selling quickly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ±10%
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Fair Deal</h4>
                    <p className="text-xs text-slate-500">
                      Priced within ±10% of true market rate. Standard fair dealer pricing.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    +10%
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">High Price</h4>
                    <p className="text-xs text-slate-500">
                      Priced &gt; 10% above market average. Room for negotiation or rare enthusiast spec.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/cars"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-md transition-all"
                >
                  <span>Explore Market Analysis</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Interactive Gauge Preview */}
            <div>
              <PriceGauge
                price={21900}
                avgMarketPrice={25500}
                diffAmount={3600}
                diffPercent={14.1}
                rating="GREAT"
                comparableCount={6}
              />
            </div>
          </div>
        </div>
      </section>

      {/* BROWSE BY BODY TYPE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Browse by Body Style
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Find the right vehicle configuration for your lifestyle and family needs.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {bodyTypes.map((item) => (
            <Link
              key={item.name}
              href={`/cars?bodyType=${item.name}`}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 text-left flex flex-col"
            >
              <div className="h-32 w-full overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-sm">
                    {item.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.count}+ Available
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-primary group-hover:text-white transition-colors text-slate-600">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ALL RECENT INVENTORY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Latest Additions to TrueGear
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Freshly listed vehicles from certified dealers and private owners.
            </p>
          </div>
          <Link
            href="/cars"
            className="text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1 group"
          >
            <span>Browse All {totalCarsCount}+ Cars</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCars.slice(4, 8).map((car: any) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>

      {/* DEALER & PRIVATE SELLER CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-2xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800"
          style={{
            background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
          }}
        >
          {/* Subtle ambient glow in corner */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-xl relative z-10">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/60 mb-3">
              For Dealers & Private Owners
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white">
              Ready to sell or list inventory on TrueGear?
            </h3>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Connect with high-intent car buyers, receive instant qualified buyer leads, and showcase your transparent deal ratings to speed up your sales.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 relative z-10 w-full sm:w-auto">
            <Link
              href="/sell"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg transition-all text-center flex items-center justify-center gap-2"
            >
              List A Car (Private Seller)
            </Link>
            <Link
              href="/dealer"
              className="px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all text-center flex items-center justify-center gap-2"
            >
              Dealer Portal Access
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
