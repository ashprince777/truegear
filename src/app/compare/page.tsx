'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  X,
  Plus,
  CheckCircle2,
  DollarSign,
  Gauge,
  Fuel,
  ShieldCheck,
  Star,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
import { formatPrice, formatMileage, calculateMonthlyPayment } from '@/lib/utils';
import { DealRatingBadge } from '@/components/DealRatingBadge';

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [highlightDifferences, setHighlightDifferences] = useState(false);

  if (compareList.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mx-auto mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Compare Vehicles</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          You haven't selected any cars to compare yet. Browse listings and check "Compare" on 2 to 4 cars to see side-by-side specs, prices, and deal ratings.
        </p>
        <Link
          href="/cars"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md transition-colors"
        >
          Browse Inventory &rarr;
        </Link>
      </div>
    );
  }

  // Row helper to check if values are different across vehicles
  const isDifferent = (getter: (car: any) => any) => {
    if (compareList.length < 2) return false;
    const firstVal = getter(compareList[0]);
    return compareList.some((c) => getter(c) !== firstVal);
  };

  const getRowClass = (getter: (car: any) => any) => {
    if (highlightDifferences && isDifferent(getter)) {
      return 'bg-amber-50/70 border-l-4 border-amber-400';
    }
    return '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Side-by-Side Evaluation</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Vehicle Specification Comparison
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Comparing <span className="font-bold text-slate-900">{compareList.length}</span> vehicle{compareList.length > 1 ? 's' : ''} (up to 4 allowed)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              checked={highlightDifferences}
              onChange={(e) => setHighlightDifferences(e.target.checked)}
              className="accent-primary rounded cursor-pointer"
            />
            <span>Highlight Differences</span>
          </label>

          <button
            onClick={clearCompare}
            className="text-xs text-rose-600 hover:text-rose-800 font-bold px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors"
          >
            Clear All
          </button>

          {compareList.length < 4 && (
            <Link
              href="/cars"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </Link>
          )}
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-xs">
        <table className="w-full text-left border-collapse min-w-[700px]">
          {/* Header Row: Vehicle Cards */}
          <thead>
            <tr className="border-b border-slate-200">
              <th className="p-4 w-44 bg-slate-50/70 font-bold text-xs text-slate-500 uppercase tracking-wider align-top">
                Vehicle Overview
              </th>
              {compareList.map((car) => (
                <th key={car.id} className="p-4 align-top min-w-[220px]">
                  <div className="relative bg-slate-50 rounded-xl p-3 border border-slate-200 group">
                    <button
                      onClick={() => removeFromCompare(car.id)}
                      className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1 shadow hover:bg-rose-600 transition-colors"
                      title="Remove vehicle"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div className="h-32 rounded-lg overflow-hidden bg-slate-200 mb-3">
                      <img
                        src={car.imageUrl || 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600'}
                        alt={car.make}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600';
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <Link href={`/cars/${car.id}`} className="hover:text-primary transition-colors">
                      <h3 className="text-sm font-black text-slate-900 line-clamp-1">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate mb-1">
                        {car.trim || car.bodyType}
                      </p>
                    </Link>

                    <div className="text-lg font-black text-slate-900">
                      {formatPrice(car.price)}
                    </div>
                    <span className="text-[10px] text-slate-400 block mb-2">
                      est. ${calculateMonthlyPayment(car.price)}/mo
                    </span>

                    <Link
                      href={`/cars/${car.id}`}
                      className="block text-center py-1.5 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors"
                    >
                      View Full Details
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {/* Deal Rating */}
            <tr className={getRowClass((c) => c.dealRating?.rating)}>
              <td className="p-4 font-bold text-slate-600 bg-slate-50/50">Deal Rating</td>
              {compareList.map((car) => (
                <td key={car.id} className="p-4">
                  {car.dealRating ? (
                    <div>
                      <DealRatingBadge
                        rating={car.dealRating.rating}
                        label={car.dealRating.label}
                        size="sm"
                      />
                      <span className="block text-[11px] text-slate-500 mt-1 font-medium">
                        {car.dealRating.diffAmount > 0
                          ? `$${Math.round(car.dealRating.diffAmount).toLocaleString()} under avg`
                          : `$${Math.abs(Math.round(car.dealRating.diffAmount)).toLocaleString()} over avg`}
                      </span>
                    </div>
                  ) : (
                    'N/A'
                  )}
                </td>
              ))}
            </tr>

            {/* Price */}
            <tr className={getRowClass((c) => c.price)}>
              <td className="p-4 font-bold text-slate-600 bg-slate-50/50">Price</td>
              {compareList.map((car) => (
                <td key={car.id} className="p-4 font-black text-sm text-slate-900">
                  {formatPrice(car.price)}
                </td>
              ))}
            </tr>

            {/* Estimated Monthly Payment */}
            <tr className={getRowClass((c) => Math.round(c.price / 60))}>
              <td className="p-4 font-bold text-slate-600 bg-slate-50/50">Est. Monthly (60 mo)</td>
              {compareList.map((car) => (
                <td key={car.id} className="p-4 font-semibold text-slate-700">
                  ${calculateMonthlyPayment(car.price)} / mo
                </td>
              ))}
            </tr>

            {/* Mileage */}
            <tr className={getRowClass((c) => c.mileage)}>
              <td className="p-4 font-bold text-slate-600 bg-slate-50/50">Mileage</td>
              {compareList.map((car) => (
                <td key={car.id} className="p-4 font-semibold text-slate-800">
                  {formatMileage(car.mileage)}
                </td>
              ))}
            </tr>

            {/* Body Type */}
            <tr className={getRowClass((c) => c.bodyType)}>
              <td className="p-4 font-bold text-slate-600 bg-slate-50/50">Body Style</td>
              {compareList.map((car) => (
                <td key={car.id} className="p-4 text-slate-700">{car.bodyType}</td>
              ))}
            </tr>

            {/* Fuel Type */}
            <tr className={getRowClass((c) => c.fuelType)}>
              <td className="p-4 font-bold text-slate-600 bg-slate-50/50">Fuel Type</td>
              {compareList.map((car) => (
                <td key={car.id} className="p-4 text-slate-700">{car.fuelType || 'Gasoline'}</td>
              ))}
            </tr>

            {/* Transmission */}
            <tr className={getRowClass((c) => c.transmission)}>
              <td className="p-4 font-bold text-slate-600 bg-slate-50/50">Transmission</td>
              {compareList.map((car) => (
                <td key={car.id} className="p-4 text-slate-700">{car.transmission || 'Automatic'}</td>
              ))}
            </tr>

            {/* Drivetrain */}
            <tr className={getRowClass((c) => c.drivetrain)}>
              <td className="p-4 font-bold text-slate-600 bg-slate-50/50">Drivetrain</td>
              {compareList.map((car) => (
                <td key={car.id} className="p-4 text-slate-700">{car.drivetrain || 'FWD'}</td>
              ))}
            </tr>

            {/* Engine */}
            <tr className={getRowClass((c) => c.engine)}>
              <td className="p-4 font-bold text-slate-600 bg-slate-50/50">Engine</td>
              {compareList.map((car) => (
                <td key={car.id} className="p-4 text-slate-700">{car.engine || 'Standard Engine'}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
