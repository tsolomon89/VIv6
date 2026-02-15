import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'data/vi.sqlite');
const db = new Database(dbPath);

console.log('Migrating database schema...');

const migrate = db.transaction(() => {
  // 1. Disable Foreign Keys
  db.pragma('foreign_keys = OFF');

  // 2. Create new table without UNIQUE constraint on slug
  db.prepare(`
    CREATE TABLE IF NOT EXISTS entities_new (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      data JSON DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      content_hash TEXT,
      brand_id TEXT
    );
  `).run();

  // 3. Copy data
  // We need to list columns explicitly because 'brand_id' might be in a different position in the physical table 
  // depending on how it was added. 'SELECT *' into matching columns works if names match? 
  // SQLite INSERT INTO ... SELECT ... matches by position, NOT name.
  // So we must be careful.
  
  // Let's get current columns order from PRAGMA table_info
  const columns = db.pragma('table_info(entities)') as any[];
  const colNames = columns.map(c => c.name).join(', ');
  
  console.log(`Copying data for columns: ${colNames}`);
  
  db.prepare(`INSERT INTO entities_new (${colNames}) SELECT ${colNames} FROM entities`).run();

  // 4. Drop old table
  db.prepare('DROP TABLE entities').run();

  // 5. Rename new table
  db.prepare('ALTER TABLE entities_new RENAME TO entities').run();

  // 6. Create Indices
  db.prepare('CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type)').run();
  
  // The Fix: Composite unique index
  db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_entities_slug_brand ON entities(slug, brand_id)').run();

  // 7. Re-enable Foreign Keys (checked at transaction commit)
  db.pragma('foreign_keys = ON');
});

try {
  migrate();
  console.log('Migration successful: "slug" is now unique per "brand_id".');
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
}
