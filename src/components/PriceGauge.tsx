'use client';

import React from 'react';
import { formatPrice } from '@/lib/utils';

interface PriceGaugeProps {
  price: number;
  avgMarketPrice: number;
  diffAmount: number;
  diffPercent: number;
  rating: 'GREAT' | 'FAIR' | 'HIGH';
  comparableCount: number;
}

export function PriceGauge({
  price,
  avgMarketPrice,
  diffAmount,
  diffPercent,
  rating,
  comparableCount,
}: PriceGaugeProps) {
  // Compute percentage position along the gauge [Great Deal (< -10%) -> Fair Deal (+- 10%) -> High Price (> +10%)]
  // Let range span from -25% to +25%
  const clampedPercent = Math.max(-25, Math.min(25, -diffPercent)); // negative diffAmount is above market
  // map [-25, 25] to [5%, 95%]
  const pinPosition = Math.round(((clampedPercent + 25) / 50) * 100);

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            TrueGear Market Deal Analysis
          </h4>
          <p className="text-xs text-slate-500">
            Based on {comparableCount} comparable listings in the market
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block">Market Average</span>
          <span className="text-base font-bold text-slate-800">
            {formatPrice(avgMarketPrice)}
          </span>
        </div>
      </div>

      {/* Visual Spectrum Bar */}
      <div className="relative mt-6 mb-8">
        <div className="h-3 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 relative shadow-inner flex overflow-hidden">
          {/* Subtle separators */}
          <div className="w-1/3 border-r border-white/40 h-full" />
          <div className="w-1/3 border-r border-white/40 h-full" />
          <div className="w-1/3 h-full" />
        </div>

        {/* Needle Pin */}
        <div
          className="absolute -top-3.5 transform -translate-x-1/2 flex flex-col items-center transition-all duration-500"
          style={{ left: `${pinPosition}%` }}
        >
          <div className="bg-slate-900 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap">
            {formatPrice(price)}
          </div>
          <div className="w-2.5 h-2.5 bg-slate-900 transform rotate-45 -mt-1" />
        </div>
      </div>

      {/* Labels below bar */}
      <div className="grid grid-cols-3 text-center text-xs font-semibold text-slate-600 border-t border-slate-100 pt-3">
        <div className="text-left">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
          <span className="text-emerald-700">Great Deal</span>
          <span className="block text-[10px] text-slate-400 font-normal">
            &gt; 10% below avg
          </span>
        </div>
        <div className="text-center">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1.5" />
          <span className="text-amber-700">Fair Deal</span>
          <span className="block text-[10px] text-slate-400 font-normal">
            Market rate (±10%)
          </span>
        </div>
        <div className="text-right">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1.5" />
          <span className="text-rose-700">High Price</span>
          <span className="block text-[10px] text-slate-400 font-normal">
            &gt; 10% above avg
          </span>
        </div>
      </div>

      {/* Verdict summary */}
      <div className="mt-4 bg-slate-50 rounded-lg p-3 text-xs flex items-center justify-between border border-slate-200/60">
        <span className="text-slate-600 font-medium">Pricing Verdict:</span>
        <span
          className={`font-bold ${
            rating === 'GREAT'
              ? 'text-emerald-700'
              : rating === 'FAIR'
              ? 'text-amber-700'
              : 'text-rose-700'
          }`}
        >
          {diffAmount > 0
            ? `${formatPrice(diffAmount)} below market average (${Math.abs(diffPercent)}%)`
            : diffAmount < 0
            ? `${formatPrice(Math.abs(diffAmount))} above market average (${Math.abs(diffPercent)}%)`
            : 'Exact match with market average'}
        </span>
      </div>
    </div>
  );
}
