
import { PageTemplate } from '../types';

export const VICTORY_PAGE_TEMPLATE: PageTemplate = {
    schemaVersion: 1,
    id: 'brand-home',
    name: 'Victory Initiative',
    pageContext: { kind: 'detail' }, 
    pageSubject: { target: 'brand', cardinality: 'one' }, 
    
    sections: [
        {
            schemaVersion: 1,
            id: 'victory-hero',
            placement: { slot: 'start' },
            binding: { kind: 'self' },
            presentationKey: 'self.hero.v1',
            overrides: { 
                height: { value: 1500, endValue: null, isLinked: false },
                className: "bg-[#1A1A1B]"
            } 
        },
        {
            schemaVersion: 1,
            id: 'victory-catalog',
            placement: { slot: 'free', order: 1 },
            binding: { kind: 'related', target: 'product', cardinality: 'many' },
            presentationKey: 'related.product.many.grid.v1',
            overrides: { 
                height: { value: 2400, endValue: null, isLinked: false },
                className: "bg-neutral-900"
            } 
        },
        {
            schemaVersion: 1,
            id: 'victory-features',
            placement: { slot: 'free', order: 2 },
            binding: { kind: 'related', target: 'feature', cardinality: 'many' },
            presentationKey: 'related.feature.many.grid.v1',
            overrides: { 
                height: { value: 1600, endValue: null, isLinked: false },
                className: "bg-black"
            } 
        },
        {
            schemaVersion: 1,
            id: 'victory-cta',
            placement: { slot: 'end' },
            binding: { kind: 'self' },
            presentationKey: 'self.cta.v1',
            overrides: { 
                height: { value: 1200, endValue: null, isLinked: false },
                className: "bg-black"
            } 
        }
    ]
};
