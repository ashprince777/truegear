'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Car,
  DollarSign,
  Upload,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';

export default function PrivateSellerPage() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [make, setMake] = useState('Honda');
  const [model, setModel] = useState('Civic');
  const [year, setYear] = useState('2022');
  const [trim, setTrim] = useState('EX');
  const [bodyType, setBodyType] = useState('Sedan');
  const [mileage, setMileage] = useState('22000');
  const [price, setPrice] = useState('23000');
  const [vin, setVin] = useState('');
  const [city, setCity] = useState('Austin');
  const [state, setState] = useState('TX');
  const [zip, setZip] = useState('78701');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=1200&auto=format&fit=crop&q=80');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('register');
      return;
    }

    try {
      setSubmitting(true);
      const generatedVin = vin || `1TG${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const res = await fetch('/api/dealer/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make,
          model,
          year: parseInt(year),
          trim,
          bodyType,
          price: parseFloat(price),
          mileage: parseInt(mileage),
          vin: generatedVin,
          city,
          state,
          zip,
          description: description || `Privately owned ${year} ${make} ${model} ${trim}. Single owner, garage kept, all maintenance done on schedule.`,
          images: [photoUrl],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/cars/${data.listingId}`);
      } else {
        alert(data.error || 'Failed to list car');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Top Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Free Private Seller Listing</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Sell Your Car On TrueGear
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Get maximum value with algorithmic deal rating transparency. Qualified buyers reach out to you directly.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Section 1: Vehicle Info */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" />
              <span>1. Vehicle Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Make</label>
                <select
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Ford">Ford</option>
                  <option value="Tesla">Tesla</option>
                  <option value="BMW">BMW</option>
                  <option value="Porsche">Porsche</option>
                  <option value="Jeep">Jeep</option>
                  <option value="Chevrolet">Chevrolet</option>
                  <option value="Hyundai">Hyundai</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Model</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Civic, Camry, F-150..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Year</label>
                <input
                  type="number"
                  required
                  min="1995"
                  max="2026"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Trim / Submodel</label>
                <input
                  type="text"
                  value={trim}
                  onChange={(e) => setTrim(e.target.value)}
                  placeholder="e.g. EX, Sport, Premium"
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Body Style</label>
                <select
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Truck">Truck</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Hatchback">Hatchback</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Mileage & Asking Price */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>2. Mileage & Asking Price</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Odometer Mileage</label>
                <input
                  type="number"
                  required
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="22000"
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Your Asking Price ($)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="23000"
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="mt-3 p-3 bg-blue-50 rounded-xl flex items-start gap-2.5 text-[11px] text-blue-900">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                Based on your asking price, TrueGear will compute an instant Deal Rating (Great Deal, Fair Deal, or High Price) to help buyers evaluate your listing against comparable cars.
              </span>
            </div>
          </div>

          {/* Section 3: Photo & Location */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-purple-600" />
              <span>3. Photo & Location</span>
            </h3>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ZIP Code</label>
                <input
                  type="text"
                  required
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Vehicle Photo URL</label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Enter image URL (e.g. Unsplash or hosted photo)"
                className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary text-xs"
              />
              {photoUrl && (
                <div className="mt-2 h-36 w-full rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src={photoUrl}
                    alt="preview"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="mt-3">
              <label className="font-semibold text-slate-700 block mb-1">Description / Notes</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention ownership history, condition, regular service records, tires, clean title..."
                className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{submitting ? 'Publishing Vehicle...' : 'Publish Listing On TrueGear'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
