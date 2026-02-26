import { describe, it, expect } from 'vitest';
import {
  executeInterpreterExecutor,
  hasInterpreterExecutor,
  registerInterpreterExecutor,
  unregisterInterpreterExecutor,
} from './interpreter_executor_registry.js';

describe('Interpreter Executor Registry', () => {
  it('registers and executes a custom executor', async () => {
    const key = 'test.custom_executor';
    let called = false;

    registerInterpreterExecutor(key, async () => {
      called = true;
    }, { overwrite: true });

    expect(hasInterpreterExecutor(key)).toBe(true);

    await executeInterpreterExecutor(key, {
      event: 'pre_create',
      type: 'contact',
      stage: { executor: key, order: 10, enabled: true },
      record: {
        id: '1',
        account_id: '00000000-0000-0000-0000-000000000000',
        type: 'contact' as any,
        slug: 'c1',
        name: 'Contact 1',
        data: { fieldGroups: [] },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      context: {},
      runCodeHooks: async () => {},
    });

    expect(called).toBe(true);
    unregisterInterpreterExecutor(key);
  });

  it('throws when executing an unregistered executor', async () => {
    await expect(
      executeInterpreterExecutor('missing.executor', {
        event: 'pre_create',
        type: 'contact',
        stage: { executor: 'missing.executor', order: 10, enabled: true },
        record: {
          id: '1',
          account_id: '00000000-0000-0000-0000-000000000000',
          type: 'contact' as any,
          slug: 'c1',
          name: 'Contact 1',
          data: { fieldGroups: [] },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        context: {},
        runCodeHooks: async () => {},
      })
    ).rejects.toThrow('No interpreter executor registered');
  });
});
