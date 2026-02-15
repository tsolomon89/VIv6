import { db } from './db.js';

export interface TargetingHit {
  entity_id: string;
  persona: string;
  name: string;
  type: string;
  slug: string;
}

/**
 * Syncs entity.data.personas into the entity_targeting junction table.
 * Called after any entity update that touches personas.
 *
 * Personas shape: { DM: { department: ['marketing'], companySize: ['smb'] }, EU: { ... }, IN: { ... } }
 */
export function syncTargetingRelationships(
  entityId: string,
  personas: Record<string, Record<string, string[]>>
): void {
  const del = db.prepare('DELETE FROM entity_targeting WHERE entity_id = ?');
  const ins = db.prepare(
    'INSERT OR IGNORE INTO entity_targeting (entity_id, dimension, slug, persona) VALUES (?, ?, ?, ?)'
  );

  const sync = db.transaction(() => {
    del.run(entityId);
    for (const [persona, dims] of Object.entries(personas)) {
      for (const [dimension, slugs] of Object.entries(dims)) {
        for (const slug of slugs) {
          ins.run(entityId, dimension, slug, persona);
        }
      }
    }
  });

  sync();
}

/**
 * Reverse query: find all entities targeting a given dimension + slug.
 */
export function getEntitiesTargeting(
  dimension: string,
  slug: string,
  persona?: string
): TargetingHit[] {
  const base = `
    SELECT et.entity_id, et.persona, e.name, e.type, e.slug
    FROM entity_targeting et
    JOIN records e ON e.id = et.entity_id
    WHERE et.dimension = ? AND et.slug = ?
  `;

  if (persona) {
    return db.prepare(base + ' AND et.persona = ?').all(dimension, slug, persona) as TargetingHit[];
  }
  return db.prepare(base).all(dimension, slug) as TargetingHit[];
}
