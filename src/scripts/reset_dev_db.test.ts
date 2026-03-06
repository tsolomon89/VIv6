import { afterEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const tsxCliPath = path.resolve(projectRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const resetScriptPath = path.resolve(projectRoot, 'src', 'scripts', 'reset_dev_db.ts');

const cleanupDirs: string[] = [];

function createTempWorkspace(): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'viv5-devdb-reset-'));
  cleanupDirs.push(tempDir);

  const dataDir = path.join(tempDir, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'vi.sqlite'), 'stale');
  fs.writeFileSync(path.join(dataDir, 'vi.sqlite-shm'), 'stale');
  fs.writeFileSync(path.join(dataDir, 'vi.sqlite-wal'), 'stale');

  return tempDir;
}

afterEach(() => {
  while (cleanupDirs.length > 0) {
    const dir = cleanupDirs.pop();
    if (dir && fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe('devdb:reset', () => {
  it('rebuilds a local database from tracked seeds using the current working directory data path', () => {
    const tempDir = createTempWorkspace();
    const childEnv = { ...process.env } as Record<string, string>;
    delete childEnv.VITEST;
    delete childEnv.VITEST_MODE;
    delete childEnv.VITEST_POOL_ID;
    delete childEnv.VITEST_WORKER_ID;

    const result = spawnSync(process.execPath, [tsxCliPath, resetScriptPath], {
      cwd: tempDir,
      env: {
        ...childEnv,
        NODE_ENV: 'development',
      },
      encoding: 'utf8',
      timeout: 120000,
    });

    expect(result.status, result.stderr).toBe(0);

    const dbPath = path.join(tempDir, 'data', 'vi.sqlite');
    expect(fs.existsSync(dbPath)).toBe(true);

    const db = new Database(dbPath, { readonly: true });
    try {
      const recordCount = db.prepare('SELECT COUNT(*) as count FROM records').get() as { count: number };
      const domainCount = db.prepare('SELECT COUNT(*) as count FROM domains').get() as { count: number };
      const objectTypesColumn = db.prepare(`PRAGMA table_info(domains)`).all() as Array<{ name: string }>;
      const legacyColumnName = ['entity', 'types'].join('_');

      expect(recordCount.count).toBeGreaterThan(0);
      expect(domainCount.count).toBeGreaterThan(0);
      expect(objectTypesColumn.some((column) => column.name === 'object_types')).toBe(true);
      expect(objectTypesColumn.some((column) => column.name === legacyColumnName)).toBe(false);
    } finally {
      db.close();
    }
  });
});
