import { db, initDb } from '../core/db.js';
import { syncTargetingRelationships } from '../core/targeting-sync.js';

initDb();

const entities = db.prepare("SELECT id, name, data FROM entities").all() as Array<{ id: string; name: string; data: string }>;

let synced = 0;
for (const row of entities) {
  const data = JSON.parse(row.data || '{}');
  if (data.personas && Object.keys(data.personas).length > 0) {
    syncTargetingRelationships(row.id, data.personas);
    synced++;
    console.log(`Synced targeting for ${row.name} (${row.id})`);
  }
}

console.log(`Done. Synced ${synced} entities.`);
