
import { events } from '../../core/events.js';
import { db } from '../../core/db.js';
import { buildQueue } from './BuildQueue.js';

export function initDeliveryModule() {
  console.log('[Delivery] Initializing...');

  // Wire up events
  events.on('template.updated', (key: string) => {
    console.log(`[Delivery] Template updated: ${key}. Finding affected records...`);

    // 1. Get the template's subject_target (entity type)
    const template = db.prepare(
      'SELECT subject_target FROM page_templates WHERE key = ?'
    ).get(key) as { subject_target: string } | undefined;

    if (!template) {
      console.log(`[Delivery] Template ${key} not found in page_templates`);
      return;
    }

    // 2. Find all records of that type
    const records = db.prepare(
      'SELECT id FROM records WHERE type = ?'
    ).all(template.subject_target) as { id: string }[];

    console.log(`[Delivery] Found ${records.length} records of type '${template.subject_target}' to rebuild`);

    // 3. Enqueue each for rebuild
    for (const record of records) {
      buildQueue.enqueue(record.id);
    }
  });

  events.on('record.updated', (entityId: string) => {
    buildQueue.enqueue(entityId);
  });
  
  events.on('record.created', (entityId: string) => {
    buildQueue.enqueue(entityId);
  });
}
