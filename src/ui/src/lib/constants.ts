/** Canonical entity types used throughout the system */
export const ENTITY_TYPES = ['brand', 'product', 'feature', 'solution', 'useCase', 'persona', 'user', 'role', 'contact', 'account'] as const;
export type EntityTypeName = (typeof ENTITY_TYPES)[number];

/** Relationship types between entities */
export const RELATIONSHIP_TYPES = ['offers', 'has_feature', 'solves_with', 'used_in', 'targets', 'has_segment', 'has_role', 'work_history'] as const;

/** Persona role keys */
export const PERSONA_KEYS = ['DM', 'EU', 'IN'] as const;
export type PersonaKey = (typeof PERSONA_KEYS)[number];

export const PERSONA_LABELS: Record<PersonaKey, string> = {
  DM: 'Decision Maker',
  EU: 'End User',
  IN: 'Influencer',
};

/** Dimension types available for persona targeting */
export const TARGETING_DIMENSIONS = ['companySize', 'department', 'seniority', 'sector', 'industry'] as const;

/** Color schemes by entity type (Tailwind class fragments) */
export const ENTITY_TYPE_STYLES: Record<string, string> = {
  brand: 'bg-purple-500/10 text-purple-400',
  product: 'bg-blue-500/10 text-blue-400',
  feature: 'bg-emerald-500/10 text-emerald-400',
  solution: 'bg-amber-500/10 text-amber-400',
  useCase: 'bg-rose-500/10 text-rose-400',
  persona: 'bg-indigo-500/10 text-indigo-400',
};

/** Build status color schemes */
export const BUILD_STATUS_STYLES: Record<string, string> = {
  success: 'bg-emerald-900/50 text-emerald-300',
  error: 'bg-red-900/50 text-red-300',
  pending: 'bg-amber-900/50 text-amber-300',
};

/** Persona color keys for chip/badge styling */
export const PERSONA_STYLES: Record<PersonaKey, { chip: string; dot: string }> = {
  DM: { chip: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20', dot: 'bg-indigo-500' },
  EU: { chip: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', dot: 'bg-emerald-500' },
  IN: { chip: 'bg-amber-500/10 text-amber-300 border-amber-500/20', dot: 'bg-amber-500' },
};
