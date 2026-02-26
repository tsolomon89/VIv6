import { DEFAULT_ACCOUNT_ID } from '../../core/constants.js';
import { DataRecord, DataRecordInput } from '../../core/types.js';
import {
  computeAllDerivations,
  computeDerivationBySlug,
} from './derivations.js';
import {
  computeMetric,
  getMetric,
  listMetrics,
  parseMetricDefinition,
} from './metrics.js';
import { registerInterpreterExecutor } from './interpreter_executor_registry.js';

interface ComputeDerivationsOptions {
  derivationSlugs?: string[];
  mergeIntoData?: boolean;
  failOnError?: boolean;
  outputField?: string;
}

const CUSTOM_EXECUTOR_COMPUTE_DERIVATIONS = 'custom.compute_derivations';

interface ComputeMetricsOptions {
  metricSlugs?: string[];
  mergeIntoData?: boolean;
  failOnError?: boolean;
  outputField?: string;
  includeDetails?: boolean;
}

const CUSTOM_EXECUTOR_COMPUTE_METRICS = 'custom.compute_metrics';
let customExecutorsRegistered = false;

function normalizeRecord(record: DataRecordInput | DataRecord): DataRecord {
  const now = new Date().toISOString();
  const rec = record as any;
  return {
    id: rec.id || '',
    account_id: rec.account_id || DEFAULT_ACCOUNT_ID,
    type: rec.type,
    slug: rec.slug || '',
    name: rec.name || rec.slug || '',
    summary: rec.summary || '',
    description: rec.description || '',
    data: rec.data || { fieldGroups: [] },
    created_at: rec.created_at || now,
    updated_at: rec.updated_at || now,
  };
}

export function registerCustomInterpreterExecutors(): void {
  if (customExecutorsRegistered) return;

  registerInterpreterExecutor(CUSTOM_EXECUTOR_COMPUTE_DERIVATIONS, ({ record, stage, context }) => {
    const options = (stage.options || {}) as ComputeDerivationsOptions;
    const normalizedRecord = normalizeRecord(record);
    const accountId = normalizedRecord.account_id || context?.account_id || DEFAULT_ACCOUNT_ID;

    const computed: Record<string, any> = {};
    const errors: string[] = [];

    const requestedSlugs = options.derivationSlugs || [];
    if (requestedSlugs.length > 0) {
      for (const slug of requestedSlugs) {
        const result = computeDerivationBySlug(slug, normalizedRecord, accountId);
        if (result.success) {
          computed[result.fieldName] = result.value;
          normalizedRecord.data = { ...(normalizedRecord.data || {}), [result.fieldName]: result.value };
        } else {
          errors.push(result.error || `Failed to compute derivation: ${slug}`);
        }
      }
    } else {
      const allResults = computeAllDerivations(accountId, normalizedRecord);
      Object.assign(computed, allResults);
    }

    if (options.failOnError && errors.length > 0) {
      throw new Error(`custom.compute_derivations failed: ${errors.join('; ')}`);
    }

    if (options.mergeIntoData !== false) {
      const target = ((record as any).data || {}) as Record<string, any>;
      for (const [fieldName, value] of Object.entries(computed)) {
        target[fieldName] = value;
      }
      (record as any).data = target;
    }

    if (options.outputField) {
      const target = ((record as any).data || {}) as Record<string, any>;
      target[options.outputField] = computed;
      (record as any).data = target;
    }
  });

  registerInterpreterExecutor(CUSTOM_EXECUTOR_COMPUTE_METRICS, ({ record, stage, context }) => {
    const options = (stage.options || {}) as ComputeMetricsOptions;
    const normalizedRecord = normalizeRecord(record);
    const accountId = normalizedRecord.account_id || context?.account_id || DEFAULT_ACCOUNT_ID;

    const computed: Record<string, number> = {};
    const details: Record<string, any> = {};
    const errors: string[] = [];

    const resolved = resolveMetricsForExecution(accountId, normalizedRecord.type, options.metricSlugs);
    for (const missingSlug of resolved.missingSlugs) {
      errors.push(`Metric not found: ${missingSlug}`);
    }

    for (const metricRecord of resolved.metrics) {
      const def = parseMetricDefinition(metricRecord);
      if (def.targetEntityType !== normalizedRecord.type) {
        errors.push(
          `Metric "${metricRecord.slug}" targets "${def.targetEntityType}" but record type is "${normalizedRecord.type}"`
        );
        continue;
      }

      const result = computeMetric(def, normalizedRecord, accountId);
      const targetField = result.targetField || def.targetField || metricRecord.slug;
      details[targetField] = {
        metricSlug: metricRecord.slug,
        ...result,
      };

      if (result.success) {
        computed[targetField] = result.value;
        normalizedRecord.data = { ...(normalizedRecord.data || {}), [targetField]: result.value };
      } else {
        errors.push(result.error || `Failed to compute metric: ${metricRecord.slug}`);
      }
    }

    if (options.failOnError && errors.length > 0) {
      throw new Error(`custom.compute_metrics failed: ${errors.join('; ')}`);
    }

    if (options.mergeIntoData !== false) {
      const target = ((record as any).data || {}) as Record<string, any>;
      for (const [fieldName, value] of Object.entries(computed)) {
        target[fieldName] = value;
      }
      (record as any).data = target;
    }

    if (options.outputField) {
      const target = ((record as any).data || {}) as Record<string, any>;
      target[options.outputField] = options.includeDetails ? details : computed;
      (record as any).data = target;
    }
  });

  customExecutorsRegistered = true;
}

function resolveMetricBySlug(accountId: string, slug: string): DataRecord | undefined {
  const metric = getMetric(accountId, slug);
  if (metric) return metric;

  if (accountId !== DEFAULT_ACCOUNT_ID) {
    return getMetric(DEFAULT_ACCOUNT_ID, slug);
  }

  return undefined;
}

function resolveMetricsForExecution(
  accountId: string,
  targetEntityType: string,
  metricSlugs?: string[]
): { metrics: DataRecord[]; missingSlugs: string[] } {
  if (metricSlugs && metricSlugs.length > 0) {
    const resolved: DataRecord[] = [];
    const missingSlugs: string[] = [];
    for (const slug of metricSlugs) {
      const metric = resolveMetricBySlug(accountId, slug);
      if (metric) {
        resolved.push(metric);
      } else {
        missingSlugs.push(slug);
      }
    }
    return { metrics: resolved, missingSlugs };
  }

  const bySlug = new Map<string, DataRecord>();

  if (accountId !== DEFAULT_ACCOUNT_ID) {
    for (const metric of listMetrics(DEFAULT_ACCOUNT_ID)) {
      const def = parseMetricDefinition(metric);
      if (def.targetEntityType === targetEntityType) {
        bySlug.set(metric.slug, metric);
      }
    }
  }

  for (const metric of listMetrics(accountId)) {
    const def = parseMetricDefinition(metric);
    if (def.targetEntityType === targetEntityType) {
      bySlug.set(metric.slug, metric);
    }
  }

  return { metrics: Array.from(bySlug.values()), missingSlugs: [] };
}
