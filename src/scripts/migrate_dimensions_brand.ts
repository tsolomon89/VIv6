import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'data/vi.sqlite');
const db = new Database(dbPath);

console.log('Migrating dimension_values: adding brand_id column...');

const migrate = db.transaction(() => {
  db.pragma('foreign_keys = OFF');

  db.prepare(`
    CREATE TABLE IF NOT EXISTS dimension_values_new (
      id TEXT PRIMARY KEY,
      dimension TEXT NOT NULL,
      slug TEXT NOT NULL,
      label TEXT NOT NULL,
      parent_id TEXT,
      metadata JSON,
      source TEXT DEFAULT 'manual',
      source_ref TEXT,
      brand_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(dimension, slug, brand_id),
      FOREIGN KEY (parent_id) REFERENCES dimension_values_new(id)
    );
  `).run();

  const columns = db.pragma('table_info(dimension_values)') as any[];
  const colNames = columns.map((c: any) => c.name).join(', ');

  console.log(`Copying data for columns: ${colNames}`);
  db.prepare(`INSERT INTO dimension_values_new (${colNames}) SELECT ${colNames} FROM dimension_values`).run();

  db.prepare('DROP TABLE dimension_values').run();
  db.prepare('ALTER TABLE dimension_values_new RENAME TO dimension_values').run();

  db.prepare('CREATE INDEX IF NOT EXISTS idx_dimval_dimension ON dimension_values(dimension)').run();
  db.prepare('CREATE INDEX IF NOT EXISTS idx_dimval_parent ON dimension_values(parent_id)').run();
  db.prepare('CREATE INDEX IF NOT EXISTS idx_dimval_brand ON dimension_values(brand_id)').run();

  db.pragma('foreign_keys = ON');
});

try {
  migrate();
  console.log('Migration successful: dimension_values now has brand_id column.');
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
}
