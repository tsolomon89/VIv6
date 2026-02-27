import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

describe('MCP startup smoke', () => {
  it('uses resolvable record-module imports with no legacy entities module', () => {
    const sourcePath = path.resolve(projectRoot, 'src', 'mcp', 'server.ts');
    const source = fs.readFileSync(sourcePath, 'utf8');
    const legacyImport = "../core/" + "entities.js";

    expect(source).toContain("../core/records.js");
    expect(source).not.toContain(legacyImport);

    expect(fs.existsSync(path.resolve(projectRoot, 'src', 'core', 'records.ts'))).toBe(true);
    expect(fs.existsSync(path.resolve(projectRoot, 'src', 'core', 'relationships.ts'))).toBe(true);
  });
});
