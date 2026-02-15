import { db } from '../src/core/db.js';

console.log("Dropping dimension_values...");
db.exec("DROP TABLE IF EXISTS dimension_values");

console.log("Recreating dimension_values...");
db.exec(`
CREATE TABLE IF NOT EXISTS dimension_values (
  id TEXT PRIMARY KEY,
  dimension TEXT NOT NULL,
  slug TEXT NOT NULL,
  label TEXT NOT NULL,
  parent_id TEXT,
  account_id TEXT, -- NULL = Global
  metadata JSON DEFAULT '{}',
  source TEXT DEFAULT 'manual',
  brand_id TEXT, -- Compatibility with code if needed? Schema said account_id.
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES dimension_values(id),
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  UNIQUE(dimension, slug, account_id)
);
CREATE INDEX IF NOT EXISTS idx_dimval_dimension ON dimension_values(dimension);
`);

console.log("Done.");
