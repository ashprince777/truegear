'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ChevronLeft, ChevronRight, Gauge, Fuel, MapPin, Star, Layers } from 'lucide-react';
import { formatPrice, formatMileage, calculateMonthlyPayment } from '@/lib/utils';
import { DealRatingBadge } from './DealRatingBadge';
import { useCompare } from '@/context/CompareContext';
import { useAuth } from '@/context/AuthContext';

export interface CarListing {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  bodyType: string;
  mileage: number;
  price: number;
  vin: string;
  description?: string;
  location?: string | null;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
  fuelType: string;
  transmission: string;
  drivetrain: string;
  condition: string;
  images: { id: string; url: string; order: number }[];
  seller?: {
    id?: string;
    name: string;
    dealerName?: string | null;
    dealerRating?: number | null;
    dealerCity?: string | null;
    dealerState?: string | null;
  };
  dealRating: {
    rating: 'GREAT' | 'FAIR' | 'HIGH';
    label: string;
    avgMarketPrice: number;
    diffAmount: number;
    diffPercent: number;
    comparableCount: number;
    description: string;
  };
}

interface CarCardProps {
  car: CarListing;
  initialFavorited?: boolean;
  onFavoriteChange?: (isFav: boolean) => void;
  layout?: 'grid' | 'list';
}

export function CarCard({
  car,
  initialFavorited = false,
  onFavoriteChange,
  layout = 'grid',
}: CarCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isFavLoading, setIsFavLoading] = useState(false);
  const { addToCompare, isInCompare } = useCompare();
  const { user, openAuthModal } = useAuth();

  const images = car.images?.length > 0 ? car.images : [
    { id: '1', url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop&q=80', order: 0 }
  ];

  const currentImage = images[activeImageIndex]?.url || images[0].url;
  const fallbackUrl = 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop&q=80';
  const [imgSrc, setImgSrc] = useState(currentImage);

  React.useEffect(() => {
    setImgSrc(currentImage);
  }, [currentImage]);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openAuthModal('login');
      return;
    }

    try {
      setIsFavLoading(true);
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: car.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsFavorited(data.isFavorite);
        if (onFavoriteChange) onFavoriteChange(data.isFavorite);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFavLoading(false);
    }
  };

  const monthlyEst = calculateMonthlyPayment(car.price);
  const inCompare = isInCompare(car.id);

  if (layout === 'list') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row group">
        {/* Image Section */}
        <div className="relative w-full md:w-80 h-56 shrink-0 bg-slate-100 overflow-hidden">
          <Link href={`/cars/${car.id}`} className="block w-full h-full">
            <img
              src={imgSrc || fallbackUrl}
              alt={`${car.year} ${car.make} ${car.model}`}
              onError={() => {
                setImgSrc(fallbackUrl);
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Deal rating badge */}
          <div className="absolute top-3 left-3 z-10">
            <DealRatingBadge
              rating={car.dealRating.rating}
              label={car.dealRating.label}
              diffAmount={car.dealRating.diffAmount}
              size="sm"
            />
          </div>

          {/* Favorite button */}
          <button
            onClick={toggleFavorite}
            disabled={isFavLoading}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
              isFavorited
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
            }`}
            title="Save to favorites"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>

          {/* Image carousel arrows */}
          {images.length > 1 && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Photo count */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
            {activeImageIndex + 1}/{images.length}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {car.condition} • {car.bodyType}
                </span>
                <Link href={`/cars/${car.id}`}>
                  <h3 className="text-lg font-bold text-slate-900 hover:text-primary transition-colors">
                    {car.year} {car.make} {car.model} {car.trim}
                  </h3>
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">VIN: {car.vin}</p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-extrabold text-slate-900 block">
                  {formatPrice(car.price)}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  est. ${monthlyEst}/mo
                </span>
              </div>
            </div>

            {/* Specs row */}
            <div className="grid grid-cols-3 gap-2 mt-4 py-3 border-y border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-slate-400" />
                <span>{formatMileage(car.mileage)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Fuel className="w-4 h-4 text-slate-400" />
                <span>{car.fuelType}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{car.city}, {car.state}</span>
              </div>
            </div>
          </div>

          {/* Footer of Card */}
          <div className="flex items-center justify-between mt-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">
                {car.seller?.dealerName || car.seller?.name || 'Verified Seller'}
              </span>
              {car.seller?.dealerRating && (
                <div className="flex items-center text-amber-500 font-bold gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{car.seller.dealerRating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  addToCompare({
                    id: car.id,
                    make: car.make,
                    model: car.model,
                    year: car.year,
                    trim: car.trim,
                    price: car.price,
                    mileage: car.mileage,
                    bodyType: car.bodyType,
                    fuelType: car.fuelType,
                    transmission: car.transmission,
                    drivetrain: car.drivetrain,
                    imageUrl: currentImage,
                    dealRating: car.dealRating,
                  });
                }}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                  inCompare
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{inCompare ? 'Compared' : 'Compare'}</span>
              </button>

              <Link
                href={`/cars/${car.id}`}
                className="inline-flex items-center justify-center text-xs font-bold px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid Layout
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group">
      {/* Image container */}
      <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
        <Link href={`/cars/${car.id}`} className="block w-full h-full">
          <img
            src={imgSrc || fallbackUrl}
            alt={`${car.year} ${car.make} ${car.model}`}
            onError={() => {
              setImgSrc(fallbackUrl);
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Deal badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <DealRatingBadge
            rating={car.dealRating.rating}
            label={car.dealRating.label}
            diffAmount={car.dealRating.diffAmount}
            size="sm"
          />
        </div>

        {/* Favorite button */}
        <button
          onClick={toggleFavorite}
          disabled={isFavLoading}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isFavorited
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
          }`}
          title="Save to favorites"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Image carousel arrows */}
        {images.length > 1 && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
          {activeImageIndex + 1}/{images.length}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>{car.condition}</span>
            <span>{car.drivetrain}</span>
          </div>

          <Link href={`/cars/${car.id}`}>
            <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
              {car.year} {car.make} {car.model}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-1 mb-2">
              {car.trim || car.bodyType}
            </p>
          </Link>

          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xl font-extrabold text-slate-900">
                {formatPrice(car.price)}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              est. ${monthlyEst}/mo
            </span>
          </div>

          {/* Quick specs */}
          <div className="grid grid-cols-2 gap-2 py-2.5 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{formatMileage(car.mileage)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{car.city}, {car.state}</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
          <button
            onClick={() =>
              addToCompare({
                id: car.id,
                make: car.make,
                model: car.model,
                year: car.year,
                trim: car.trim,
                price: car.price,
                mileage: car.mileage,
                bodyType: car.bodyType,
                fuelType: car.fuelType,
                transmission: car.transmission,
                drivetrain: car.drivetrain,
                imageUrl: currentImage,
                dealRating: car.dealRating,
              })
            }
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded transition-colors ${
              inCompare
                ? 'bg-blue-100 text-blue-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{inCompare ? 'Added' : 'Compare'}</span>
          </button>

          <Link
            href={`/cars/${car.id}`}
            className="text-xs font-bold text-primary hover:text-primary-hover hover:underline"
          >
            Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
