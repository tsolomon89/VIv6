/**
 * Binding Utilities
 *
 * Functions for deriving signatures from bindings and matching
 * presets to bindings for compatibility validation.
 */

import type {
  Binding,
  BindingSignature,
  PresentationPreset,
} from './types.js';

/**
 * Derive a BindingSignature from a Binding.
 * Signatures drop runtime details (scope) for template matching.
 */
export function deriveSignature(binding: Binding): BindingSignature {
  if (binding.kind === 'self') {
    return { kind: 'self' };
  }

  const sig: BindingSignature = {
    kind: 'related',
    target: binding.target,
    cardinality: binding.cardinality,
  };

  // Include relationKey if present
  if (binding.relationKey) {
    (sig as { kind: 'related'; target: string; cardinality: 'one' | 'many'; relationKey?: string }).relationKey = binding.relationKey;
  }

  return sig;
}

/**
 * Check if a preset's signature matches a binding.
 *
 * Matching rules:
 * - kind must match exactly
 * - For 'related' bindings:
 *   - target must match
 *   - cardinality must match
 *   - relationKey: if preset declares one, binding must match it;
 *     if preset omits it, any binding relationKey is accepted (wildcard)
 */
export function matchesSignature(preset: PresentationPreset, binding: Binding): boolean {
  const presetSig = preset.signature;
  const bindingSig = deriveSignature(binding);

  // Kind must match
  if (presetSig.kind !== bindingSig.kind) {
    return false;
  }

  // Self bindings always match if kind matches
  if (presetSig.kind === 'self') {
    return true;
  }

  // Related binding comparison
  if (presetSig.kind === 'related' && bindingSig.kind === 'related') {
    // Target must match
    if (presetSig.target !== bindingSig.target) {
      return false;
    }

    // Cardinality must match
    if (presetSig.cardinality !== bindingSig.cardinality) {
      return false;
    }

    // RelationKey matching (preset declares -> must match; preset omits -> wildcard)
    if (presetSig.relationKey !== undefined) {
      if (bindingSig.relationKey !== presetSig.relationKey) {
        return false;
      }
    }

    return true;
  }

  return false;
}

/**
 * Compare two signatures for equality.
 */
export function signaturesEqual(a: BindingSignature, b: BindingSignature): boolean {
  if (a.kind !== b.kind) return false;

  if (a.kind === 'self' && b.kind === 'self') return true;

  if (a.kind === 'related' && b.kind === 'related') {
    return (
      a.target === b.target &&
      a.cardinality === b.cardinality &&
      a.relationKey === b.relationKey
    );
  }

  return false;
}

/**
 * Serialize a binding signature to a string key.
 * Useful for indexing and comparison.
 */
export function signatureToKey(sig: BindingSignature): string {
  if (sig.kind === 'self') {
    return 'self';
  }

  let key = `related.${sig.target}.${sig.cardinality}`;
  if (sig.relationKey) {
    key += `.${sig.relationKey}`;
  }
  return key;
}

/**
 * Parse a signature key back to a BindingSignature.
 */
export function keyToSignature(key: string): BindingSignature {
  if (key === 'self') {
    return { kind: 'self' };
  }

  const parts = key.split('.');
  if (parts[0] !== 'related' || parts.length < 3) {
    throw new Error(`Invalid signature key: ${key}`);
  }

  const sig: BindingSignature = {
    kind: 'related',
    target: parts[1] as 'brand' | 'product' | 'feature' | 'solution' | 'useCase',
    cardinality: parts[2] as 'one' | 'many',
  };

  if (parts[3]) {
    (sig as { kind: 'related'; target: string; cardinality: 'one' | 'many'; relationKey?: string }).relationKey = parts[3];
  }

  return sig;
}

/**
 * Map a webbuilder EntityType to a VIv5 record relationship type.
 */
export function bindingToRelationshipType(binding: Binding): string | null {
  if (binding.kind === 'self') {
    return 'subject_of';
  }

  return `displays_${binding.target}`;
}

/**
 * Parse a relationship type back to a binding target.
 */
export function relationshipTypeToTarget(relType: string): string | null {
  if (relType === 'subject_of') {
    return null; // Self binding
  }

  if (relType.startsWith('displays_')) {
    return relType.replace('displays_', '');
  }

  return null;
}
