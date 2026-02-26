/**
 * MCP Preset Tool Handlers
 *
 * Tools for AI agents to work with presentation presets.
 */

import {
  getPreset,
  listPresets,
  listCompatiblePresets,
  type PresetFilter,
} from '../../modules/webbuilder/presets.js';
import type { Binding, PresentationPreset } from '../../modules/webbuilder/types.js';

// ============================================================================
// TYPES
// ============================================================================

export interface ListPresetsArgs {
  signature_kind?: 'self' | 'related';
  target?: string;
  cardinality?: 'one' | 'many';
  account_id?: string;
}

export interface ListPresetsResult {
  count: number;
  presets: Array<{
    key: string;
    signature: {
      kind: string;
      target?: string;
      cardinality?: string;
    };
  }>;
}

export interface GetPresetArgs {
  key: string;
}

export interface GetPresetResult {
  preset: PresentationPreset | null;
}

export interface ListCompatiblePresetsArgs {
  binding_kind: 'self' | 'related';
  target?: string;
  cardinality?: 'one' | 'many';
  account_id?: string;
}

export interface ListCompatiblePresetsResult {
  binding: Binding;
  count: number;
  presets: Array<{
    key: string;
    signature: {
      kind: string;
      target?: string;
      cardinality?: string;
    };
  }>;
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * List all available presets
 */
export function listPresetsHandler(args: ListPresetsArgs): ListPresetsResult {
  const filter: PresetFilter = {};

  if (args.signature_kind) {
    filter.signatureKind = args.signature_kind;
  }
  if (args.target) {
    filter.target = args.target;
  }
  if (args.cardinality) {
    filter.cardinality = args.cardinality;
  }
  if (args.account_id) {
    filter.accountId = args.account_id;
  }

  const presets = listPresets(filter);

  return {
    count: presets.length,
    presets: presets.map(p => ({
      key: p.key,
      signature: {
        kind: p.signature.kind,
        ...(p.signature.kind === 'related' && {
          target: p.signature.target,
          cardinality: p.signature.cardinality,
        }),
      },
    })),
  };
}

/**
 * Get a specific preset by key
 */
export function getPresetHandler(args: GetPresetArgs): GetPresetResult {
  const preset = getPreset(args.key);
  return { preset: preset || null };
}

/**
 * List presets compatible with a binding
 */
export function listCompatiblePresetsHandler(args: ListCompatiblePresetsArgs): ListCompatiblePresetsResult {
  let binding: Binding;

  if (args.binding_kind === 'self') {
    binding = { kind: 'self' };
  } else {
    if (!args.target || !args.cardinality) {
      throw new Error('target and cardinality are required for related bindings');
    }
    binding = {
      kind: 'related',
      target: args.target as any,
      cardinality: args.cardinality,
    };
  }

  const presets = listCompatiblePresets(binding, args.account_id);

  return {
    binding,
    count: presets.length,
    presets: presets.map(p => ({
      key: p.key,
      signature: {
        kind: p.signature.kind,
        ...(p.signature.kind === 'related' && {
          target: p.signature.target,
          cardinality: p.signature.cardinality,
        }),
      },
    })),
  };
}
