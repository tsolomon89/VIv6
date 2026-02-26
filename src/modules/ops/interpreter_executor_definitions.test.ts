import { beforeEach, describe, expect, it } from 'vitest';
import { db, resetDb } from '../../core/db.js';
import {
  getInterpreterExecutorDefinition,
  listInterpreterExecutorDefinitions,
  validateInterpreterStageAgainstDefinition,
} from './interpreter_executor_definitions.js';

function seedSystemAccount() {
  db.prepare(`
    INSERT OR IGNORE INTO accounts (id, slug, name, account_class, type, data, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000000', 'system', 'System Account', 'business', 'admin', '{}', datetime('now'), datetime('now'))
  `).run();
}

function seedExecutorDef() {
  db.prepare(`
    INSERT INTO records (id, type, slug, name, account_id, data, created_at, updated_at)
    VALUES (?, 'interpreter_executor_def', ?, ?, '00000000-0000-0000-0000-000000000000', ?, datetime('now'), datetime('now'))
  `).run(
    crypto.randomUUID(),
    'custom-compute-derivations',
    'Custom Compute Derivations',
    JSON.stringify({
      key: 'custom.compute_derivations',
      is_active: true,
      supported_events: ['pre_update'],
      supported_entity_types: ['contact'],
      options_contract: {
        required: ['mergeIntoData'],
        allowed: ['mergeIntoData', 'failOnError'],
        allow_additional: false,
      },
    })
  );
}

describe('Interpreter Executor Definitions', () => {
  beforeEach(() => {
    resetDb();
    seedSystemAccount();
    seedExecutorDef();
  });

  it('lists and resolves executor definitions', () => {
    const defs = listInterpreterExecutorDefinitions();
    expect(defs.length).toBeGreaterThan(0);

    const def = getInterpreterExecutorDefinition('custom.compute_derivations');
    expect(def).toBeDefined();
    expect(def?.key).toBe('custom.compute_derivations');
  });

  it('validates event/entity/options contract mismatches', () => {
    const errors = validateInterpreterStageAgainstDefinition({
      accountId: '00000000-0000-0000-0000-000000000000',
      event: 'post_update',
      entityType: 'opportunity',
      stage: {
        executor: 'custom.compute_derivations',
        order: 1,
        enabled: true,
        options: { unexpected: true },
      },
    });

    expect(errors.some(e => e.includes('not allowed for event'))).toBe(true);
    expect(errors.some(e => e.includes('not allowed for entity type'))).toBe(true);
    expect(errors.some(e => e.includes('missing required option'))).toBe(true);
    expect(errors.some(e => e.includes('unsupported option'))).toBe(true);
  });

  it('allows builtin executors without definition records', () => {
    const errors = validateInterpreterStageAgainstDefinition({
      accountId: '00000000-0000-0000-0000-000000000000',
      event: 'pre_create',
      entityType: 'contact',
      stage: {
        executor: 'constraints',
        order: 1,
        enabled: true,
      },
    });

    expect(errors).toEqual([]);
  });
});
