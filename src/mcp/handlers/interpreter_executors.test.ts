/**
 * Unit tests for MCP Interpreter Executor Tool Handlers
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { db, resetDb } from '../../core/db.js';
import { registerCustomInterpreterExecutors } from '../../modules/ops/custom_interpreter_executors.js';
import {
  listInterpreterExecutorsHandler,
  validateInterpreterStageHandler,
} from './interpreter_executors.js';

const SYSTEM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

function seedSystemAccount() {
  db.prepare(`
    INSERT OR IGNORE INTO accounts (id, slug, name, account_class, type, data, created_at, updated_at)
    VALUES (?, 'system', 'System Account', 'business', 'admin', '{}', datetime('now'), datetime('now'))
  `).run(SYSTEM_ACCOUNT_ID);
}

function seedExecutorDef(data: {
  key: string;
  supportedEvents?: string[];
  supportedEntityTypes?: string[];
  optionsContract?: Record<string, any>;
}) {
  db.prepare(`
    INSERT INTO records (id, type, slug, name, account_id, data, created_at, updated_at)
    VALUES (?, 'interpreter_executor_def', ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(
    crypto.randomUUID(),
    data.key.replace(/\./g, '-'),
    data.key,
    SYSTEM_ACCOUNT_ID,
    JSON.stringify({
      key: data.key,
      is_active: true,
      supported_events: data.supportedEvents || ['pre_update'],
      supported_entity_types: data.supportedEntityTypes || ['contact'],
      ...(data.optionsContract ? { options_contract: data.optionsContract } : {}),
    })
  );
}

describe('MCP Interpreter Executor Tool Handlers', () => {
  beforeEach(() => {
    resetDb();
    seedSystemAccount();
    registerCustomInterpreterExecutors();
  });

  it('lists built-in and custom executor keys', () => {
    seedExecutorDef({
      key: 'custom.compute_derivations',
    });

    const result = listInterpreterExecutorsHandler();
    const keys = result.executors.map(ex => ex.key);

    expect(result.count).toBeGreaterThan(0);
    expect(keys).toContain('constraints');
    expect(keys).toContain('custom.compute_derivations');
    expect(keys).toContain('custom.compute_metrics');
  });

  it('validates stage config against definition contract', () => {
    seedExecutorDef({
      key: 'custom.compute_derivations',
      optionsContract: {
        required: ['mergeIntoData'],
        allowed: ['mergeIntoData'],
        allow_additional: false,
      },
    });

    const result = validateInterpreterStageHandler({
      event: 'pre_update',
      ObjectType: 'contact',
      stage: {
        executor: 'custom.compute_derivations',
        options: {},
      },
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.includes('missing required option'))).toBe(true);
    expect(result.executor.isRegistered).toBe(true);
  });

  it('flags non-builtin executors that are defined but not runtime-registered', () => {
    seedExecutorDef({
      key: 'custom.not_registered',
    });

    const result = validateInterpreterStageHandler({
      event: 'pre_update',
      ObjectType: 'contact',
      stage: {
        executor: 'custom.not_registered',
      },
    });

    expect(result.valid).toBe(false);
    expect(result.executor.hasDefinition).toBe(true);
    expect(result.executor.isRegistered).toBe(false);
    expect(result.errors.some(error => error.includes('No runtime executor registered'))).toBe(true);
  });

  it('allows builtin executor validation without definition records', () => {
    const result = validateInterpreterStageHandler({
      event: 'pre_create',
      ObjectType: 'contact',
      stage: {
        executor: 'constraints',
      },
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.executor.isBuiltin).toBe(true);
  });
});


