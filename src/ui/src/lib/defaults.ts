import type { FieldGroup } from './api';
import { CANONICAL_SCHEMA } from '../../../core/schema-defaults';

// This is a UI-side mirror of src/core/schema-defaults.ts
// We import the canonical schema to ensure consistency.

export const ENTITY_FIELD_GROUPS: Record<string, FieldGroup[]> = CANONICAL_SCHEMA as unknown as Record<string, FieldGroup[]>;

/**
 * Get default field groups for an entity type.
 * Returns the canonical schema for the type, or an empty array if not defined.
 */
export function getDefaultFieldGroups(entityType: string): FieldGroup[] {
    return ENTITY_FIELD_GROUPS[entityType] || [];
}
