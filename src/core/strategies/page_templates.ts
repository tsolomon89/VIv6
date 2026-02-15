import { db } from '../db.js';

/**
 * Strategy to find the best matching page template for an entity.
 * Prioritizes domain-specific templates over generic ones.
 */
export function findPageTemplateStrategy(entityType: string, domainType?: string): any | null {
  // TODO: Add domain_type to page_templates table to support domain-specific templates
  // For now, just match on subject_target
  
  const row = db.prepare(
    "SELECT key, name, subject_target, subject_cardinality, sections FROM page_templates WHERE subject_target = ? LIMIT 1"
  ).get(entityType) as any;

  if (!row) return null;
  return {
    ...row,
    sections: JSON.parse(row.sections || '[]'),
  };
}
