'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Heart,
  Layers,
  Share2,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  ShieldCheck,
  Star,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Send,
  Sparkles,
} from 'lucide-react';
import { formatPrice, formatMileage } from '@/lib/utils';
import { DealRatingBadge } from '@/components/DealRatingBadge';
import { PriceGauge } from '@/components/PriceGauge';
import { MonthlyPaymentCalculator } from '@/components/MonthlyPaymentCalculator';
import { CarCard, CarListing } from '@/components/CarCard';
import { useCompare } from '@/context/CompareContext';
import { useAuth } from '@/context/AuthContext';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user, openAuthModal } = useAuth();
  const { addToCompare, isInCompare } = useCompare();

  const [car, setCar] = useState<CarListing | any>(null);
  const [similarListings, setSimilarListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Inquiry modal state
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryName, setInquiryName] = useState(user?.name || '');
  const [inquiryEmail, setInquiryEmail] = useState(user?.email || '');
  const [inquiryPhone, setInquiryPhone] = useState(user?.phone || '');
  const [inquiryMessage, setInquiryMessage] = useState(
    'Hi, I saw this vehicle on TrueGear and would like to confirm availability and schedule a test drive.'
  );
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquirySending, setInquirySending] = useState(false);

  useEffect(() => {
    if (user) {
      if (!inquiryName) setInquiryName(user.name);
      if (!inquiryEmail) setInquiryEmail(user.email);
      if (!inquiryPhone && user.phone) setInquiryPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    async function loadCar() {
      try {
        setLoading(true);
        const res = await fetch(`/api/listings/${id}`);
        const data = await res.json();
        if (res.ok) {
          setCar(data.listing);
          setSimilarListings(data.similarListings || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadCar();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto mb-4" />
        <div className="h-96 bg-slate-200 rounded-2xl max-w-4xl mx-auto mb-6" />
        <p className="text-sm">Loading vehicle data & market analysis...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Vehicle Not Found</h2>
        <p className="text-slate-500 text-sm mt-2">
          This listing may have been sold or removed.
        </p>
        <Link
          href="/cars"
          className="mt-5 inline-block px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-lg"
        >
          Back to Search
        </Link>
      </div>
    );
  }

  const images = car.images?.length > 0 ? car.images : [
    { id: '1', url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&auto=format&fit=crop&q=80', order: 0 }
  ];

  const currentImage = images[activeImageIndex]?.url || images[0].url;

  const toggleFavorite = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: car.id }),
      });
      const data = await res.json();
      if (res.ok) setIsFavorited(data.isFavorite);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySending(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: car.id,
          buyerName: inquiryName,
          buyerEmail: inquiryEmail,
          buyerPhone: inquiryPhone,
          message: inquiryMessage,
        }),
      });

      // Also send message to dealer inbox if user is signed in
      if (user && car.seller?.id) {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toUserId: car.seller.id,
            listingId: car.id,
            body: inquiryMessage,
          }),
        });
      }

      if (res.ok) {
        setInquirySubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInquirySending(false);
    }
  };

  // Parse features JSON
  let featuresList: string[] = [];
  try {
    featuresList = car.features ? JSON.parse(car.features) : [];
  } catch {
    featuresList = [];
  }

  const inCompare = isInCompare(car.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/cars" className="hover:text-primary transition-colors">Used Cars</Link>
        <span>/</span>
        <Link href={`/cars?make=${car.make}`} className="hover:text-primary transition-colors">{car.make}</Link>
        <span>/</span>
        <Link href={`/cars?make=${car.make}&model=${car.model}`} className="hover:text-primary transition-colors">{car.model}</Link>
        <span>/</span>
        <span className="text-slate-900 truncate">{car.year} {car.trim}</span>
      </div>

      {/* Main Hero Header: Title, Price, Deal Rating */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <DealRatingBadge
              rating={car.dealRating.rating}
              label={car.dealRating.label}
              diffAmount={car.dealRating.diffAmount}
              size="md"
              showDetails={true}
            />
            <span className="text-xs text-slate-500 font-semibold">• {car.condition}</span>
            <span className="text-xs text-slate-500 font-semibold">• VIN: {car.vin}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {car.year} {car.make} {car.model} <span className="font-semibold text-slate-600">{car.trim}</span>
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2 font-medium">
            <span className="flex items-center gap-1.5"><Gauge className="w-4 h-4 text-slate-400" /> {formatMileage(car.mileage)}</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {car.city}, {car.state}</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Fuel className="w-4 h-4 text-slate-400" /> {car.fuelType}</span>
          </div>
        </div>

        {/* Pricing & Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3">
          <div>
            <span className="text-3xl sm:text-4xl font-black text-slate-900 block lg:text-right">
              {formatPrice(car.price)}
            </span>
            <span className="text-xs text-slate-500 block lg:text-right font-medium">
              est. ${Math.round(car.price / 60)}/mo for 60 mos
            </span>
          </div>

          <div className="flex items-center gap-2.5 mt-1">
            <button
              onClick={toggleFavorite}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                isFavorited
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              <span>{isFavorited ? 'Saved' : 'Save Car'}</span>
            </button>

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
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                inCompare
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{inCompare ? 'Compared' : 'Add to Compare'}</span>
            </button>

            <button
              onClick={() => setInquiryModalOpen(true)}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Dealer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Photo Gallery, Deal Rating Breakdown, Specs, Description, Similar */}
        <div className="lg:col-span-2 space-y-8">
          {/* PHOTO GALLERY */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="relative h-[380px] sm:h-[480px] bg-slate-900 group">
              <img
                src={currentImage}
                alt={`${car.year} ${car.make} ${car.model}`}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&auto=format&fit=crop&q=80';
                }}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setLightboxOpen(true)}
              />

              {/* Lightbox full-size trigger */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                title="View Fullscreen Lightbox"
              >
                <Maximize2 className="w-5 h-5" />
              </button>

              {/* Prev / Next buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Photo counter */}
              <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
                Photo {activeImageIndex + 1} of {images.length}
              </div>
            </div>

            {/* Thumbnail Filmstrip */}
            {images.length > 1 && (
              <div className="p-3 bg-slate-50 flex gap-2 overflow-x-auto border-t border-slate-100">
                {images.map((img: any, idx: number) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt="thumbnail"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DEAL RATING MARKET BREAKDOWN GAUGE */}
          <PriceGauge
            price={car.price}
            avgMarketPrice={car.dealRating.avgMarketPrice}
            diffAmount={car.dealRating.diffAmount}
            diffPercent={car.dealRating.diffPercent}
            rating={car.dealRating.rating}
            comparableCount={car.dealRating.comparableCount}
          />

          {/* KEY SPECS GRID */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Vehicle Specifications</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-slate-400 block font-medium">Mileage</span>
                <span className="font-bold text-slate-900 text-sm">{formatMileage(car.mileage)}</span>
              </div>
              <div className="border-b border-slate-100 pb-2">
                <span className="text-slate-400 block font-medium">Engine</span>
                <span className="font-bold text-slate-900 text-sm">{car.engine || 'Standard'}</span>
              </div>
              <div className="border-b border-slate-100 pb-2">
                <span className="text-slate-400 block font-medium">Transmission</span>
                <span className="font-bold text-slate-900 text-sm">{car.transmission}</span>
              </div>
              <div className="border-b border-slate-100 pb-2">
                <span className="text-slate-400 block font-medium">Drivetrain</span>
                <span className="font-bold text-slate-900 text-sm">{car.drivetrain}</span>
              </div>
              <div className="border-b border-slate-100 pb-2">
                <span className="text-slate-400 block font-medium">Fuel Type</span>
                <span className="font-bold text-slate-900 text-sm">{car.fuelType}</span>
              </div>
              <div className="border-b border-slate-100 pb-2">
                <span className="text-slate-400 block font-medium">Exterior Color</span>
                <span className="font-bold text-slate-900 text-sm">{car.exteriorColor || 'Standard'}</span>
              </div>
              <div className="border-b border-slate-100 pb-2">
                <span className="text-slate-400 block font-medium">Interior Color</span>
                <span className="font-bold text-slate-900 text-sm">{car.interiorColor || 'Standard'}</span>
              </div>
              <div className="border-b border-slate-100 pb-2">
                <span className="text-slate-400 block font-medium">Body Style</span>
                <span className="font-bold text-slate-900 text-sm">{car.bodyType}</span>
              </div>
              <div className="border-b border-slate-100 pb-2">
                <span className="text-slate-400 block font-medium">VIN</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{car.vin}</span>
              </div>
            </div>
          </div>

          {/* VEHICLE HISTORY & CONDITION REPORT SUMMARY */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Vehicle History Highlights</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="inline-flex p-2 rounded-full bg-emerald-100 text-emerald-700 mb-2">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="font-bold text-base text-slate-900">
                  {car.accidents === 0 ? 'No Accidents' : `${car.accidents} Incident(s)`}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Reported to Carfax / AutoCheck</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="inline-flex p-2 rounded-full bg-blue-100 text-blue-700 mb-2">
                  <Star className="w-5 h-5" />
                </div>
                <div className="font-bold text-base text-slate-900">
                  {car.previousOwners} Owner{car.previousOwners > 1 ? 's' : ''}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Personal lease/ownership</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="inline-flex p-2 rounded-full bg-purple-100 text-purple-700 mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="font-bold text-base text-slate-900">
                  {car.serviceHistory} Service Records
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Regular verified maintenance</p>
              </div>
            </div>
          </div>

          {/* KEY FEATURES */}
          {featuresList.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-lg font-black text-slate-900 mb-3">Key Options & Features</h3>
              <div className="flex flex-wrap gap-2">
                {featuresList.map((feat) => (
                  <span
                    key={feat}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{feat}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SELLER DESCRIPTION */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-lg font-black text-slate-900 mb-3">Seller Notes</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {car.description}
            </p>
          </div>

          {/* SIMILAR LISTINGS */}
          {similarListings.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="text-xl font-black text-slate-900">Similar Vehicles You Might Like</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {similarListings.map((simCar) => (
                  <CarCard key={simCar.id} car={simCar} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 col): Dealer Card, Monthly Payment Calculator, Contact Box */}
        <div className="space-y-6">
          {/* SELLER / DEALER CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                {car.seller?.avatar ? (
                  <img src={car.seller.avatar} alt="dealer" className="w-full h-full object-cover" />
                ) : (
                  car.seller?.dealerName?.charAt(0) || car.seller?.name?.charAt(0) || 'D'
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  {car.seller?.dealerName || car.seller?.name || 'Verified Dealer'}
                </h4>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-0.5">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{car.seller?.dealerRating?.toFixed(1) || '4.8'}</span>
                  <span className="text-slate-400 font-normal ml-1">Dealer Rating</span>
                </div>
              </div>
            </div>

            <div className="py-4 space-y-2 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{car.city}, {car.state} {car.zip}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{car.seller?.phone || '(555) 019-2831'}</span>
              </p>
              <p className="flex items-center gap-2 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified TrueGear Partner</span>
              </p>
            </div>

            <button
              onClick={() => setInquiryModalOpen(true)}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Seller / Request Info</span>
            </button>
          </div>

          {/* MONTHLY PAYMENT CALCULATOR */}
          <MonthlyPaymentCalculator vehiclePrice={car.price} />
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4">
          <div className="flex justify-between items-center text-white pb-2">
            <span className="text-sm font-semibold">
              {car.year} {car.make} {car.model} ({activeImageIndex + 1}/{images.length})
            </span>
            <button onClick={() => setLightboxOpen(false)} className="p-2 text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center relative">
            <img
              src={currentImage}
              alt="Fullscreen"
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-4 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-4 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>

          <div className="text-center text-xs text-slate-400 pt-2">
            Press ESC or click close to return
          </div>
        </div>
      )}

      {/* CONTACT SELLER MODAL */}
      {inquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => { setInquiryModalOpen(false); setInquirySubmitted(false); }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            {inquirySubmitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Message Sent to Dealer!</h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  {car.seller?.dealerName || 'The seller'} has received your inquiry for the {car.year} {car.make} {car.model} and will contact you via email or phone shortly.
                </p>
                <button
                  onClick={() => { setInquiryModalOpen(false); setInquirySubmitted(false); }}
                  className="mt-4 px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-1">
                  Contact {car.seller?.dealerName || car.seller?.name || 'Seller'}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Inquiring about: <strong className="text-slate-800">{car.year} {car.make} {car.model} {car.trim}</strong> ({formatPrice(car.price)})
                </p>

                <form onSubmit={handleInquirySubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Phone (Optional)</label>
                      <input
                        type="tel"
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        placeholder="(555) 000-0000"
                        className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Message</label>
                    <textarea
                      rows={3}
                      required
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={inquirySending}
                    className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{inquirySending ? 'Sending Inquiry...' : 'Send Message to Dealer'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
