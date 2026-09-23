'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { CarListing } from './CarCard';
import 'leaflet/dist/leaflet.css';

interface CarsMapProps {
  cars: CarListing[];
  onSelectCar?: (car: CarListing) => void;
}

export default function CarsMap({ cars, onSelectCar }: CarsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let L: any;

    async function initMap() {
      L = (await import('leaflet')).default;

      // Fix default marker icon assets
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current && mapContainerRef.current) {
        // Initial center
        const defaultLat = cars[0]?.lat || 37.7749;
        const defaultLng = cars[0]?.lng || -122.4194;

        const map = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing markers
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      const markersGroup: any[] = [];

      cars.forEach((car) => {
        if (!car.lat || !car.lng) return;

        // Custom price bubble marker based on Deal Rating
        let colorClass = 'bg-slate-900 border-white text-white';
        if (car.dealRating.rating === 'GREAT') {
          colorClass = 'bg-emerald-600 border-white text-white font-black';
        } else if (car.dealRating.rating === 'FAIR') {
          colorClass = 'bg-amber-500 border-white text-white font-bold';
        } else if (car.dealRating.rating === 'HIGH') {
          colorClass = 'bg-rose-600 border-white text-white font-bold';
        }

        const priceText = `$${Math.round(car.price / 1000)}k`;

        const customIcon = L.divIcon({
          className: 'custom-car-pin',
          html: `
            <div class="${colorClass} px-2 py-1 rounded-full text-xs shadow-lg border-2 flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer whitespace-nowrap">
              <span>${priceText}</span>
            </div>
          `,
          iconSize: [52, 28],
          iconAnchor: [26, 14],
        });

        const marker = L.marker([car.lat, car.lng], { icon: customIcon }).addTo(map);

        const imgUrl = car.images?.[0]?.url || 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400';
        const dealBadgeColor =
          car.dealRating.rating === 'GREAT'
            ? 'background: #ecfdf5; color: #065f46; border: 1px solid #6ee7b7;'
            : car.dealRating.rating === 'FAIR'
            ? 'background: #fffbeb; color: #92400e; border: 1px solid #fcd34d;'
            : 'background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5;';

        const popupHtml = `
          <div style="font-family: inherit; width: 220px; padding: 2px;">
            <div style="height: 120px; overflow: hidden; border-radius: 8px; margin-bottom: 8px;">
              <img src="${imgUrl}" alt="${car.make}" onerror="this.src='https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400';" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-bottom: 4px; ${dealBadgeColor}">
              ${car.dealRating.label}
            </div>
            <h4 style="margin: 0; font-size: 14px; font-weight: bold; color: #0f172a;">
              ${car.year} ${car.make} ${car.model}
            </h4>
            <div style="font-size: 16px; font-weight: 800; color: #0066cc; margin: 4px 0;">
              ${formatPrice(car.price)}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
              ${car.city}, ${car.state} • ${car.mileage.toLocaleString()} mi
            </div>
            <a href="/cars/${car.id}" style="display: block; text-align: center; background: #0066cc; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; text-decoration: none;">
              View Details &rarr;
            </a>
          </div>
        `;

        marker.bindPopup(popupHtml, { maxWidth: 260 });
        markersGroup.push(marker);
      });

      if (markersGroup.length > 0) {
        const group = L.featureGroup(markersGroup);
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }

    initMap();

    return () => {
      // Keep map persistent across component re-renders if possible
    };
  }, [cars]);

  return (
    <div className="relative w-full h-[650px] rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-md px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 shadow-md border border-slate-200 flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          Great Deal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          Fair Deal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
          High Price
        </span>
      </div>
    </div>
  );
}
