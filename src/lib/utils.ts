import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatMileage(mileage: number): string {
  return new Intl.NumberFormat('en-US').format(mileage) + ' mi';
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function calculateMonthlyPayment(
  price: number,
  downPayment: number = 2500,
  interestRate: number = 6.5,
  loanTermMonths: number = 60
): number {
  const principal = Math.max(0, price - downPayment);
  if (principal === 0) return 0;
  const monthlyRate = interestRate / 100 / 12;
  if (monthlyRate === 0) return Math.round(principal / loanTermMonths);
  const payment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths))) /
    (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
  return Math.round(payment);
}
