'use client';

import React, { useState } from 'react';
import { Calculator, DollarSign } from 'lucide-react';
import { formatPrice, calculateMonthlyPayment } from '@/lib/utils';

interface MonthlyPaymentCalculatorProps {
  vehiclePrice: number;
}

export function MonthlyPaymentCalculator({ vehiclePrice }: MonthlyPaymentCalculatorProps) {
  const [downPayment, setDownPayment] = useState(Math.round(vehiclePrice * 0.1));
  const [interestRate, setInterestRate] = useState(6.49);
  const [termMonths, setTermMonths] = useState(60);

  const monthly = calculateMonthlyPayment(vehiclePrice, downPayment, interestRate, termMonths);
  const loanPrincipal = Math.max(0, vehiclePrice - downPayment);
  const totalLoanCost = monthly * termMonths;
  const totalInterest = Math.max(0, totalLoanCost - loanPrincipal);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-blue-50 text-primary">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Estimated Monthly Payment</h3>
          <p className="text-xs text-slate-500">Customize loan terms for your budget</p>
        </div>
      </div>

      {/* Main Monthly Figure */}
      <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100 mb-5">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
          Estimated Payment
        </span>
        <div className="text-3xl font-black text-primary mt-0.5">
          ${monthly.toLocaleString()}
          <span className="text-sm font-medium text-slate-500"> /mo</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {termMonths} months @ {interestRate}% APR • {formatPrice(downPayment)} down
        </p>
      </div>

      <div className="space-y-4 text-xs">
        {/* Down payment slider */}
        <div>
          <div className="flex justify-between font-semibold text-slate-700 mb-1">
            <span>Down Payment</span>
            <span className="font-bold text-slate-900">{formatPrice(downPayment)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={Math.min(vehiclePrice, 30000)}
            step="500"
            value={downPayment}
            onChange={(e) => setDownPayment(parseInt(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        {/* Loan Term buttons */}
        <div>
          <span className="font-semibold text-slate-700 block mb-1.5">Loan Term</span>
          <div className="grid grid-cols-4 gap-2">
            {[36, 48, 60, 72].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setTermMonths(term)}
                className={`py-1.5 rounded-lg font-bold border transition-colors ${
                  termMonths === term
                    ? 'border-primary bg-primary text-white'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {term} mo
              </button>
            ))}
          </div>
        </div>

        {/* Interest rate slider */}
        <div>
          <div className="flex justify-between font-semibold text-slate-700 mb-1">
            <span>Estimated APR</span>
            <span className="font-bold text-slate-900">{interestRate.toFixed(2)}%</span>
          </div>
          <input
            type="range"
            min="1.99"
            max="14.99"
            step="0.25"
            value={interestRate}
            onChange={(e) => setInterestRate(parseFloat(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        {/* Breakdown Summary */}
        <div className="border-t border-slate-100 pt-3 space-y-1 text-slate-500">
          <div className="flex justify-between">
            <span>Vehicle Price:</span>
            <span className="font-semibold text-slate-800">{formatPrice(vehiclePrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Financed:</span>
            <span className="font-semibold text-slate-800">{formatPrice(loanPrincipal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Interest Paid:</span>
            <span className="font-semibold text-slate-800">{formatPrice(totalInterest)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
