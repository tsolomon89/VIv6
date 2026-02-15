/**
 * Targeting Taxonomy & Normalized Data Model
 * 
 * This file defines the core dimensions used for firmographic and technographic targeting.
 * It serves as the programmatic source of truth for the 'Targeting Taxonomy' specification.
 */

// --- Core Dimension Types ---

export const DIMENSION_KEYS = {
  INDUSTRY: 'industry',
  SECTOR: 'sector',
  COMPANY_SIZE: 'company_size',
  FUNCTION: 'function',
  SENIORITY: 'seniority',
  GEO_REGION: 'geo_region',
} as const;

export type DimensionKey = typeof DIMENSION_KEYS[keyof typeof DIMENSION_KEYS];

// --- Company Size Segments ---

export const COMPANY_SIZE_SEGMENTS = {
  VSB: { code: 'VSB', label: 'Very Small Business', range: '1-50' },
  SMB: { code: 'SMB', label: 'Small-to-Mid Business', range: '51-200' },
  MID: { code: 'MID', label: 'Mid-Market', range: '201-1000' },
  ENT: { code: 'ENT', label: 'Enterprise', range: '1001-5000' },
  LE: { code: 'LE', label: 'Large Enterprise', range: '5000+' },
} as const;

export type CompanySizeCode = keyof typeof COMPANY_SIZE_SEGMENTS;

// --- Job Functions ---

export const JOB_FUNCTIONS = [
  'Engineering',
  'Marketing',
  'Sales',
  'Product',
  'Finance',
  'HR',
  'Operations',
  'Legal',
  'Executive',
] as const;

export type JobFunction = typeof JOB_FUNCTIONS[number];

// --- Seniority Levels ---

export const SENIORITY_LEVELS = [
  'CXO',      // C-Level, President, Founder
  'VP',       // Vice President, Head of
  'Director', // Director, Group Manager
  'Manager',  // Manager, Team Lead
  'Senior',   // Senior IC, Lead, Principal
  'Entry',    // Junior, Associate, Analyst
  'Training', // Intern, Student
] as const;

export type SeniorityLevel = typeof SENIORITY_LEVELS[number];

// --- Targeting Profile Interface ---

/**
 * Represents the normalized targeting vector for a Visitor or Persona.
 * Used to resolve the "Next Best Action" or personalization content.
 */
export interface TargetingProfile {
  [DIMENSION_KEYS.COMPANY_SIZE]?: CompanySizeCode[];
  [DIMENSION_KEYS.INDUSTRY]?: string[]; // IDs or Slugs from DimensionValues
  [DIMENSION_KEYS.FUNCTION]?: JobFunction[];
  [DIMENSION_KEYS.SENIORITY]?: SeniorityLevel[];
  [DIMENSION_KEYS.SECTOR]?: string[];
  [DIMENSION_KEYS.GEO_REGION]?: string[];
}

/**
 * Helper to check if a visitor profile matches a rule set.
 * Returns true if ANY of the values in the rule match the visitor's values (OR logic within dimension).
 * Returns true if ALL dimensions in the rule are satisfied (AND logic across dimensions).
 */
export function matchesTargeting(visitor: TargetingProfile, rules: TargetingProfile): boolean {
  for (const dimValue of Object.values(DIMENSION_KEYS)) {
    const dim = dimValue as keyof TargetingProfile;
    const visitorValues = visitor[dim];
    const ruleValues = rules[dim];

    // If rule doesn't care about this dimension, skip
    if (!ruleValues || ruleValues.length === 0) continue;

    // If visitor has no data for this required dimension, fail
    if (!visitorValues || visitorValues.length === 0) return false;

    // Check intersection
    const hasMatch = ruleValues.some(r => (visitorValues as any[]).includes(r));
    if (!hasMatch) return false;
  }
  return true;
}
