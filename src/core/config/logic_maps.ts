import { ObjectType } from '../types.js';

// --- Relationship type to entity type mapping ---
// Defines the implicit "schema" of how entities relate to each other.
export const RELATIONSHIP_MAP: Record<string, { target: ObjectType; relType: string }> = {
  'has_feature': { target: 'feature', relType: 'has_feature' },
  'solves_with': { target: 'solution', relType: 'solves_with' },
  'used_in': { target: 'useCase', relType: 'used_in' },
  'targets': { target: 'persona', relType: 'targets' },
  'offers': { target: 'product', relType: 'offers' },
};

