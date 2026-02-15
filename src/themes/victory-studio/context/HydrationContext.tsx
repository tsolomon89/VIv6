
import React, { createContext, useContext, useEffect, useState } from 'react';
import { PageTemplate, Binding } from '../../types';

interface HydrationState {
    data: Record<string, any[]>; // Keyed by Binding Key (e.g. "related:product")
    isLoading: boolean;
    error?: string;
}

const HydrationContext = createContext<HydrationState>({
    data: {},
    isLoading: false
});

export const useHydration = () => useContext(HydrationContext);

// Map Templates to Brand Slugs/Domains (from inventory-v2.json)
// We key by Template Name because ID might be a session UUID
const TEMPLATE_BRAND_MAP: Record<string, string> = {
    'Victory Initiative': 'victoryinitiative.com',
    'Oblio App': 'oblio.app',
    'Keimenon Parser': 'keimenon.com'
};

const API_BASE = 'http://localhost:3001/api';

export const HydrationProvider: React.FC<{ template: PageTemplate; children: React.ReactNode }> = ({ template, children }) => {
    const [state, setState] = useState<HydrationState>({
        data: {},
        isLoading: false
    });

    useEffect(() => {
        console.log(`[Hydration] Provider mounted. Template Name: "${template.name}", ID: "${template.id}"`);
        // console.log("Template Object:", JSON.stringify(template, null, 2));

        // Try looking up by Name first, then ID
        const brandDomain = TEMPLATE_BRAND_MAP[template.name] || TEMPLATE_BRAND_MAP[template.id];
        
        if (!brandDomain) {
            console.warn(`[Hydration] MAPPING FAILED for "${template.name}" / "${template.id}"`);
            // No specific brand mapped (e.g. demo-landing), rely on mocks/defaults
            setState(prev => ({ ...prev, isLoading: false, data: {} }));
            return;
        }

        const fetchData = async () => {
            console.log(`[Hydration] Fetching for domain: ${brandDomain}`);
            setState(prev => ({ ...prev, isLoading: true }));
            try {
                // 1. Fetch All Brands to find the target one
                const brandsRes = await fetch(`${API_BASE}/entities?type=brand`);
                if (!brandsRes.ok) throw new Error(`Failed to fetch brands: ${brandsRes.status}`);
                
                const brands = await brandsRes.json();
                console.log(`[Hydration] Found ${brands.length} brands`);
                
                // Find matching brand by domain in data or slug? 
                // Seed script put domain in data.domain or used it for slug.
                const targetBrand = brands.find((b: any) => 
                    b.data?.domain === brandDomain || b.slug?.includes(brandDomain)
                );

                if (!targetBrand) {
                    console.warn(`[Hydration] Brand not found for domain: ${brandDomain}`);
                    setState({ data: {}, isLoading: false });
                    return;
                }

                // 2. Fetch Related Entities for this Brand
                // We'll fetch common types: product, feature, solution, useCase
                const typesToFetch = ['product', 'feature', 'solution', 'useCase'];
                const newData: Record<string, any[]> = {};

                // 2a. Set Self (Brand) Data
                newData['self'] = [targetBrand];

                // 2b. Fetch Related
                await Promise.all(typesToFetch.map(async (type) => {
                    const res = await fetch(`${API_BASE}/entities?type=${type}&brandId=${targetBrand.id}`);
                    const entities = await res.json();
                    
                    // Normalize entities for renderer (flatten data onto root for simpler binding)
                    const normalized = entities.map((e: any) => ({
                        id: e.id,
                        ...e.data, // Flatten generic data
                        name: e.name,
                        description: e.description,
                        // Helper for images if they exist in data
                        textureUrl: e.data?.image || e.data?.textureUrl,
                        // Helper for tiles
                        tileHeading: e.name,
                        tileSubtitle: e.description,
                    }));

                    newData[`related:${type}`] = normalized;
                }));

                console.log(`[Hydration] Loaded data for ${brandDomain}`, newData);
                setState({ data: newData, isLoading: false });

            } catch (e: any) {
                console.error("[Hydration] Error fetching data:", e);
                setState({ data: {}, isLoading: false, error: e.message });
            }
        };

        fetchData();
    }, [template.id]);

    return (
        <HydrationContext.Provider value={state}>
            {children}
        </HydrationContext.Provider>
    );
};
