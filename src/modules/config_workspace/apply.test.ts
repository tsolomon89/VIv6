import path from 'path';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, resetDb } from '../../core/db.js';
import { applyWorkspace } from './apply.js';
import { addChange } from './changes.js';
import { createWorkspace, submitForReview, approveWorkspace } from './workspace.js';
import { hasInterpreterExecutor, unregisterInterpreterExecutor } from '../ops/interpreter_executor_registry.js';
import { resetInterpreterExecutorPluginLoaderCache } from '../ops/interpreter_executor_plugin_loader.js';
import {
  TEST_EXECUTOR_KEY,
  resetTestInterpreterExecutorPlugin,
} from '../ops/__test_plugins__/interpreter_executor_plugin.js';

const SYSTEM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

function seedSystemAccount() {
  db.prepare(`
    INSERT OR IGNORE INTO accounts (id, slug, name, account_class, type, data, created_at, updated_at)
    VALUES (?, 'system', 'System Account', 'business', 'admin', '{}', datetime('now'), datetime('now'))
  `).run(SYSTEM_ACCOUNT_ID);
}

function pluginPayload(isActive: boolean = true) {
  return {
    key: 'test.dynamic_plugin',
    slug: 'test-dynamic-plugin',
    name: 'Test Dynamic Plugin',
    description: 'Dynamic test plugin',
    is_active: isActive,
    supported_events: ['pre_update'],
    supported_entity_types: ['contact'],
    options_contract: {
      required: [],
      allowed: [],
      allow_additional: true,
    },
    metadata: {
      runtime_registration: {
        module: path.join('src', 'modules', 'ops', '__test_plugins__', 'interpreter_executor_plugin.ts'),
        export: 'registerTestInterpreterExecutorPlugin',
      },
    },
  };
}

async function applyWorkspaceWithSingleChange(change: Parameters<typeof addChange>[0]) {
  const workspace = createWorkspace({
    account_id: SYSTEM_ACCOUNT_ID,
    name: 'Executor Def Apply',
  });
  addChange({
    ...change,
    workspace_id: workspace.id,
  });
  submitForReview(workspace.id);
  approveWorkspace(workspace.id);
  return applyWorkspace(workspace.id);
}

function getExecutorDefRecord() {
  const row = db.prepare(`
    SELECT id, data
    FROM records
    WHERE type = 'interpreter_executor_def'
      AND slug = 'test-dynamic-plugin'
    LIMIT 1
  `).get() as { id: string; data: string } | undefined;
  if (!row) throw new Error('test-dynamic-plugin definition not found');
  return {
    id: row.id,
    data: JSON.parse(row.data),
  };
}

describe('Config Workspace apply plugin reload', () => {
  beforeEach(() => {
    resetDb();
    seedSystemAccount();
    resetInterpreterExecutorPluginLoaderCache();
    resetTestInterpreterExecutorPlugin();
    unregisterInterpreterExecutor(TEST_EXECUTOR_KEY);
  });

  it('reloads interpreter executor plugins when interpreter_executor_def changes are applied', async () => {
    expect(hasInterpreterExecutor(TEST_EXECUTOR_KEY)).toBe(false);

    const result = await applyWorkspaceWithSingleChange({
      config_type: 'interpreter_executor_def',
      operation: 'create',
      target_slug: 'test-dynamic-plugin',
      payload: pluginPayload(true),
    });

    expect(result.success).toBe(true);
    expect(hasInterpreterExecutor(TEST_EXECUTOR_KEY)).toBe(true);
  });

  it('unregisters runtime executor when interpreter_executor_def is deactivated', async () => {
    const created = await applyWorkspaceWithSingleChange({
      config_type: 'interpreter_executor_def',
      operation: 'create',
      target_slug: 'test-dynamic-plugin',
      payload: pluginPayload(true),
    });
    expect(created.success).toBe(true);
    expect(hasInterpreterExecutor(TEST_EXECUTOR_KEY)).toBe(true);

    const existing = getExecutorDefRecord();
    const updateResult = await applyWorkspaceWithSingleChange({
      config_type: 'interpreter_executor_def',
      operation: 'update',
      target_id: existing.id,
      target_slug: 'test-dynamic-plugin',
      payload: {
        ...existing.data,
        is_active: false,
      },
    });

    expect(updateResult.success).toBe(true);
    expect(hasInterpreterExecutor(TEST_EXECUTOR_KEY)).toBe(false);
  });

  it('unregisters runtime executor when interpreter_executor_def is deleted', async () => {
    const created = await applyWorkspaceWithSingleChange({
      config_type: 'interpreter_executor_def',
      operation: 'create',
      target_slug: 'test-dynamic-plugin',
      payload: pluginPayload(true),
    });
    expect(created.success).toBe(true);
    expect(hasInterpreterExecutor(TEST_EXECUTOR_KEY)).toBe(true);

    const existing = getExecutorDefRecord();
    const deleteResult = await applyWorkspaceWithSingleChange({
      config_type: 'interpreter_executor_def',
      operation: 'delete',
      target_id: existing.id,
      target_slug: 'test-dynamic-plugin',
      payload: existing.data,
    });

    expect(deleteResult.success).toBe(true);
    expect(hasInterpreterExecutor(TEST_EXECUTOR_KEY)).toBe(false);
  });
});
