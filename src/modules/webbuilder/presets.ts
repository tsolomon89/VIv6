/**
 * Presentation Presets Service
 *
 * CRUD operations for managing webbuilder presentation presets.
 * Presets are reusable visual templates for page sections.
 */

import { v4 as uuid } from 'uuid';
import { db } from '../../core/db.js';
import type {
  PresentationPreset,
  PresentationPresetRow,
  BindingSignature,
  SectionVisualConfig,
  Binding,
} from './types.js';
import { deriveSignature, matchesSignature } from './binding.js';

// ============================================================================
// Types
// ============================================================================

export interface PresetInput {
  key: string;
  name: string;
  signature: BindingSignature;
  config: Partial<SectionVisualConfig>;
  accountId?: string;
}

export interface PresetFilter {
  signatureKind?: 'self' | 'related';
  target?: string;
  cardinality?: 'one' | 'many';
  accountId?: string;
}

// ============================================================================
// Row Conversion
// ============================================================================

function rowToPreset(row: PresentationPresetRow): PresentationPreset & { name: string } {
  return {
    key: row.key,
    name: row.name,
    signature: JSON.parse(row.signature) as BindingSignature,
    config: JSON.parse(row.config) as Partial<SectionVisualConfig>,
  };
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Get a preset by its unique key.
 */
export function getPreset(key: string): PresentationPreset | undefined {
  const row = db.prepare(`
    SELECT * FROM presentation_presets WHERE key = ?
  `).get(key) as PresentationPresetRow | undefined;

  if (!row) return undefined;
  return rowToPreset(row);
}

/**
 * Get a preset by ID.
 */
export function getPresetById(id: string): PresentationPreset | undefined {
  const row = db.prepare(`
    SELECT * FROM presentation_presets WHERE id = ?
  `).get(id) as PresentationPresetRow | undefined;

  if (!row) return undefined;
  return rowToPreset(row);
}

/**
 * List all presets, optionally filtered by signature criteria.
 */
export function listPresets(filter?: PresetFilter): PresentationPreset[] {
  let sql = 'SELECT * FROM presentation_presets WHERE 1=1';
  const params: unknown[] = [];

  if (filter?.signatureKind) {
    sql += ` AND json_extract(signature, '$.kind') = ?`;
    params.push(filter.signatureKind);
  }

  if (filter?.target) {
    sql += ` AND json_extract(signature, '$.target') = ?`;
    params.push(filter.target);
  }

  if (filter?.cardinality) {
    sql += ` AND json_extract(signature, '$.cardinality') = ?`;
    params.push(filter.cardinality);
  }

  if (filter?.accountId !== undefined) {
    if (filter.accountId === null) {
      sql += ` AND account_id IS NULL`;
    } else {
      sql += ` AND (account_id = ? OR account_id IS NULL)`;
      params.push(filter.accountId);
    }
  }

  sql += ' ORDER BY key ASC';

  const rows = db.prepare(sql).all(...params) as PresentationPresetRow[];
  return rows.map(rowToPreset);
}

/**
 * List presets compatible with a given binding.
 */
export function listCompatiblePresets(binding: Binding, accountId?: string): PresentationPreset[] {
  const allPresets = listPresets({ accountId });
  return allPresets.filter(preset => matchesSignature(preset, binding));
}

/**
 * Create a new preset.
 */
export function createPreset(input: PresetInput): PresentationPreset {
  const id = uuid();
  const now = new Date().toISOString();
  const signatureJson = JSON.stringify(input.signature);
  const configJson = JSON.stringify(input.config);

  db.prepare(`
    INSERT INTO presentation_presets (id, key, name, signature, config, version, account_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
  `).run(id, input.key, input.name, signatureJson, configJson, input.accountId ?? null, now, now);

  return {
    key: input.key,
    signature: input.signature,
    config: input.config,
  };
}

/**
 * Update an existing preset by key.
 */
export function updatePreset(key: string, updates: Partial<PresetInput>): PresentationPreset | undefined {
  const existing = getPreset(key);
  if (!existing) return undefined;

  const now = new Date().toISOString();
  const setClauses: string[] = ['updated_at = ?'];
  const params: unknown[] = [now];

  if (updates.name !== undefined) {
    setClauses.push('name = ?');
    params.push(updates.name);
  }

  if (updates.signature !== undefined) {
    setClauses.push('signature = ?');
    params.push(JSON.stringify(updates.signature));
  }

  if (updates.config !== undefined) {
    setClauses.push('config = ?');
    params.push(JSON.stringify(updates.config));
  }

  // Increment version
  setClauses.push('version = version + 1');

  params.push(key);

  db.prepare(`
    UPDATE presentation_presets
    SET ${setClauses.join(', ')}
    WHERE key = ?
  `).run(...params);

  return getPreset(key);
}

/**
 * Delete a preset by key.
 */
export function deletePreset(key: string): boolean {
  const result = db.prepare(`
    DELETE FROM presentation_presets WHERE key = ?
  `).run(key);

  return result.changes > 0;
}

/**
 * Clone a preset with a new key.
 */
export function clonePreset(sourceKey: string, newKey: string, accountId?: string): PresentationPreset | undefined {
  const source = getPreset(sourceKey);
  if (!source) return undefined;

  return createPreset({
    key: newKey,
    name: `${source.key} (Clone)`,
    signature: source.signature,
    config: source.config,
    accountId,
  });
}

/**
 * Check if a preset exists.
 */
export function presetExists(key: string): boolean {
  const row = db.prepare(`
    SELECT 1 FROM presentation_presets WHERE key = ? LIMIT 1
  `).get(key);

  return row !== undefined;
}

/**
 * Validate that a preset is compatible with a binding.
 */
export function validatePresetCompatibility(presetKey: string, binding: Binding): boolean {
  const preset = getPreset(presetKey);
  if (!preset) return false;
  return matchesSignature(preset, binding);
}

/**
 * Upsert a preset (create or update).
 * Used for seeding/migration.
 */
export function upsertPreset(input: PresetInput): PresentationPreset {
  if (presetExists(input.key)) {
    return updatePreset(input.key, input)!;
  }
  return createPreset(input);
}
