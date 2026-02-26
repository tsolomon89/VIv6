import { beforeEach, describe, expect, it } from 'vitest';
import path from 'path';
import { db, resetDb } from '../../core/db.js';
import {
  hasInterpreterExecutor,
  registerInterpreterExecutor,
  unregisterInterpreterExecutor,
} from './interpreter_executor_registry.js';
import {
  loadInterpreterExecutorPlugins,
  resetInterpreterExecutorPluginLoaderCache,
} from './interpreter_executor_plugin_loader.js';
import {
  TEST_EXECUTOR_KEY,
  resetTestInterpreterExecutorPlugin,
} from './__test_plugins__/interpreter_executor_plugin.js';

const SYSTEM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';
const NON_SYSTEM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000111';
const UNMANAGED_EXECUTOR_KEY = 'test.unmanaged_executor';

function seedAccount(id: string, slug: string = 'system') {
  db.prepare(`
    INSERT OR IGNORE INTO accounts (id, slug, name, account_class, type, data, created_at, updated_at)
    VALUES (?, ?, ?, 'business', 'admin', '{}', datetime('now'), datetime('now'))
  `).run(id, slug, slug === 'system' ? 'System Account' : `Account ${slug}`);
}

function seedExecutorDef(data: {
  key: string;
  account_id?: string;
  is_active?: boolean;
  metadata?: Record<string, any>;
}): string {
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO records (id, type, slug, name, account_id, data, created_at, updated_at)
    VALUES (?, 'interpreter_executor_def', ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(
    id,
    data.key.replace(/\./g, '-'),
    data.key,
    data.account_id || SYSTEM_ACCOUNT_ID,
    JSON.stringify({
      key: data.key,
      is_active: data.is_active ?? true,
      metadata: data.metadata || {},
    })
  );
  return id;
}

function updateExecutorDef(id: string, updater: (current: Record<string, any>) => Record<string, any>) {
  const row = db.prepare('SELECT data FROM records WHERE id = ?').get(id) as { data: string } | undefined;
  if (!row) throw new Error(`Executor definition not found: ${id}`);
  const current = JSON.parse(row.data) as Record<string, any>;
  const next = updater(current);
  db.prepare('UPDATE records SET data = ?, updated_at = datetime(\'now\') WHERE id = ?').run(JSON.stringify(next), id);
}

describe('Interpreter Executor Plugin Loader', () => {
  beforeEach(() => {
    resetDb();
    seedAccount(SYSTEM_ACCOUNT_ID);
    seedAccount(NON_SYSTEM_ACCOUNT_ID, 'tenant-account');
    resetInterpreterExecutorPluginLoaderCache();
    resetTestInterpreterExecutorPlugin();
    unregisterInterpreterExecutor(TEST_EXECUTOR_KEY);
    unregisterInterpreterExecutor(UNMANAGED_EXECUTOR_KEY);
  });

  it('loads and invokes runtime registration from interpreter_executor_def metadata', async () => {
    seedExecutorDef({
      key: 'test.dynamic_plugin',
      metadata: {
        runtime_registration: {
          module: path.join('src', 'modules', 'ops', '__test_plugins__', 'interpreter_executor_plugin.ts'),
          export: 'registerTestInterpreterExecutorPlugin',
        },
      },
    });

    const result = await loadInterpreterExecutorPlugins(SYSTEM_ACCOUNT_ID);
    expect(result.errors).toEqual([]);
    expect(result.loaded.length).toBe(1);
    expect(result.loaded[0].executorKey).toBe('test.dynamic_plugin');
    expect(hasInterpreterExecutor(TEST_EXECUTOR_KEY)).toBe(true);
  });

  it('skips duplicate registration loads unless force=true', async () => {
    seedExecutorDef({
      key: 'test.dynamic_plugin',
      metadata: {
        runtime_registration: {
          module: path.join('src', 'modules', 'ops', '__test_plugins__', 'interpreter_executor_plugin.ts'),
          export: 'registerTestInterpreterExecutorPlugin',
        },
      },
    });

    const first = await loadInterpreterExecutorPlugins(SYSTEM_ACCOUNT_ID);
    expect(first.loaded.length).toBe(1);

    const second = await loadInterpreterExecutorPlugins(SYSTEM_ACCOUNT_ID);
    expect(second.loaded.length).toBe(0);
    expect(second.skipped.length).toBe(1);

    const forced = await loadInterpreterExecutorPlugins(SYSTEM_ACCOUNT_ID, { force: true });
    expect(forced.loaded.length).toBe(1);
    expect(hasInterpreterExecutor(TEST_EXECUTOR_KEY)).toBe(true);
  });

  it('reports registration errors and missing desired executors when module export is invalid', async () => {
    seedExecutorDef({
      key: 'test.invalid_plugin',
      metadata: {
        runtime_registration: {
          module: path.join('src', 'modules', 'ops', '__test_plugins__', 'interpreter_executor_plugin.ts'),
          export: 'missingExportName',
        },
      },
    });

    const result = await loadInterpreterExecutorPlugins(SYSTEM_ACCOUNT_ID);
    expect(result.loaded.length).toBe(0);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].executorKey).toBe('test.invalid_plugin');
    expect(result.errors[0].message).toContain('not a function');
    expect(result.missing.map(item => item.executorKey)).toContain('test.invalid_plugin');
  });

  it('unloads managed executor when definition becomes inactive', async () => {
    const defId = seedExecutorDef({
      key: 'test.dynamic_plugin',
      metadata: {
        runtime_registration: {
          module: path.join('src', 'modules', 'ops', '__test_plugins__', 'interpreter_executor_plugin.ts'),
          export: 'registerTestInterpreterExecutorPlugin',
        },
      },
    });

    await loadInterpreterExecutorPlugins(SYSTEM_ACCOUNT_ID);
    expect(hasInterpreterExecutor(TEST_EXECUTOR_KEY)).toBe(true);

    updateExecutorDef(defId, current => ({ ...current, is_active: false }));

    const reconciled = await loadInterpreterExecutorPlugins(SYSTEM_ACCOUNT_ID, { force: true });
    expect(reconciled.unloaded.map(item => item.executorKey)).toContain('test.dynamic_plugin');
    expect(hasInterpreterExecutor(TEST_EXECUTOR_KEY)).toBe(false);
  });

  it('unloads managed executor when runtime registration is disabled', async () => {
    const defId = seedExecutorDef({
      key: 'test.dynamic_plugin',
      metadata: {
        runtime_registration: {
          module: path.join('src', 'modules', 'ops', '__test_plugins__', 'interpreter_executor_plugin.ts'),
          export: 'registerTestInterpreterExecutorPlugin',
        },
      },
    });

    await loadInterpreterExecutorPlugins(SYSTEM_ACCOUNT_ID);
    expect(hasInterpreterExecutor(TEST_EXECUTOR_KEY)).toBe(true);

    updateExecutorDef(defId, current => ({
      ...current,
      metadata: {
        ...(current.metadata as Record<string, any> || {}),
        runtime_registration: {
          ...((current.metadata as Record<string, any> || {}).runtime_registration || {}),
          enabled: false,
        },
      },
    }));

    const reconciled = await loadInterpreterExecutorPlugins(SYSTEM_ACCOUNT_ID, { force: true });
    expect(reconciled.unloaded.map(item => item.executorKey)).toContain('test.dynamic_plugin');
    expect(hasInterpreterExecutor(TEST_EXECUTOR_KEY)).toBe(false);
  });

  it('unloads managed executor when definition is deleted', async () => {
    const defId = seedExecutorDef({
      key: 'test.dynamic_plugin',
      metadata: {
        runtime_registration: {
          module: path.join('src', 'modules', 'ops', '__test_plugins__', 'interpreter_executor_plugin.ts'),
          export: 'registerTestInterpreterExecutorPlugin',
        },
      },
    });

    await loadInterpreterExecutorPlugins(SYSTEM_ACCOUNT_ID);
    expect(hasInterpreterExecutor(TEST_EXECUTOR_KEY)).toBe(true);

    db.prepare('DELETE FROM records WHERE id = ?').run(defId);

    const reconciled = await loadInterpreterExecutorPlugins(SYSTEM_ACCOUNT_ID, { force: true });
    expect(reconciled.unloaded.map(item => item.executorKey)).toContain('test.dynamic_plugin');
    expect(hasInterpreterExecutor(TEST_EXECUTOR_KEY)).toBe(false);
  });

  it('does not unregister unmanaged executors during reconcile', async () => {
    registerInterpreterExecutor(UNMANAGED_EXECUTOR_KEY, () => {});
    expect(hasInterpreterExecutor(UNMANAGED_EXECUTOR_KEY)).toBe(true);

    const defId = seedExecutorDef({
      key: 'test.dynamic_plugin',
      metadata: {
        runtime_registration: {
          module: path.join('src', 'modules', 'ops', '__test_plugins__', 'interpreter_executor_plugin.ts'),
          export: 'registerTestInterpreterExecutorPlugin',
        },
      },
    });

    await loadInterpreterExecutorPlugins(SYSTEM_ACCOUNT_ID);
    expect(hasInterpreterExecutor(TEST_EXECUTOR_KEY)).toBe(true);

    db.prepare('DELETE FROM records WHERE id = ?').run(defId);
    await loadInterpreterExecutorPlugins(SYSTEM_ACCOUNT_ID, { force: true });

    expect(hasInterpreterExecutor(TEST_EXECUTOR_KEY)).toBe(false);
    expect(hasInterpreterExecutor(UNMANAGED_EXECUTOR_KEY)).toBe(true);
  });

  it('uses system/default account definitions for runtime authority', async () => {
    seedExecutorDef({
      key: 'test.dynamic_plugin',
      account_id: NON_SYSTEM_ACCOUNT_ID,
      metadata: {
        runtime_registration: {
          module: path.join('src', 'modules', 'ops', '__test_plugins__', 'interpreter_executor_plugin.ts'),
          export: 'registerTestInterpreterExecutorPlugin',
        },
      },
    });

    const result = await loadInterpreterExecutorPlugins(NON_SYSTEM_ACCOUNT_ID);
    expect(result.loaded.length).toBe(0);
    expect(hasInterpreterExecutor(TEST_EXECUTOR_KEY)).toBe(false);
  });
});
