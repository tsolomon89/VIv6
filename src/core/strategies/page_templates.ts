import { db } from '../db.js';

/**
 * Strategy to find the best matching page template for an entity.
 * Prioritizes domain-specific templates over generic ones.
 *
 * Matching order:
 * 1. Exact match on both domain_type AND subject_target
 * 2. Match on subject_target with NULL domain_type (generic template)
 * 3. No match - return null
 */
export function findPageTemplateStrategy(ObjectType: string, domainType?: string): any | null {
  // Try domain-specific template first
  if (domainType) {
    const domainSpecific = db.prepare(`
      SELECT key, name, domain_type, subject_target, subject_cardinality, sections
      FROM page_templates
      WHERE subject_target = ? AND domain_type = ?
      LIMIT 1
    `).get(ObjectType, domainType) as any;

    if (domainSpecific) {
      return {
        ...domainSpecific,
        sections: JSON.parse(domainSpecific.sections || '[]'),
      };
    }
  }

  // Fall back to generic template (no domain_type)
  const generic = db.prepare(`
    SELECT key, name, domain_type, subject_target, subject_cardinality, sections
    FROM page_templates
    WHERE subject_target = ? AND domain_type IS NULL
    LIMIT 1
  `).get(ObjectType) as any;

  if (generic) {
    return {
      ...generic,
      sections: JSON.parse(generic.sections || '[]'),
    };
  }

  // Last resort: any template matching subject_target
  const anyMatch = db.prepare(`
    SELECT key, name, domain_type, subject_target, subject_cardinality, sections
    FROM page_templates
    WHERE subject_target = ?
    LIMIT 1
  `).get(ObjectType) as any;

  if (!anyMatch) return null;

  return {
    ...anyMatch,
    sections: JSON.parse(anyMatch.sections || '[]'),
  };
}

