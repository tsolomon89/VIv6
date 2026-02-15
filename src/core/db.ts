import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(process.cwd(), 'data/vi.sqlite');
const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');
console.log('[DB] Resolved SCHEMA_PATH:', SCHEMA_PATH);

// Ensure data directory exists
// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST_WORKER_ID !== undefined;
const activePath = isTest ? ':memory:' : DB_PATH;

export const db = new Database(activePath);

if (!isTest) {
    // Enable WAL mode for better concurrency in production/dev
    db.pragma('journal_mode = WAL');
}

export function initDb() {
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);
  if (!isTest) console.log('Database initialized at', activePath);
}

export function resetDb() {
    if (!isTest) throw new Error('Cannot reset DB in non-test environment');
    
    console.error('[DEBUG] resetDb() called');
    
    // Drop all tables and re-init
    // Or just re-run schema if we assumes schema drops if exists? 
    // Schema usually has CREATE TABLE IF NOT EXISTS.
    // For :memory:, we can't easily "drop database", but we can detach or drop tables.
    // Simplest for :memory: is to drop all known tables.
    
    // Disable FKs to allow dropping tables in any order
    db.pragma('foreign_keys = OFF');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    const dropQueries = tables.filter(t => t.name !== 'sqlite_sequence').map(t => `DROP TABLE IF EXISTS "${t.name}";`).join('\n');
    db.exec(dropQueries);
    db.pragma('foreign_keys = ON'); // Re-enable if needed, or leave for initDb? 
    // Usually initDb doesn't set FKs, but consumers might expect them off? 
    // Better to leave them off during Schema creation? 
    // Schema creation is fine with FKs off.
    
    initDb();
}

// Simple migration runner (placeholder for more robust solution)
export function runMigrations() {
  initDb();
  // Future: Read from src/core/migrations/ and apply
}
