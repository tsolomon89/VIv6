import { z } from 'zod';
import { EntityData } from '../types.js';

// ============================================================================
// SCHEMAS
// ============================================================================

export const FieldSchema = z.object({
  name: z.string(),
  inputType: z.enum(['text', 'textarea', 'number', 'currency', 'date', 'select', 'multiselect', 'image', 'url', 'richtext', 'boolean']),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
});

export const FieldGroupSchema = z.object({
  name: z.string(),
  fields: z.array(FieldSchema),
});

export const EntityDataSchema = z.object({
  fieldGroups: z.array(FieldGroupSchema).default([]),
});

// ============================================================================
// HELPERS
// ============================================================================

export interface FieldGroup {
  name: string;
  fields: z.infer<typeof FieldSchema>[];
}

/**
 * Normalizes input data into strict EntityData structure.
 * Converts simple key-value pairs into a "Default" field group if structured data is missing.
 */
export function normalizeEntityData(
  simpleData?: Record<string, unknown>, 
  explicitFieldGroups?: FieldGroup[]
): EntityData {
  const result: EntityData = {
    fieldGroups: explicitFieldGroups || []
  };

  // Convert simple key-value data to a "Default" field group
  if (simpleData && Object.keys(simpleData).length > 0) {
    const defaultFields = Object.entries(simpleData).map(([key, value]) => ({
      name: key,
      inputType: 'text' as const, // Default to text, AI can recognize this limitation
      value: value as string | number | boolean | null,
    }));

    // Check if Default group already exists
    const groups = result.fieldGroups as FieldGroup[];
    const existingDefault = groups.find((g) => g.name === 'Default');
    if (existingDefault) {
      existingDefault.fields.push(...defaultFields);
    } else {
      result.fieldGroups.push({
        name: 'Default',
        fields: defaultFields
      });
    }
  }

  // Final validation pass (strips unknown keys if we used parse, but here we construct)
  return result;
}

/**
 * Validates any object against the strict EntityData schema.
 * Throws if invalid.
 */
export function validateEntityData(data: unknown): EntityData {
  return EntityDataSchema.parse(data);
}
