import React from 'react';
import Link from 'next/link';
import { Car, ShieldCheck, HelpCircle, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block group py-1">
              <img
                src="/images/logo-white.png"
                alt="TrueGear Smart Car Market"
                className="h-14 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              TrueGear uses deep market algorithmic comparison to compute unbiased Deal Ratings (Great Deal, Fair Deal, High Price) so you never overpay for a car.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Algorithmic Market Accuracy</span>
            </div>
          </div>

          {/* Popular Makes */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Popular Makes</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/cars?make=Toyota" className="hover:text-white transition-colors">Used Toyota</Link></li>
              <li><Link href="/cars?make=Honda" className="hover:text-white transition-colors">Used Honda</Link></li>
              <li><Link href="/cars?make=Ford" className="hover:text-white transition-colors">Used Ford</Link></li>
              <li><Link href="/cars?make=Tesla" className="hover:text-white transition-colors">Used Tesla</Link></li>
              <li><Link href="/cars?make=BMW" className="hover:text-white transition-colors">Used BMW</Link></li>
              <li><Link href="/cars?make=Porsche" className="hover:text-white transition-colors">Used Porsche</Link></li>
            </ul>
          </div>

          {/* Body Styles */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Browse Body Types</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/cars?bodyType=SUV" className="hover:text-white transition-colors">Used SUVs & Crossovers</Link></li>
              <li><Link href="/cars?bodyType=Sedan" className="hover:text-white transition-colors">Used Sedans</Link></li>
              <li><Link href="/cars?bodyType=Truck" className="hover:text-white transition-colors">Used Pickup Trucks</Link></li>
              <li><Link href="/cars?bodyType=Coupe" className="hover:text-white transition-colors">Coupes & Sports Cars</Link></li>
              <li><Link href="/cars?fuelType=Electric" className="hover:text-white transition-colors">Electric Vehicles (EVs)</Link></li>
            </ul>
          </div>

          {/* Sellers & Dealers */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">For Dealers & Sellers</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/sell" className="hover:text-white transition-colors">List Your Car For Free</Link></li>
              <li><Link href="/dealer" className="hover:text-white transition-colors">Dealer Portal & Inventory</Link></li>
              <li><Link href="/compare" className="hover:text-white transition-colors">Vehicle Comparison Tool</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Buyer & Seller Inbox</Link></li>
            </ul>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs">
              <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-500" /> (800) 555-GEAR</p>
              <p className="flex items-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5 text-slate-500" /> support@truegear.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} TrueGear Inc. All rights reserved. Inspired by CarGurus.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
