'use client';

import React from 'react';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DealRatingBadgeProps {
  rating: 'GREAT' | 'FAIR' | 'HIGH';
  label?: string;
  diffAmount?: number;
  diffPercent?: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function DealRatingBadge({
  rating,
  label,
  diffAmount,
  size = 'md',
  showDetails = false,
}: DealRatingBadgeProps) {
  let config = {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    iconBg: 'bg-emerald-600 text-white',
    icon: ArrowDownRight,
    text: label || 'Great Deal',
    dot: 'bg-emerald-500',
  };

  if (rating === 'FAIR') {
    config = {
      bg: 'bg-amber-50 text-amber-900 border-amber-300',
      iconBg: 'bg-amber-500 text-white',
      icon: CheckCircle2,
      text: label || 'Fair Deal',
      dot: 'bg-amber-500',
    };
  } else if (rating === 'HIGH') {
    config = {
      bg: 'bg-rose-50 text-rose-900 border-rose-300',
      iconBg: 'bg-rose-500 text-white',
      icon: ArrowUpRight,
      text: label || 'High Price',
      dot: 'bg-rose-500',
    };
  }

  const Icon = config.icon;

  if (size === 'sm') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-xs',
          config.bg
        )}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
        {config.text}
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className={cn('inline-flex flex-col p-3 rounded-xl border shadow-sm', config.bg)}>
        <div className="flex items-center gap-2">
          <div className={cn('p-1 rounded-full', config.iconBg)}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-bold text-base">{config.text}</span>
        </div>
        {diffAmount !== undefined && (
          <p className="text-xs mt-1 font-medium opacity-90">
            {diffAmount > 0
              ? `$${Math.round(diffAmount).toLocaleString()} below estimated market`
              : `$${Math.abs(Math.round(diffAmount)).toLocaleString()} above estimated market`}
          </p>
        )}
      </div>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase border shadow-xs',
        config.bg
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.text}</span>
      {showDetails && diffAmount !== undefined && diffAmount > 0 && (
        <span className="ml-1 text-[11px] lowercase opacity-80">
          (-${Math.round(diffAmount).toLocaleString()})
        </span>
      )}
    </span>
  );
}
