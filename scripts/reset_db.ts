
import { db, initDb } from '../src/core/db.js';

console.log('Resetting Database...');

// Disable FKs to allow dropping
db.pragma('foreign_keys = OFF');

// Get all tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as any[];

console.log(`Found ${tables.length} tables to drop:`, tables.map(t => t.name).join(', '));

db.transaction(() => {
    for (const table of tables) {
        console.log(`Dropping ${table.name}...`);
        db.prepare(`DROP TABLE IF EXISTS "${table.name}"`).run();
    }
})();

console.log('Tables dropped.');

// Force Re-init
// We need to clear internal cache or just run initDb logic manually?
// initDb() checks existence of 'records'. Since we dropped it, it should run schema.
console.log('Re-initializing Schema...');
initDb();

console.log('Database Reset Complete.');
