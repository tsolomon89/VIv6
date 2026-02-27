import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8');
}

describe('Build State SQL Contract', () => {
  it('uses record_id/records in delivery build paths', () => {
    const apiBuild = read('modules/delivery/api/build.ts');
    const queue = read('modules/delivery/BuildQueue.ts');
    const combined = `${apiBuild}\n${queue}`;

    expect(combined).not.toMatch(/\bentity_id\b/);
    expect(combined).not.toMatch(/\bJOIN\s+entities\b/i);
    expect(combined).toMatch(/\brecord_id\b/);
    expect(combined).toMatch(/\bJOIN\s+records\b/i);
  });
});
