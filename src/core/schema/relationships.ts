
import { EntityType } from './definitions';

export interface RelationshipRule {
    source: EntityType;
    target: EntityType;
    type: string;     // The verb (e.g., 'offers', 'uses')
    inverse: string;  // The inverse verb (e.g., 'supported_by', 'used_by')
    cardinality: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export const RELATIONSHIP_RULES: RelationshipRule[] = [
    // Brand Relationships
    { source: 'brand', target: 'product', type: 'offers', inverse: 'offered_by', cardinality: 'one-to-many' },
    { source: 'brand', target: 'solution', type: 'provides', inverse: 'provided_by', cardinality: 'one-to-many' },
    { source: 'brand', target: 'useCase', type: 'showcases', inverse: 'showcased_by', cardinality: 'one-to-many' },

    // Product Relationships
    { source: 'product', target: 'feature', type: 'includes', inverse: 'included_in', cardinality: 'many-to-many' },
    { source: 'product', target: 'solution', type: 'enables', inverse: 'enabled_by', cardinality: 'many-to-many' },
    
    // Feature Relationships
    { source: 'feature', target: 'useCase', type: 'demonstrated_in', inverse: 'demonstrates', cardinality: 'many-to-many' },
    { source: 'feature', target: 'solution', type: 'powers', inverse: 'powered_by', cardinality: 'many-to-many' },

    // Solution Relationships
    { source: 'solution', target: 'useCase', type: 'solves_for', inverse: 'solved_by', cardinality: 'one-to-many' },
    { source: 'solution', target: 'persona', type: 'targets', inverse: 'targeted_by', cardinality: 'many-to-many' },
];

export function getValidRelationships(sourceType: EntityType) {
    return RELATIONSHIP_RULES.filter(r => r.source === sourceType);
}
