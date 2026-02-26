import { describe, it, expect } from 'vitest';
import {
  getDefaultInterpreterPipeline,
  parseInterpreterPipelineRecord,
} from './interpreter_pipeline.js';
import { DataRecord } from '../../core/types.js';

describe('Interpreter Pipeline', () => {
  it('parses canonical pipeline records', () => {
    const record = {
      id: '1',
      account_id: '00000000-0000-0000-0000-000000000000',
      type: 'interpreter_pipeline',
      slug: 'pipeline-pre-update',
      name: 'Pre Update',
      data: {
        event: 'pre_update',
        is_active: true,
        stages: [
          { executor: 'constraints', order: 10, enabled: true },
          { executor: 'rules', order: 20, enabled: true },
        ],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as DataRecord;

    const parsed = parseInterpreterPipelineRecord(record);

    expect(parsed).toBeDefined();
    expect(parsed?.event).toBe('pre_update');
    expect(parsed?.stages).toHaveLength(2);
    expect(parsed?.stages[0].executor).toBe('constraints');
  });

  it('accepts custom executor keys', () => {
    const record = {
      id: '2',
      account_id: '00000000-0000-0000-0000-000000000000',
      type: 'interpreter_pipeline',
      slug: 'pipeline-custom',
      name: 'Custom',
      data: {
        event: 'pre_create',
        stages: [{ executor: 'custom.my_executor', order: 10 }],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as DataRecord;

    const parsed = parseInterpreterPipelineRecord(record);
    expect(parsed?.stages[0].executor).toBe('custom.my_executor');
  });

  it('returns undefined when executor key is empty', () => {
    const record = {
      id: '3',
      account_id: '00000000-0000-0000-0000-000000000000',
      type: 'interpreter_pipeline',
      slug: 'pipeline-invalid',
      name: 'Invalid',
      data: {
        event: 'pre_create',
        stages: [{ executor: '   ', order: 10 }],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as DataRecord;

    expect(parseInterpreterPipelineRecord(record)).toBeUndefined();
  });

  it('keeps state machine in default pre_update ordering', () => {
    const pipeline = getDefaultInterpreterPipeline('pre_update');
    const executors = pipeline.stages.map(s => s.executor);

    expect(executors).toEqual(['constraints', 'state_machine', 'code_hooks', 'rules']);
  });
});
