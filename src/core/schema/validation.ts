import { z } from 'zod';
import { RecordData } from '../types.js';
import {
  normalizeRecordData as normalizeRecordDataHelper,
  FieldGroupInput,
} from '../record_data.js';

// ============================================================================
// SCHEMAS
// ============================================================================

export const FieldSchema = z.object({
  name: z.string(),
  inputType: z.enum(['text', 'textarea', 'number', 'currency', 'date', 'select', 'multiselect', 'image', 'url', 'richtext', 'boolean']),
  cardinality: z.enum(['single', 'multi', 'one', 'many']).optional(),
  isSelectMany: z.boolean().optional(),
  values: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])).default([]),
  value: z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.union([z.string(), z.number(), z.boolean(), z.null()]))]).optional(),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
}).transform((field) => ({
  ...field,
  cardinality:
    field.cardinality === 'one'
      ? 'single'
      : field.cardinality === 'many'
        ? 'multi'
        : field.cardinality ?? (field.isSelectMany ? 'multi' : field.inputType === 'multiselect' ? 'multi' : 'single'),
  values: Array.isArray(field.values) && field.values.length > 0
    ? field.values
    : field.value === undefined
      ? []
      : Array.isArray(field.value)
        ? field.value
        : [field.value],
}));

export const FieldGroupSchema = z.object({
  name: z.string(),
  fields: z.array(FieldSchema),
});

export const RecordDataSchema = z.object({
  fieldGroups: z.array(FieldGroupSchema).default([]),
});

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Normalizes input data into strict RecordData structure.
 * Converts simple key-value pairs into a "Default" field group if structured data is missing.
 */
export function normalizeRecordData(
  simpleData?: Record<string, unknown>, 
  explicitFieldGroups?: FieldGroupInput[]
): RecordData {
  return normalizeRecordDataHelper(simpleData, explicitFieldGroups);
}

/**
 * Validates any object against the strict RecordData schema.
 * Throws if invalid.
 */
export function validateRecordData(data: unknown): RecordData {
  return RecordDataSchema.parse(data);
}
