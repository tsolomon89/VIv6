
import { PageTemplate } from '../types';

export const OBLIO_PAGE_TEMPLATE: PageTemplate = {
    schemaVersion: 1,
    id: 'oblio-home',
    name: 'Oblio App',
    pageContext: { kind: 'detail' }, 
    pageSubject: { target: 'brand', cardinality: 'one' }, 
    
    sections: [
        {
            schemaVersion: 1,
            id: 'oblio-hero',
            placement: { slot: 'start' },
            binding: { kind: 'self' },
            presentationKey: 'self.hero.v1',
            overrides: { 
                height: { value: 1600, endValue: null, isLinked: false },
                className: "bg-[#050510]" // Dark navy
            } 
        },
        {
            schemaVersion: 1,
            id: 'oblio-solutions',
            placement: { slot: 'free', order: 1 },
            binding: { kind: 'related', target: 'solution', cardinality: 'many' },
            presentationKey: 'related.solution.many.grid.v1',
            overrides: { 
                height: { value: 2400, endValue: null, isLinked: false },
                className: "bg-[#f5f5f0]" // Cream
            } 
        },
        {
            schemaVersion: 1,
            id: 'oblio-features',
            placement: { slot: 'free', order: 2 },
            binding: { kind: 'related', target: 'feature', cardinality: 'many' },
            presentationKey: 'related.feature.many.grid.v1',
            overrides: { 
                height: { value: 2000, endValue: null, isLinked: false },
                className: "bg-white"
            } 
        },
        {
            schemaVersion: 1,
            id: 'oblio-products',
            placement: { slot: 'free', order: 3 },
            binding: { kind: 'related', target: 'product', cardinality: 'many' },
            presentationKey: 'related.product.many.marquee.v1',
             overrides: { 
                height: { value: 1800, endValue: null, isLinked: false },
                className: "bg-[#f5f5f0]"
            } 
        },
        {
            schemaVersion: 1,
            id: 'oblio-usecases',
            placement: { slot: 'free', order: 4 },
            binding: { kind: 'related', target: 'useCase', cardinality: 'many' },
            presentationKey: 'related.useCase.many.grid.v1',
            overrides: { 
                height: { value: 1600, endValue: null, isLinked: false },
                className: "bg-[#050510]"
            } 
        },
        {
            schemaVersion: 1,
            id: 'oblio-cta',
            placement: { slot: 'end' },
            binding: { kind: 'self' },
            presentationKey: 'self.cta.v1',
            overrides: { 
                height: { value: 1200, endValue: null, isLinked: false },
                className: "bg-[#050510]"
            } 
        }
    ]
};
