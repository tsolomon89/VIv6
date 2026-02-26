import { beforeEach, describe, expect, it } from 'vitest';
import { db, resetDb } from '../../core/db.js';
import { getRecord, updateRecord } from '../content/services.js';
import { registerCustomInterpreterExecutors } from './custom_interpreter_executors.js';
import { executeInterpreterExecutor } from './interpreter_executor_registry.js';

const SYSTEM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

function seedSystemAccount() {
  db.prepare(`
    INSERT OR IGNORE INTO accounts (id, slug, name, account_class, type, data, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000000', 'system', 'System Account', 'business', 'admin', '{}', datetime('now'), datetime('now'))
  `).run();
}

function seedDerivation(data: { slug: string; targetType: string; fieldName: string; expression: string; returnType: string }) {
  db.prepare(`
    INSERT INTO records (id, type, slug, name, account_id, data, created_at, updated_at)
    VALUES (?, 'derivation', ?, ?, '00000000-0000-0000-0000-000000000000', ?, datetime('now'), datetime('now'))
  `).run(
    crypto.randomUUID(),
    data.slug,
    data.slug,
    JSON.stringify({
      'Target Entity Type': data.targetType,
      'Field Name': data.fieldName,
      'Expression': data.expression,
      'Return Type': data.returnType,
    })
  );
}

function seedMetric(data: {
  slug: string;
  sourceType: string;
  targetType: string;
  sourceField: string;
  targetField: string;
  aggregation: 'sum' | 'count' | 'avg' | 'min' | 'max';
  relationshipPath?: string;
}) {
  db.prepare(`
    INSERT INTO records (id, type, slug, name, account_id, data, created_at, updated_at)
    VALUES (?, 'metric', ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(
    crypto.randomUUID(),
    data.slug,
    data.slug,
    SYSTEM_ACCOUNT_ID,
    JSON.stringify({
      'Source Entity Type': data.sourceType,
      'Target Entity Type': data.targetType,
      'Source Field': data.sourceField,
      'Target Field': data.targetField,
      'Aggregation': data.aggregation,
      ...(data.relationshipPath ? { 'Relationship Path': data.relationshipPath } : {}),
    })
  );
}

function seedRecord(data: {
  id?: string;
  type: string;
  slug: string;
  name: string;
  account_id?: string;
  payload?: Record<string, any>;
}): string {
  const id = data.id || crypto.randomUUID();
  db.prepare(`
    INSERT INTO records (id, type, slug, name, account_id, data, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(
    id,
    data.type,
    data.slug,
    data.name,
    data.account_id || SYSTEM_ACCOUNT_ID,
    JSON.stringify(data.payload || {})
  );
  return id;
}

function seedRelationship(fromRecordId: string, toRecordId: string, relationshipType: string) {
  db.prepare(`
    INSERT INTO record_relationships (id, from_record_id, to_record_id, relationship_type, data, created_at)
    VALUES (?, ?, ?, ?, '{}', datetime('now'))
  `).run(crypto.randomUUID(), fromRecordId, toRecordId, relationshipType);
}

function seedExecutorDef(data: {
  key: string;
  supportedEvents: string[];
  supportedEntityTypes: string[];
  allowedOptions: string[];
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
      supported_events: data.supportedEvents,
      supported_entity_types: data.supportedEntityTypes,
      options_contract: {
        required: [],
        allowed: data.allowedOptions,
        allow_additional: false,
      },
    })
  );
}

function seedPreUpdatePipeline(stages: any[]) {
  db.prepare(`
    INSERT INTO records (id, type, slug, name, account_id, data, created_at, updated_at)
    VALUES (?, 'interpreter_pipeline', ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(
    crypto.randomUUID(),
    'test-pre-update-pipeline',
    'Test Pre Update Pipeline',
    SYSTEM_ACCOUNT_ID,
    JSON.stringify({
      event: 'pre_update',
      is_active: true,
      stages,
    })
  );
}

describe('custom.compute_derivations executor', () => {
  beforeEach(() => {
    resetDb();
    seedSystemAccount();
    registerCustomInterpreterExecutors();
  });

  it('computes configured derivation slugs and merges into record.data', async () => {
    seedDerivation({
      slug: 'contact-full-name',
      targetType: 'contact',
      fieldName: 'full_name',
      expression: "concat(coalesce(firstName, ''), ' ', coalesce(lastName, ''))",
      returnType: 'text',
    });

    const record: any = {
      type: 'contact',
      account_id: '00000000-0000-0000-0000-000000000000',
      slug: 'contact-1',
      name: 'Contact 1',
      data: {
        firstName: 'Ada',
        lastName: 'Lovelace',
      },
    };

    await executeInterpreterExecutor('custom.compute_derivations', {
      event: 'pre_update',
      type: 'contact',
      stage: {
        executor: 'custom.compute_derivations',
        order: 35,
        enabled: true,
        options: {
          derivationSlugs: ['contact-full-name'],
          mergeIntoData: true,
          failOnError: true,
        },
      },
      record,
      context: {},
      runCodeHooks: async () => {},
    });

    expect(record.data.full_name).toBe('Ada Lovelace');
  });

  it('throws when derivation lookup fails and failOnError=true', async () => {
    const record: any = {
      type: 'contact',
      account_id: '00000000-0000-0000-0000-000000000000',
      slug: 'contact-2',
      name: 'Contact 2',
      data: {},
    };

    await expect(
      executeInterpreterExecutor('custom.compute_derivations', {
        event: 'pre_update',
        type: 'contact',
        stage: {
          executor: 'custom.compute_derivations',
          order: 35,
          enabled: true,
          options: {
            derivationSlugs: ['missing-slug'],
            failOnError: true,
          },
        },
        record,
        context: {},
        runCodeHooks: async () => {},
      })
    ).rejects.toThrow('custom.compute_derivations failed');
  });
});

describe('custom.compute_metrics executor', () => {
  beforeEach(() => {
    resetDb();
    seedSystemAccount();
    registerCustomInterpreterExecutors();
  });

  it('computes configured metric slugs and merges values into record.data', async () => {
    const contactId = seedRecord({
      type: 'contact',
      slug: 'contact-1',
      name: 'Contact 1',
      payload: {},
    });
    const activityId = seedRecord({
      type: 'activity',
      slug: 'activity-1',
      name: 'Activity 1',
      payload: { cost: 10 },
    });
    seedRelationship(activityId, contactId, 'involves');

    seedMetric({
      slug: 'contact-activity-count',
      sourceType: 'activity',
      targetType: 'contact',
      sourceField: 'id',
      targetField: 'activity_count',
      aggregation: 'count',
      relationshipPath: 'involves',
    });

    const record: any = {
      id: contactId,
      type: 'contact',
      account_id: SYSTEM_ACCOUNT_ID,
      slug: 'contact-1',
      name: 'Contact 1',
      data: {},
    };

    await executeInterpreterExecutor('custom.compute_metrics', {
      event: 'pre_update',
      type: 'contact',
      stage: {
        executor: 'custom.compute_metrics',
        order: 37,
        enabled: true,
        options: {
          metricSlugs: ['contact-activity-count'],
          mergeIntoData: true,
          failOnError: true,
          outputField: 'metric_results',
          includeDetails: true,
        },
      },
      record,
      context: {},
      runCodeHooks: async () => {},
    });

    expect(record.data.activity_count).toBe(1);
    expect(record.data.metric_results.activity_count.metricSlug).toBe('contact-activity-count');
  });

  it('throws when metric lookup fails and failOnError=true', async () => {
    const record: any = {
      id: crypto.randomUUID(),
      type: 'contact',
      account_id: SYSTEM_ACCOUNT_ID,
      slug: 'contact-2',
      name: 'Contact 2',
      data: {},
    };

    await expect(
      executeInterpreterExecutor('custom.compute_metrics', {
        event: 'pre_update',
        type: 'contact',
        stage: {
          executor: 'custom.compute_metrics',
          order: 37,
          enabled: true,
          options: {
            metricSlugs: ['missing-metric'],
            failOnError: true,
          },
        },
        record,
        context: {},
        runCodeHooks: async () => {},
      })
    ).rejects.toThrow('custom.compute_metrics failed');
  });
});

describe('seeded multi-stage custom executor chaining', () => {
  beforeEach(() => {
    resetDb();
    seedSystemAccount();
    registerCustomInterpreterExecutors();
  });

  it('runs custom.compute_derivations then custom.compute_metrics from seeded pre_update pipeline', async () => {
    seedExecutorDef({
      key: 'custom.compute_derivations',
      supportedEvents: ['pre_update'],
      supportedEntityTypes: ['contact'],
      allowedOptions: ['derivationSlugs', 'mergeIntoData', 'failOnError', 'outputField'],
    });
    seedExecutorDef({
      key: 'custom.compute_metrics',
      supportedEvents: ['pre_update'],
      supportedEntityTypes: ['contact'],
      allowedOptions: ['metricSlugs', 'mergeIntoData', 'failOnError', 'outputField', 'includeDetails'],
    });

    seedPreUpdatePipeline([
      {
        executor: 'custom.compute_derivations',
        order: 10,
        enabled: true,
        blocking: true,
        appliesToEntityTypes: ['contact'],
        options: {
          derivationSlugs: ['contact-full-name'],
          mergeIntoData: true,
          failOnError: true,
        },
      },
      {
        executor: 'custom.compute_metrics',
        order: 20,
        enabled: true,
        blocking: true,
        appliesToEntityTypes: ['contact'],
        options: {
          metricSlugs: ['contact-activity-count'],
          mergeIntoData: true,
          failOnError: true,
        },
      },
    ]);

    seedDerivation({
      slug: 'contact-full-name',
      targetType: 'contact',
      fieldName: 'full_name',
      expression: "concat(coalesce(firstName, ''), ' ', coalesce(lastName, ''))",
      returnType: 'text',
    });

    seedMetric({
      slug: 'contact-activity-count',
      sourceType: 'activity',
      targetType: 'contact',
      sourceField: 'id',
      targetField: 'activity_count',
      aggregation: 'count',
      relationshipPath: 'involves',
    });

    const contactId = seedRecord({
      type: 'contact',
      slug: 'contact-chain',
      name: 'Contact Chain',
      payload: {
        firstName: 'Grace',
        lastName: 'Hopper',
      },
    });
    const activityId = seedRecord({
      type: 'activity',
      slug: 'activity-chain',
      name: 'Activity Chain',
      payload: {},
    });
    seedRelationship(activityId, contactId, 'involves');

    const updated = await updateRecord(contactId, {
      data: {
        firstName: 'Ada',
        lastName: 'Lovelace',
      },
    });

    expect(updated).toBeDefined();
    expect(updated?.data.full_name).toBe('Ada Lovelace');
    expect(updated?.data.activity_count).toBe(1);

    const persisted = getRecord(contactId);
    expect(persisted?.data.full_name).toBe('Ada Lovelace');
    expect(persisted?.data.activity_count).toBe(1);
  });
});
