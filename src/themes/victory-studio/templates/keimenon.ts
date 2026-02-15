
import { PageTemplate } from '../types';

export const KEIMENON_PAGE_TEMPLATE: PageTemplate = {
    schemaVersion: 1,
    id: 'keimenon-home',
    name: 'Keimenon Parser',
    pageContext: { kind: 'detail' }, 
    pageSubject: { target: 'brand', cardinality: 'one' }, 
    
    // Keimenon relies heavily on the "Living Graph" scene.
    // Sections here map to the HTML structure.
    sections: [
        {
            schemaVersion: 1,
            id: 'keimenon-hero',
            placement: { slot: 'start' },
            binding: { kind: 'self' },
            presentationKey: 'self.hero.v1', // Generic for now, implies "Hero" text
            overrides: { 
                height: { value: 1500, endValue: null, isLinked: false },
                className: "bg-black"
                // Ideally we'd set text to "KEIMENON" via data binding to the brand
            } 
        },
        {
            schemaVersion: 1,
            id: 'keimenon-cluster',
            placement: { slot: 'free', order: 1 },
            binding: { kind: 'self' }, // Self because it's a description of the tool
            presentationKey: 'self.feature.v1', // Single Feature presentation? Or just a generic content block
            overrides: { 
                height: { value: 1500, endValue: null, isLinked: false },
                className: "bg-transparent" // Transparent to show graph
            } 
        },
         {
            schemaVersion: 1,
            id: 'keimenon-features',
            placement: { slot: 'free', order: 2 },
            binding: { kind: 'related', target: 'feature', cardinality: 'many' },
            presentationKey: 'related.feature.many.grid.v1',
            overrides: { 
                height: { value: 1800, endValue: null, isLinked: false },
                className: "bg-black/50" // Semi-transparent
            } 
        },
        {
            schemaVersion: 1,
            id: 'keimenon-cta',
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
