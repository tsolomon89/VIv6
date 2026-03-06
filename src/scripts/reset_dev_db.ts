import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const workingRoot = process.cwd();
const dbBasePath = path.resolve(workingRoot, 'data', 'vi.sqlite');
const dbArtifacts = [
  dbBasePath,
  `${dbBasePath}-shm`,
  `${dbBasePath}-wal`,
];

for (const artifact of dbArtifacts) {
  if (fs.existsSync(artifact)) {
    fs.rmSync(artifact, { force: true });
    console.log(`[devdb:reset] Removed ${path.relative(workingRoot, artifact)}`);
  }
}

const { initDb } = await import('../core/db.js');
const { seedFromData } = await import('./seed_from_data.js');

initDb();
seedFromData();

console.log('[devdb:reset] Local database rebuilt from tracked seeds.');
