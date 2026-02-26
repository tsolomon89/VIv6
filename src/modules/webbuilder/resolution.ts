/**
 * Binding Resolution Service
 *
 * Resolves webbuilder bindings to actual VIv5 records via relationships.
 * Handles data injection into section configs for rendering.
 */

import type { DataRecord } from '../../core/types.js';
import { getRecord, listRecords } from '../content/services.js';
import { getRelationshipsFrom, getRelationshipsTo } from '../content/services.js';
import type {
  Binding,
  SectionInstance,
  ConfigState,
  PresentationPreset,
  SectionVisualConfig,
} from './types.js';
import { getPreset } from './presets.js';
import { bindingToRelationshipType } from './binding.js';

// ============================================================================
// Binding Resolution
// ============================================================================

export interface ResolvedBinding {
  binding: Binding;
  records: DataRecord[];
}

/**
 * Resolve a binding to actual records based on the page record's relationships.
 */
export async function resolveBinding(
  pageRecord: DataRecord,
  binding: Binding,
  accountId: string
): Promise<ResolvedBinding> {
  const records: DataRecord[] = [];

  if (binding.kind === 'self') {
    // Self binding: find the subject entity via 'subject_of' relationship
    const subjectRels = getRelationshipsFrom(pageRecord.id, 'subject_of');
    for (const rel of subjectRels) {
      const record = getRecord(rel.to_record_id);
      if (record) {
        records.push(record);
      }
    }
  } else {
    // Related binding: find entities via 'displays_*' relationships
    const relType = bindingToRelationshipType(binding);
    if (relType) {
      const rels = getRelationshipsFrom(pageRecord.id, relType);
      for (const rel of rels) {
        const record = getRecord(rel.to_record_id);
        if (record) {
          records.push(record);
        }
      }
    }

    // If no explicit relationships, fall back to querying all of that type
    if (records.length === 0) {
      const allOfType = listRecords(accountId, binding.target as any);
      records.push(...allOfType);
    }

    // Apply scope filters
    if (binding.scope) {
      applyBindingScope(records, binding.scope);
    }
  }

  return { binding, records };
}

/**
 * Apply scope filters to a record list (in-place).
 */
function applyBindingScope(
  records: DataRecord[],
  scope: NonNullable<Extract<Binding, { kind: 'related' }>['scope']>
): void {
  // Sort
  if (scope.sort) {
    const [field, direction] = scope.sort.split(':');
    const dir = direction === 'desc' ? -1 : 1;
    records.sort((a, b) => {
      const aVal = (a as any)[field] ?? a.data?.[field] ?? '';
      const bVal = (b as any)[field] ?? b.data?.[field] ?? '';
      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
  }

  // Filter
  if (scope.filter) {
    const filterEntries = Object.entries(scope.filter);
    for (let i = records.length - 1; i >= 0; i--) {
      const record = records[i];
      for (const [key, value] of filterEntries) {
        const recordVal = (record as any)[key] ?? record.data?.[key];
        if (recordVal !== value) {
          records.splice(i, 1);
          break;
        }
      }
    }
  }

  // Limit
  if (scope.limit !== undefined && records.length > scope.limit) {
    records.length = scope.limit;
  }
}

// ============================================================================
// Section Compilation
// ============================================================================

export interface CompiledSection {
  id: string;
  placement: SectionInstance['placement'];
  binding: Binding;
  config: Partial<SectionVisualConfig>;
  resolvedData: DataRecord[];
}

/**
 * Compile a section instance by:
 * 1. Loading the preset
 * 2. Deep-cloning the preset config
 * 3. Applying overrides
 * 4. Injecting binding data
 */
export async function compileSection(
  section: SectionInstance,
  pageRecord: DataRecord,
  accountId: string
): Promise<CompiledSection | null> {
  // Load preset
  const preset = getPreset(section.presentationKey);
  if (!preset) {
    console.warn(`Preset not found: ${section.presentationKey}`);
    return null;
  }

  // Deep clone preset config (no-bleed invariant)
  const config = deepClone(preset.config);

  // Apply overrides
  if (section.overrides) {
    applyOverrides(config, section.overrides);
  }

  // Resolve binding data
  const resolved = await resolveBinding(pageRecord, section.binding, accountId);

  // Inject data into config
  injectBindingData(config, resolved.records, preset.config);

  return {
    id: section.id,
    placement: section.placement,
    binding: section.binding,
    config,
    resolvedData: resolved.records,
  };
}

/**
 * Compile all sections for a page.
 */
export async function compilePage(
  sections: SectionInstance[],
  pageRecord: DataRecord,
  accountId: string
): Promise<CompiledSection[]> {
  const compiled: CompiledSection[] = [];

  // Sort sections by placement
  const sorted = sortSections(sections);

  for (const section of sorted) {
    const result = await compileSection(section, pageRecord, accountId);
    if (result) {
      compiled.push(result);
    }
  }

  return compiled;
}

/**
 * Sort sections by placement (start -> free by order -> end).
 */
function sortSections(sections: SectionInstance[]): SectionInstance[] {
  const start: SectionInstance[] = [];
  const free: SectionInstance[] = [];
  const end: SectionInstance[] = [];

  for (const section of sections) {
    if (section.placement.slot === 'start') {
      start.push(section);
    } else if (section.placement.slot === 'end') {
      end.push(section);
    } else {
      free.push(section);
    }
  }

  // Sort free sections by order
  free.sort((a, b) => (a.placement.order ?? 0) - (b.placement.order ?? 0));

  // Clamp to max 1 start and 1 end
  return [
    ...start.slice(0, 1),
    ...free,
    ...end.slice(0, 1),
  ];
}

// ============================================================================
// Dimension Resolution
// ============================================================================

/**
 * Resolve section dimensions (height, pinHeight) from preset and overrides.
 */
export function resolveSectionDimensions(
  preset: PresentationPreset,
  overrides?: Partial<SectionVisualConfig>
): { height: number; pinHeight: number } {
  const baseHeight = preset.config.height?.value ?? 600;
  const basePinHeight = preset.config.pinHeight ?? baseHeight;

  const height = overrides?.height?.value ?? baseHeight;
  const pinHeight = overrides?.pinHeight ?? basePinHeight;

  return { height, pinHeight };
}

// ============================================================================
// Data Injection
// ============================================================================

/**
 * Smart injection of entity data into config.
 * Only overwrites if config matches preset default (untouched).
 */
function injectBindingData(
  config: Partial<SectionVisualConfig>,
  records: DataRecord[],
  presetDefault: Partial<SectionVisualConfig>
): void {
  if (records.length === 0) return;

  const primary = records[0];

  // Inject into tile content if untouched
  if (config.tileHeading === presetDefault.tileHeading || config.tileHeading === '') {
    config.tileHeading = primary.name;
  }

  if (config.tileLabel === presetDefault.tileLabel || config.tileLabel === '') {
    config.tileLabel = primary.summary ?? '';
  }

  if (config.tileSubtitle === presetDefault.tileSubtitle || config.tileSubtitle === '') {
    config.tileSubtitle = primary.description ?? '';
  }

  // Inject into list items if applicable
  if (config.listItems !== undefined && records.length > 1) {
    config.listItems = records.map(record => ({
      tileHeading: record.name,
      tileLabel: record.summary ?? '',
      tileSubtitle: record.description ?? '',
      cardMediaSrc: record.data?.image ?? record.data?.thumbnail ?? '',
    }));
  }

  // Recursively inject into children
  if (config.children) {
    for (const child of config.children) {
      injectBindingData(child as Partial<SectionVisualConfig>, records, presetDefault.children?.[0] ?? {});
    }
  }
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Deep clone an object (JSON round-trip for simplicity).
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Apply overrides to a base config (deep merge).
 * Objects merged recursively, arrays replaced, primitives replaced.
 */
function applyOverrides(
  base: Record<string, unknown>,
  overrides: Record<string, unknown>
): void {
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;

    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof base[key] === 'object' &&
      base[key] !== null &&
      !Array.isArray(base[key])
    ) {
      // Deep merge objects
      applyOverrides(base[key] as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      // Replace value
      base[key] = value;
    }
  }
}
