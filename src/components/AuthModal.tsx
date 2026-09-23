'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, Building, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authMode, setAuthMode, login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'BUYER' | 'DEALER'>('BUYER');
  const [dealerName, setDealerName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (authMode === 'login') {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Failed to sign in');
      }
    } else {
      const res = await register({
        name,
        email,
        password,
        role,
        dealerName: role === 'DEALER' ? dealerName : undefined,
        phone,
      });
      if (!res.success) {
        setError(res.error || 'Failed to create account');
      }
    }
    setSubmitting(false);
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setError(null);
    setSubmitting(true);
    const res = await login(demoEmail, 'password123');
    if (!res.success) {
      setError(res.error || 'Failed to log into demo account');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white text-center">
          <div className="flex justify-center mb-3">
            <img
              src="/images/logo-white.png"
              alt="TrueGear"
              className="h-12 w-auto object-contain drop-shadow-md"
            />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">
            {authMode === 'login' ? 'Welcome Back to TrueGear' : 'Join TrueGear Today'}
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            {authMode === 'login'
              ? 'Sign in to access your saved favorites, price alerts, and dealer messages.'
              : 'Discover verified car deals, compare specs, and connect with top sellers.'}
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex bg-white/10 p-1 rounded-xl mt-5">
            <button
              onClick={() => { setAuthMode('login'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                authMode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('register'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                authMode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <>
                {/* Account Type Selection */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('BUYER')}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        role === 'BUYER'
                          ? 'border-primary bg-primary/5 text-primary font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <User className="w-4 h-4 mb-1" />
                      <div>Car Shopper</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('DEALER')}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        role === 'DEALER'
                          ? 'border-primary bg-primary/5 text-primary font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Building className="w-4 h-4 mb-1" />
                      <div>Dealer / Seller</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {role === 'DEALER' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Dealership Name</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={dealerName}
                        onChange={(e) => setDealerName(e.target.value)}
                        placeholder="Apex Auto Group"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create My Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins for immediate pairs/testing */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick 1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('buyer@truegear.com')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors text-center"
              >
                Demo Buyer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('sales@lonestarmotors.com')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors text-center"
              >
                Demo Dealer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@truegear.com')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors text-center"
              >
                Demo Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
