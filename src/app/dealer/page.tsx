'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building,
  PlusCircle,
  Car,
  Eye,
  MessageSquare,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle,
  Upload,
  X,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, formatMileage } from '@/lib/utils';
import { DealRatingBadge } from '@/components/DealRatingBadge';

export default function DealerPortalPage() {
  const { user, openAuthModal } = useAuth();

  const [listings, setListings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalActive: 0,
    totalViews: 0,
    totalInquiries: 0,
    totalInventoryValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'leads'>('inventory');

  // Add Listing Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Listing Form State
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('Camry');
  const [year, setYear] = useState('2022');
  const [trim, setTrim] = useState('SE');
  const [bodyType, setBodyType] = useState('Sedan');
  const [price, setPrice] = useState('23500');
  const [mileage, setMileage] = useState('28000');
  const [vin, setVin] = useState('');
  const [fuelType, setFuelType] = useState('Gasoline');
  const [transmission, setTransmission] = useState('Automatic');
  const [drivetrain, setDrivetrain] = useState('FWD');
  const [city, setCity] = useState('Dallas');
  const [state, setState] = useState('TX');
  const [zip, setZip] = useState('75201');
  const [description, setDescription] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&auto=format&fit=crop&q=80',
  ]);

  const loadDealerData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dealer/listings');
      const data = await res.json();
      if (res.ok) {
        setListings(data.listings || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDealerData();
    }
  }, [user]);

  // Handle local photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingPhotos(true);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.urls) {
        setUploadedImages((prev) => [...prev, ...data.urls]);
      }
    } catch (err) {
      console.error('Upload error', err);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const generatedVin = vin || `1TG${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const res = await fetch('/api/dealer/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make,
          model,
          year: parseInt(year),
          trim,
          bodyType,
          price: parseFloat(price),
          mileage: parseInt(mileage),
          vin: generatedVin,
          fuelType,
          transmission,
          drivetrain,
          city,
          state,
          zip,
          description: description || `Clean ${year} ${make} ${model} ${trim}. Excellent mechanical condition with complete service records.`,
          images: uploadedImages,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        loadDealerData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to create listing');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (listingId: string, newStatus: string) => {
    try {
      await fetch('/api/dealer/listings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: listingId, status: newStatus }),
      });
      loadDealerData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await fetch(`/api/dealer/listings?id=${listingId}`, { method: 'DELETE' });
      loadDealerData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-md">
        <Building className="w-12 h-12 text-primary mx-auto mb-3" />
        <h2 className="text-xl font-black text-slate-900">Dealer Portal Sign In</h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          Sign into your dealer or seller account to manage your vehicle inventory and view customer leads.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Gather all leads from all dealer listings
  const allLeads = listings.flatMap((l) =>
    (l.inquiries || []).map((lead: any) => ({ ...lead, carInfo: `${l.year} ${l.make} ${l.model}`, listingId: l.id }))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dealer Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Building className="w-4 h-4" />
            <span>Dealership Inventory Manager</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {user.dealerName || user.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {user.email} • Verified Seller Dashboard
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Vehicle</span>
        </button>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Inventory</span>
            <Car className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalActive}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {stats.totalListings} total vehicles
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Customer Leads</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{allLeads.length}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            Buyer test drive inquiries
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Views</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalViews}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Vehicle detail page visits</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Inventory Value</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatPrice(stats.totalInventoryValue)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active vehicle total</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'inventory' ? 'text-primary' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Vehicle Inventory ({listings.length})</span>
          {activeTab === 'inventory' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'leads' ? 'text-primary' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Customer Leads ({allLeads.length})</span>
          {activeTab === 'leads' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Tab 1: Vehicle Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {listings.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Car className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold">No vehicles currently listed in your inventory.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg"
              >
                Post Your First Car
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Vehicle</th>
                    <th className="p-4">VIN</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Deal Rating</th>
                    <th className="p-4">Views / Leads</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listings.map((car) => {
                    const primaryImg = car.images?.[0]?.url || 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=300';
                    return (
                      <tr key={car.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={primaryImg}
                            alt={car.make}
                            className="w-16 h-12 object-cover rounded-lg shrink-0 bg-slate-100"
                          />
                          <div>
                            <Link
                              href={`/cars/${car.id}`}
                              className="font-bold text-slate-900 hover:text-primary transition-colors text-sm block"
                            >
                              {car.year} {car.make} {car.model}
                            </Link>
                            <span className="text-slate-400 text-[11px]">
                              {car.trim || car.bodyType} • {formatMileage(car.mileage)}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 font-mono text-slate-600">{car.vin}</td>

                        <td className="p-4 font-extrabold text-sm text-slate-900">
                          {formatPrice(car.price)}
                        </td>

                        <td className="p-4">
                          <DealRatingBadge
                            rating={car.dealRating.rating}
                            label={car.dealRating.label}
                            size="sm"
                          />
                        </td>

                        <td className="p-4 text-slate-600">
                          <span className="font-bold text-slate-900">{car.views}</span> views /{' '}
                          <span className="font-bold text-emerald-600">{car._count?.inquiries || 0}</span> leads
                        </td>

                        <td className="p-4">
                          <select
                            value={car.status}
                            onChange={(e) => handleUpdateStatus(car.id, e.target.value)}
                            className={`text-xs font-bold rounded-md px-2 py-1 border outline-none ${
                              car.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : car.status === 'PENDING'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="PENDING">PENDING</option>
                            <option value="SOLD">SOLD</option>
                          </select>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/cars/${car.id}`}
                              className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                              title="View listing"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteListing(car.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Customer Leads */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          {allLeads.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold">No buyer inquiry leads received yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Leads sent from your vehicle detail pages will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allLeads.map((lead: any) => (
                <div
                  key={lead.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{lead.buyerName}</h4>
                        <p className="text-xs text-slate-500">{lead.buyerEmail} • {lead.buyerPhone || 'No phone'}</p>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                        {lead.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg mb-3">
                      <p className="text-[10px] text-slate-400 font-semibold mb-1">
                        Vehicle Inquired: <strong className="text-slate-800">{lead.carInfo}</strong>
                      </p>
                      "{lead.message}"
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
                    <span>Received on {new Date(lead.createdAt).toLocaleDateString()}</span>
                    <a
                      href={`mailto:${lead.buyerEmail}?subject=Regarding your TrueGear inquiry on ${lead.carInfo}`}
                      className="font-bold text-primary hover:underline"
                    >
                      Email Buyer &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* POST NEW LISTING MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8 border border-slate-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1">List A Vehicle</h3>
            <p className="text-xs text-slate-500 mb-6">
              Fill in the vehicle specifications. Our algorithm will immediately evaluate and calculate its TrueGear Market Deal Rating.
            </p>

            <form onSubmit={handleCreateListing} className="space-y-4 text-xs">
              {/* Row 1: Make, Model, Year */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Make</label>
                  <select
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Toyota">Toyota</option>
                    <option value="Honda">Honda</option>
                    <option value="Ford">Ford</option>
                    <option value="Tesla">Tesla</option>
                    <option value="BMW">BMW</option>
                    <option value="Porsche">Porsche</option>
                    <option value="Jeep">Jeep</option>
                    <option value="Chevrolet">Chevrolet</option>
                    <option value="Mercedes-Benz">Mercedes-Benz</option>
                    <option value="Hyundai">Hyundai</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Model</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Camry, F-150, Model 3..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Year</label>
                  <input
                    type="number"
                    required
                    min="1995"
                    max="2026"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Row 2: Trim, Body Style, Fuel */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Trim</label>
                  <input
                    type="text"
                    value={trim}
                    onChange={(e) => setTrim(e.target.value)}
                    placeholder="SE, XLE, Lariat, M Sport..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Body Style</label>
                  <select
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Truck">Truck</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Wagon">Wagon</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Gasoline">Gasoline</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                    <option value="Diesel">Diesel</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Price, Mileage, VIN */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Asking Price ($)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="25000"
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mileage</label>
                  <input
                    type="number"
                    required
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    placeholder="24000"
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">VIN (Optional/Auto)</label>
                  <input
                    type="text"
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    placeholder="17-character VIN"
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary font-mono uppercase"
                  />
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800">Vehicle Photos</span>
                  <label className="cursor-pointer px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    <span>{uploadingPhotos ? 'Uploading...' : 'Upload Photos'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Photo Previews */}
                <div className="flex gap-2 overflow-x-auto pt-2">
                  {uploadedImages.map((url, idx) => (
                    <div key={idx} className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200 group">
                      <img src={url} alt="upload" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setUploadedImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-0.5 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Vehicle Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail condition, maintenance records, packages, and notable options..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{submitting ? 'Publishing...' : 'Publish Vehicle to Marketplace'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
