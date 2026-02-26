import { z } from 'zod';

import { ENTITY_TYPES } from '../core/types.js';

// Record Types enum
export const RecordTypeSchema = z.enum(ENTITY_TYPES);

// Field Input Types
export const FieldInputTypeSchema = z.enum([
  'text',
  'textarea',
  'number',
  'currency',
  'date',
  'select',
  'multiselect',
  'image',
  'url',
  'richtext',
  'boolean',
  'ref',
  'Record'  // Canonical reference type (ref is legacy alias)
]);

// Flexible value schema for fields
const FieldValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.string())
]);

// Field Schema
export const FieldSchema = z.object({
  name: z.string().min(1),
  inputType: FieldInputTypeSchema,
  value: FieldValueSchema.optional().nullable(),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional()
});

// Field Group Schema
export const FieldGroupSchema = z.object({
  name: z.string().min(1),
  fields: z.array(FieldSchema)
});

// Strict Record Data Schema
export const RecordDataSchema = z.object({
  fieldGroups: z.array(FieldGroupSchema).default([])
}).passthrough();

// Activity Types
export const ActivityTypeSchema = z.enum(['data', 'asset', 'engagement', 'admin']);

// Opportunity Stages
export const OpportunityStageSchema = z.enum(['mql', 'sql', 'ftp', 'rtp']);

// Record Input Schema (for creation/updates)
export const RecordInputSchema = z.object({
  type: RecordTypeSchema,
  activity_type: ActivityTypeSchema.optional(), // Phase 11: Activation Engine Taxonomy
  opportunity_stage: OpportunityStageSchema.optional(), // Phase 12: Commercial Engine Taxonomy
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be 100 characters or less')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only'),
  name: z.string()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or less'),
  description: z.string().optional(),
  account_id: z.string().uuid().optional(),
  data: RecordDataSchema.optional().default({ fieldGroups: [] }),
});

// Record Update Schema (partial)
export const RecordUpdateSchema = RecordInputSchema.partial();

// Relationship Input Schema
export const RecordRelationshipInputSchema = z.object({
  from_id: z.string().uuid('Invalid from_id'),
  to_id: z.string().uuid('Invalid to_id'),
  type: z.string().min(1, 'Relationship type is required'),
  properties: z.record(z.string(), z.unknown()).optional().default({}),
});

// Query params schema
export const RecordQuerySchema = z.object({
  type: RecordTypeSchema.optional(),
  account_id: z.string().uuid().optional(),
});

// Types
export type DataRecordInput = z.infer<typeof RecordInputSchema>;
export type DataRecordUpdate = z.infer<typeof RecordUpdateSchema>;
export type RecordRelationshipInput = z.infer<typeof RecordRelationshipInputSchema>;
