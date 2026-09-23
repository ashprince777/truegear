'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Users,
  Car,
  MessageSquare,
  AlertTriangle,
  Check,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';

export default function AdminPage() {
  const { user, openAuthModal } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, totalListings: 0, totalInquiries: 0 });
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        setListings(data.listings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAdminData();
    }
  }, [user]);

  const handleAction = async (listingId: string, action: 'FLAG' | 'ACTIVATE' | 'DELETE') => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, action }),
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-md">
        <Shield className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-black text-slate-900">Admin Access Required</h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          You must be signed in with an Administrator account (e.g. admin@truegear.com).
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" />
          <span>TrueGear Platform Operations</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Moderation Center</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitor platform statistics, review dealer and private listings, and moderate flagged vehicles.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Users</span>
            <div className="text-2xl font-black text-slate-900">{stats.totalUsers}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Listings</span>
            <div className="text-2xl font-black text-slate-900">{stats.totalListings}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inquiries Generated</span>
            <div className="text-2xl font-black text-slate-900">{stats.totalInquiries}</div>
          </div>
        </div>
      </div>

      {/* Listings Moderation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Recent Marketplace Listings</h3>
          <span className="text-xs text-slate-400">{listings.length} listings displayed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4">Car Details</th>
                <th className="p-4">Seller</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listings.map((car) => (
                <tr key={car.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <Link
                      href={`/cars/${car.id}`}
                      className="font-bold text-slate-900 hover:text-primary transition-colors text-sm block"
                    >
                      {car.year} {car.make} {car.model} {car.trim}
                    </Link>
                    <span className="font-mono text-slate-400 text-[11px]">VIN: {car.vin}</span>
                  </td>

                  <td className="p-4 text-slate-700">
                    <span className="font-bold block">{car.seller?.name}</span>
                    <span className="text-[11px] text-slate-400">{car.seller?.email} ({car.seller?.role})</span>
                  </td>

                  <td className="p-4 font-extrabold text-sm text-slate-900">
                    {formatPrice(car.price)}
                  </td>

                  <td className="p-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      car.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : car.status === 'FLAGGED'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {car.status}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {car.status === 'FLAGGED' ? (
                        <button
                          onClick={() => handleAction(car.id, 'ACTIVATE')}
                          className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-bold hover:bg-emerald-200"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(car.id, 'FLAG')}
                          className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded font-bold hover:bg-amber-200"
                        >
                          Flag
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(car.id, 'DELETE')}
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
