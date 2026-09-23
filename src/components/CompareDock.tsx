'use client';

import React from 'react';
import Link from 'next/link';
import { X, Layers, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
import { formatPrice } from '@/lib/utils';
import { DealRatingBadge } from './DealRatingBadge';

export function CompareDock() {
  const { compareList, removeFromCompare, clearCompare, isDockOpen, setIsDockOpen } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-2xl transition-all duration-300">
      {/* Dock Bar Header */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Vehicle Comparison
              <span className="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {compareList.length}/4
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              {compareList.length < 2
                ? 'Select at least 1 more car to compare specs side by side'
                : 'Ready to compare side by side'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={clearCompare}
            className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={() => setIsDockOpen(!isDockOpen)}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
          >
            {isDockOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>

          <Link
            href="/compare"
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-xs ${
              compareList.length >= 2
                ? 'bg-primary hover:bg-primary-hover text-white shadow-primary/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none'
            }`}
          >
            Compare Now ({compareList.length})
          </Link>
        </div>
      </div>

      {/* Expanded items tray */}
      {isDockOpen && (
        <div className="bg-slate-50 border-t border-slate-200/80 px-4 py-3">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
            {compareList.map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-lg p-2.5 border border-slate-200 flex items-center gap-3 relative group shadow-xs"
              >
                <button
                  onClick={() => removeFromCompare(car.id)}
                  className="absolute -top-1.5 -right-1.5 bg-slate-800 text-white rounded-full p-1 opacity-80 hover:opacity-100 shadow-sm"
                  title="Remove from comparison"
                >
                  <X className="w-3 h-3" />
                </button>

                {car.imageUrl && (
                  <img
                    src={car.imageUrl}
                    alt={`${car.year} ${car.make}`}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=200';
                    }}
                    className="w-14 h-12 rounded object-cover shrink-0"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-slate-900 truncate">
                    {car.year} {car.make} {car.model}
                  </h5>
                  <span className="text-xs font-extrabold text-primary block">
                    {formatPrice(car.price)}
                  </span>
                  {car.dealRating && (
                    <div className="mt-0.5">
                      <DealRatingBadge
                        rating={car.dealRating.rating}
                        label={car.dealRating.label}
                        size="sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Empty slots placeholders */}
            {Array.from({ length: 4 - compareList.length }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="border-2 border-dashed border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center text-center text-slate-400"
              >
                <Layers className="w-4 h-4 mb-1 stroke-1" />
                <span className="text-[11px] font-medium">+ Add another car</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
