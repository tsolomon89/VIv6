import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Entity } from '../lib/api';

interface BrandContextType {
  brands: Entity[];
  activeBrandId: string | null;
  setActiveBrandId: (id: string) => void;
  isLoading: boolean;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brands, setBrands] = useState<Entity[]>([]);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBrands() {
      try {
        const allBrands = await api.listEntities('brand');
        setBrands(allBrands);
        
        // Auto-select first brand if none selected or if saved one is invalid
        const saved = localStorage.getItem('vi_active_brand');
        if (saved && allBrands.find(b => b.id === saved)) {
          setActiveBrandId(saved);
        } else if (allBrands.length > 0) {
          setActiveBrandId(allBrands[0].id);
        }
      } catch (err) {
        console.error("Failed to load brands", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBrands();
  }, []);

  const setBrand = (id: string) => {
    setActiveBrandId(id);
    localStorage.setItem('vi_active_brand', id);
  };

  return (
    <BrandContext.Provider value={{ brands, activeBrandId, setActiveBrandId: setBrand, isLoading }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}
