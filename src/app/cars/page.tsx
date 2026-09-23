'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Filter,
  SlidersHorizontal,
  MapPin,
  Grid,
  List,
  Map as MapIcon,
  BookmarkPlus,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  Check,
} from 'lucide-react';
import { CarCard, CarListing } from '@/components/CarCard';
import { useAuth } from '@/context/AuthContext';

// Dynamic import for Leaflet map to avoid window undefined in Next.js SSR
const CarsMap = dynamic(() => import('@/components/CarsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[650px] bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
      Loading interactive map...
    </div>
  ),
});

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, openAuthModal } = useAuth();

  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state initialized from URL search params
  const [make, setMake] = useState(searchParams.get('make') || '');
  const [model, setModel] = useState(searchParams.get('model') || '');
  const [bodyType, setBodyType] = useState(searchParams.get('bodyType') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [maxMileage, setMaxMileage] = useState(searchParams.get('maxMileage') || '');
  const [dealRating, setDealRating] = useState(searchParams.get('dealRating') || '');
  const [fuelType, setFuelType] = useState(searchParams.get('fuelType') || '');
  const [transmission, setTransmission] = useState(searchParams.get('transmission') || '');
  const [drivetrain, setDrivetrain] = useState(searchParams.get('drivetrain') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'best_deal');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');

  // UI state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [saveSearchSuccess, setSaveSearchSuccess] = useState(false);
  const [isSavingSearch, setIsSavingSearch] = useState(false);

  // Available Makes for filter
  const makesList = [
    'Toyota',
    'Honda',
    'Ford',
    'Tesla',
    'BMW',
    'Porsche',
    'Jeep',
    'Chevrolet',
    'Mercedes-Benz',
    'Hyundai',
    'Subaru',
    'Audi',
    'Mazda',
    'Kia',
    'Lexus',
    'Nissan',
    'Volkswagen',
    'Volvo',
  ];

  const bodyStylesList = ['SUV', 'Sedan', 'Truck', 'Coupe', 'Convertible', 'Hatchback', 'Wagon'];

  // Fetch listings on filter change
  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (make) params.set('make', make);
      if (model) params.set('model', model);
      if (bodyType) params.set('bodyType', bodyType);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (maxMileage) params.set('maxMileage', maxMileage);
      if (dealRating) params.set('dealRating', dealRating);
      if (fuelType) params.set('fuelType', fuelType);
      if (transmission) params.set('transmission', transmission);
      if (drivetrain) params.set('drivetrain', drivetrain);
      if (condition) params.set('condition', condition);
      if (sort) params.set('sort', sort);
      if (keyword) params.set('q', keyword);
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setListings(data.listings || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to load listings', err);
    } finally {
      setLoading(false);
    }
  };

  // Synchronize state when URL searchParams change
  useEffect(() => {
    setMake(searchParams.get('make') || '');
    setModel(searchParams.get('model') || '');
    setBodyType(searchParams.get('bodyType') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setMaxMileage(searchParams.get('maxMileage') || '');
    setDealRating(searchParams.get('dealRating') || '');
    setFuelType(searchParams.get('fuelType') || '');
    setTransmission(searchParams.get('transmission') || '');
    setDrivetrain(searchParams.get('drivetrain') || '');
    setCondition(searchParams.get('condition') || '');
    setSort(searchParams.get('sort') || 'best_deal');
    setPage(parseInt(searchParams.get('page') || '1'));
    setKeyword(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    fetchListings();
  }, [make, model, bodyType, minPrice, maxPrice, maxMileage, dealRating, fuelType, transmission, drivetrain, condition, sort, page, keyword]);

  const clearAllFilters = () => {
    setMake('');
    setModel('');
    setBodyType('');
    setMinPrice('');
    setMaxPrice('');
    setMaxMileage('');
    setDealRating('');
    setFuelType('');
    setTransmission('');
    setDrivetrain('');
    setCondition('');
    setKeyword('');
    setPage(1);
    router.push('/cars');
  };

  const handleSaveSearch = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    try {
      setIsSavingSearch(true);
      const activeFilters = {
        make: make || undefined,
        bodyType: bodyType || undefined,
        maxPrice: maxPrice || undefined,
        maxMileage: maxMileage || undefined,
        dealRating: dealRating || undefined,
      };

      const name = `${make || 'All'} ${bodyType || 'Cars'} ${maxPrice ? `under $${parseInt(maxPrice).toLocaleString()}` : ''} ${dealRating ? `(${dealRating.toUpperCase()} DEALS)` : ''}`.trim();

      const res = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, filters: activeFilters }),
      });

      if (res.ok) {
        setSaveSearchSuccess(true);
        setTimeout(() => setSaveSearchSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSearch(false);
    }
  };

  const hasActiveFilters = Boolean(
    make || model || bodyType || minPrice || maxPrice || maxMileage || dealRating || fuelType || transmission || drivetrain || condition || keyword
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner / Breadcrumb & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {make ? `${make} ` : ''}{bodyType ? `${bodyType}s ` : 'Used Cars '}for Sale
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing <span className="font-bold text-slate-900">{totalCount}</span> verified listings with algorithmic deal ratings
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Save Search Button */}
          <button
            onClick={handleSaveSearch}
            disabled={isSavingSearch}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border transition-colors ${
              saveSearchSuccess
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {saveSearchSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Search Saved!</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4 text-primary" />
                <span>Save Search</span>
              </>
            )}
          </button>

          {/* Layout Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                layoutMode === 'grid' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                layoutMode === 'list' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('map')}
              className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs font-semibold ${
                layoutMode === 'map' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Map View"
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="best_deal">Sort: Best Deals First (Highest Savings)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="mileage_asc">Mileage: Lowest First</option>
            <option value="year_desc">Year: Newest First</option>
            <option value="newest">Listing Date: Fresh</option>
          </select>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden p-2 rounded-lg bg-primary text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <span className="text-xs font-semibold text-slate-400">Active Filters:</span>
          {make && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium">
              Make: {make}
              <button onClick={() => setMake('')}><X className="w-3 h-3 hover:text-blue-900" /></button>
            </span>
          )}
          {bodyType && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium">
              Body: {bodyType}
              <button onClick={() => setBodyType('')}><X className="w-3 h-3 hover:text-blue-900" /></button>
            </span>
          )}
          {dealRating && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase">
              ★ {dealRating} Deal
              <button onClick={() => setDealRating('')}><X className="w-3 h-3 hover:text-emerald-900" /></button>
            </span>
          )}
          {maxPrice && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-medium">
              &lt; ${parseInt(maxPrice).toLocaleString()}
              <button onClick={() => setMaxPrice('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {maxMileage && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-medium">
              &lt; {parseInt(maxMileage).toLocaleString()} mi
              <button onClick={() => setMaxMileage('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {drivetrain && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium">
              Drive: {drivetrain}
              <button onClick={() => setDrivetrain('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {condition && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium">
              {condition}
              <button onClick={() => setCondition('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {keyword && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-medium">
              Keyword: &quot;{keyword}&quot;
              <button onClick={() => setKeyword('')}><X className="w-3 h-3 hover:text-indigo-900" /></button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 ml-2"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* Main Grid: Sidebar + Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
        {/* Left Filter Sidebar */}
        <aside
          className={`lg:block ${
            mobileFilterOpen
              ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto block'
              : 'hidden'
          } lg:relative lg:inset-auto lg:z-auto lg:p-0`}
        >
          {mobileFilterOpen && (
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4 lg:hidden">
              <h3 className="font-bold text-base text-slate-900">Filter Vehicles</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-md text-slate-500">
                <X className="w-6 h-6" />
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span>Filters</span>
              </span>
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="text-xs text-primary hover:underline font-semibold">
                  Clear All
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                Keyword / Model
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Camry, AWD, Sunroof..."
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Deal Rating Filter */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
                Deal Rating
              </label>
              <div className="space-y-1.5">
                <button
                  onClick={() => { setDealRating(dealRating === 'great' ? '' : 'great'); setPage(1); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                    dealRating === 'great'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Great Deal (&gt; 10% below)
                  </span>
                  {dealRating === 'great' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>

                <button
                  onClick={() => { setDealRating(dealRating === 'fair' ? '' : 'fair'); setPage(1); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                    dealRating === 'fair'
                      ? 'bg-amber-50 border-amber-400 text-amber-800'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    Fair Deal (Market rate)
                  </span>
                  {dealRating === 'fair' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>

                <button
                  onClick={() => { setDealRating(dealRating === 'high' ? '' : 'high'); setPage(1); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                    dealRating === 'high'
                      ? 'bg-rose-50 border-rose-400 text-rose-800'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    High Price (Above market)
                  </span>
                  {dealRating === 'high' && <Check className="w-3.5 h-3.5 text-rose-600" />}
                </button>
              </div>
            </div>

            {/* Make */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                Make
              </label>
              <select
                value={make}
                onChange={(e) => {
                  setMake(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Makes</option>
                {makesList.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Body Style */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                Body Style
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {bodyStylesList.map((style) => (
                  <button
                    key={style}
                    onClick={() => {
                      setBodyType(bodyType === style ? '' : style);
                      setPage(1);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition-colors ${
                      bodyType === style
                        ? 'bg-primary text-white border-primary'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                <span>Max Price</span>
                <span className="font-extrabold text-primary">
                  {maxPrice ? `$${parseInt(maxPrice).toLocaleString()}` : 'No Limit'}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="120000"
                step="2500"
                value={maxPrice || 120000}
                onChange={(e) => {
                  setMaxPrice(e.target.value === '120000' ? '' : e.target.value);
                  setPage(1);
                }}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Max Mileage */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                <span>Max Mileage</span>
                <span className="font-extrabold text-primary">
                  {maxMileage ? `${parseInt(maxMileage).toLocaleString()} mi` : 'Any'}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="5000"
                value={maxMileage || 100000}
                onChange={(e) => {
                  setMaxMileage(e.target.value === '100000' ? '' : e.target.value);
                  setPage(1);
                }}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Fuel Type */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                Fuel Type
              </label>
              <select
                value={fuelType}
                onChange={(e) => { setFuelType(e.target.value); setPage(1); }}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Fuel Types</option>
                <option value="Gasoline">Gasoline</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Plug-in Hybrid">Plug-in Hybrid (PHEV)</option>
                <option value="Electric">Electric (EV)</option>
                <option value="Diesel">Diesel</option>
              </select>
            </div>

            {/* Transmission */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                Transmission
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setTransmission(transmission === 'Automatic' ? '' : 'Automatic'); setPage(1); }}
                  className={`py-1.5 text-xs font-semibold rounded-lg border text-center transition-colors ${
                    transmission === 'Automatic' ? 'bg-primary text-white border-primary' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Automatic
                </button>
                <button
                  onClick={() => { setTransmission(transmission === 'Manual' ? '' : 'Manual'); setPage(1); }}
                  className={`py-1.5 text-xs font-semibold rounded-lg border text-center transition-colors ${
                    transmission === 'Manual' ? 'bg-primary text-white border-primary' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>

            {/* Drivetrain */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                Drivetrain
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['AWD', 'FWD', 'RWD', '4WD'].map((dt) => (
                  <button
                    key={dt}
                    onClick={() => { setDrivetrain(drivetrain === dt ? '' : dt); setPage(1); }}
                    className={`py-1.5 text-xs font-semibold rounded-lg border text-center transition-colors ${
                      drivetrain === dt ? 'bg-primary text-white border-primary' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {dt}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                Condition
              </label>
              <div className="space-y-1.5">
                {['Used', 'Certified Pre-Owned'].map((cond) => (
                  <button
                    key={cond}
                    onClick={() => { setCondition(condition === cond ? '' : cond); setPage(1); }}
                    className={`w-full py-1.5 px-3 text-xs font-semibold rounded-lg border text-left flex items-center justify-between transition-colors ${
                      condition === cond ? 'bg-primary text-white border-primary' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cond}</span>
                    {condition === cond && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {mobileFilterOpen && (
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-primary text-white font-bold rounded-lg text-sm"
              >
                Show {totalCount} Results
              </button>
            )}
          </div>
        </aside>

        {/* Right Content Column: Listings Grid / List / Map */}
        <div className="lg:col-span-3 space-y-5">
          {/* Prominent Search Bar */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search make, model, trim, body style, or location (e.g. Camry, SUV, AWD, Dallas)..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-slate-800 placeholder:text-slate-400"
              />
              {keyword && (
                <button
                  onClick={() => {
                    setKeyword('');
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-80 border border-slate-200 overflow-hidden">
                  <div className="bg-slate-200 h-44 w-full" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-5 bg-slate-200 rounded w-1/3 pt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No matching vehicles found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try loosening your filter parameters or resetting price and mileage sliders.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : layoutMode === 'map' ? (
            /* MAP VIEW */
            <div className="space-y-4">
              <CarsMap cars={listings} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {listings.slice(0, 3).map((car) => (
                  <CarCard key={car.id} car={car} layout="grid" />
                ))}
              </div>
            </div>
          ) : layoutMode === 'list' ? (
            /* LIST VIEW */
            <div className="space-y-4">
              {listings.map((car) => (
                <CarCard key={car.id} car={car} layout="list" />
              ))}
            </div>
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((car) => (
                <CarCard key={car.id} car={car} layout="grid" />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-700"
              >
                &larr; Previous
              </button>
              <span className="text-xs font-semibold text-slate-600 px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-700"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CarsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
