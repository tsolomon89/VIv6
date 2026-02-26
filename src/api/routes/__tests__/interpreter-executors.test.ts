import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  getClient,
  resetTestDb,
  seedTestRecord,
  setupTestServer,
  teardownTestServer,
} from './setup.js';

describe('Interpreter Executors API', () => {
  beforeAll(async () => {
    await setupTestServer();
  });

  afterAll(async () => {
    await teardownTestServer();
  });

  beforeEach(() => {
    resetTestDb();
  });

  it('lists built-in and defined executors', async () => {
    seedTestRecord({
      type: 'interpreter_executor_def',
      slug: 'custom-compute-derivations',
      name: 'Custom Compute Derivations',
      data: {
        key: 'custom.compute_derivations',
        is_active: true,
        supported_events: ['pre_update'],
      },
    });

    const client = getClient();
    const response = await client.get('/interpreter-executors');

    expect(response.status).toBe(200);
    const keys = response.data.data.map((row: any) => row.key);
    expect(keys).toContain('constraints');
    expect(keys).toContain('custom.compute_derivations');
    expect(keys).toContain('custom.compute_metrics');
  });

  it('validates stage configuration against executor contract', async () => {
    seedTestRecord({
      type: 'interpreter_executor_def',
      slug: 'custom-compute-derivations',
      name: 'Custom Compute Derivations',
      data: {
        key: 'custom.compute_derivations',
        is_active: true,
        supported_events: ['pre_update'],
        supported_entity_types: ['contact'],
        options_contract: {
          required: ['mergeIntoData'],
          allowed: ['mergeIntoData'],
          allow_additional: false,
        },
      },
    });

    const client = getClient();
    const response = await client.post('/interpreter-executors/validate-stage', {
      event: 'pre_update',
      entity_type: 'contact',
      stage: {
        executor: 'custom.compute_derivations',
        options: {},
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.data.valid).toBe(false);
    expect(response.data.data.errors.some((e: string) => e.includes('missing required option'))).toBe(true);
  });

  it('accepts builtin executor stage validation without explicit definition record', async () => {
    const client = getClient();
    const response = await client.post('/interpreter-executors/validate-stage', {
      event: 'pre_create',
      entity_type: 'contact',
      stage: {
        executor: 'constraints',
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.data.valid).toBe(true);
  });
});
