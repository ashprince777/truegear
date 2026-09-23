'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Car,
  Heart,
  Layers,
  MessageSquare,
  User as UserIcon,
  LogOut,
  Shield,
  PlusCircle,
  Menu,
  X,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCompare } from '@/context/CompareContext';

export function Navbar() {
  const pathname = usePathname();
  const { user, openAuthModal, logout } = useAuth();
  const { compareList } = useCompare();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group py-2">
              <img
                src="/images/logo.png"
                alt="TrueGear Smart Car Market"
                className="h-14 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/cars"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname === '/cars'
                    ? 'text-primary bg-primary/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search Used Cars</span>
              </Link>

              <Link
                href="/cars?dealRating=great"
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Great Deals</span>
              </Link>

              <Link
                href="/compare"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 relative ${
                  pathname === '/compare'
                    ? 'text-primary bg-primary/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4 text-slate-400" />
                <span>Compare</span>
                {compareList.length > 0 && (
                  <span className="bg-primary text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full ml-0.5">
                    {compareList.length}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          {/* Right Action Icons & User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dealer/Sell button */}
            <Link
              href={user?.role === 'DEALER' ? '/dealer' : '/sell'}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-primary" />
              <span>{user?.role === 'DEALER' ? 'Dealer Portal' : 'Sell Your Car'}</span>
            </Link>

            {/* Saved favorites link */}
            <Link
              href="/dashboard?tab=favorites"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
              title="Saved Cars"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Messages link */}
            <Link
              href="/dashboard?tab=messages"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
              title="Inquiries & Messages"
            >
              <MessageSquare className="w-5 h-5" />
            </Link>

            {/* User Dropdown / Sign in */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-xs">
                    <p className="font-bold text-slate-900 truncate max-w-[100px]">{user.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">{user.role}</p>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Dashboard</span>
                    </Link>

                    {user.role === 'DEALER' && (
                      <Link
                        href="/dealer"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-primary hover:bg-primary/5 font-bold"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Dealer Inventory</span>
                      </Link>
                    )}

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 font-bold"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Moderation</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-primary hover:bg-primary-hover text-white shadow-xs transition-colors"
                >
                  Join
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            href="/cars"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Search Used Cars
          </Link>
          <Link
            href="/cars?dealRating=great"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            Great Deals
          </Link>
          <Link
            href="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Compare Vehicles ({compareList.length})
          </Link>
          <Link
            href={user?.role === 'DEALER' ? '/dealer' : '/sell'}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-semibold text-primary hover:bg-primary/5"
          >
            {user?.role === 'DEALER' ? 'Dealer Portal' : 'Sell Your Car'}
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                My Dashboard ({user.name})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="flex-1 py-2 text-xs font-bold border border-slate-300 rounded-lg text-slate-700"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('register');
                }}
                className="flex-1 py-2 text-xs font-bold bg-primary text-white rounded-lg"
              >
                Join TrueGear
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
