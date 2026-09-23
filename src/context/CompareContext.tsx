'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CompareCar {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  price: number;
  mileage: number;
  bodyType: string;
  fuelType?: string;
  transmission?: string;
  drivetrain?: string;
  engine?: string | null;
  imageUrl?: string;
  dealRating?: {
    rating: 'GREAT' | 'FAIR' | 'HIGH';
    label: string;
    diffAmount: number;
    diffPercent: number;
  };
}

interface CompareContextType {
  compareList: CompareCar[];
  addToCompare: (car: CompareCar) => void;
  removeFromCompare: (id: string) => void;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
  isDockOpen: boolean;
  setIsDockOpen: (open: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<CompareCar[]>([]);
  const [isDockOpen, setIsDockOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('truegear_compare');
      if (saved) {
        setCompareList(JSON.parse(saved));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('truegear_compare', JSON.stringify(compareList));
    } catch {}
    if (compareList.length > 0) {
      setIsDockOpen(true);
    }
  }, [compareList]);

  const addToCompare = (car: CompareCar) => {
    if (compareList.some((c) => c.id === car.id)) {
      removeFromCompare(car.id);
      return;
    }
    if (compareList.length >= 4) {
      alert('You can compare a maximum of 4 vehicles at once.');
      return;
    }
    setCompareList((prev) => [...prev, car]);
  };

  const removeFromCompare = (id: string) => {
    setCompareList((prev) => prev.filter((c) => c.id !== id));
  };

  const isInCompare = (id: string) => {
    return compareList.some((c) => c.id === id);
  };

  const clearCompare = () => {
    setCompareList([]);
    setIsDockOpen(false);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
        isDockOpen,
        setIsDockOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
