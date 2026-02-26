/**
 * Interpreter Pipeline
 *
 * Defines the lifecycle execution order for record events.
 * Pipeline records can override the default hardcoded order by event.
 */

import { DEFAULT_ACCOUNT_ID } from '../../core/constants.js';
import { DataRecord, EntityType } from '../../core/types.js';
import { listRecords } from '../content/services.js';

export type InterpreterEvent =
  | 'pre_create'
  | 'post_create'
  | 'pre_update'
  | 'post_update'
  | 'pre_delete'
  | 'post_delete';

export type BuiltInInterpreterStageExecutor =
  | 'constraints'
  | 'state_machine'
  | 'code_hooks'
  | 'rules';

export type InterpreterStageExecutor =
  | BuiltInInterpreterStageExecutor
  | (string & {});

export interface InterpreterPipelineStage {
  key?: string;
  executor: InterpreterStageExecutor;
  order: number;
  enabled?: boolean;
  blocking?: boolean;
  appliesToEntityTypes?: EntityType[];
  options?: Record<string, any>;
}

export interface InterpreterPipelineDefinition {
  event: InterpreterEvent;
  stages: InterpreterPipelineStage[];
  is_active?: boolean;
}

const VALID_EVENTS = new Set<InterpreterEvent>([
  'pre_create',
  'post_create',
  'pre_update',
  'post_update',
  'pre_delete',
  'post_delete',
]);

const DEFAULT_PIPELINES: Record<InterpreterEvent, InterpreterPipelineDefinition> = {
  pre_create: {
    event: 'pre_create',
    stages: [
      { executor: 'constraints', order: 10, enabled: true, blocking: true },
      { executor: 'code_hooks', order: 20, enabled: true, blocking: true },
      { executor: 'rules', order: 30, enabled: true, blocking: false },
    ],
    is_active: true,
  },
  post_create: {
    event: 'post_create',
    stages: [
      { executor: 'code_hooks', order: 10, enabled: true, blocking: true },
      { executor: 'rules', order: 20, enabled: true, blocking: false },
    ],
    is_active: true,
  },
  pre_update: {
    event: 'pre_update',
    stages: [
      { executor: 'constraints', order: 10, enabled: true, blocking: true },
      { executor: 'state_machine', order: 20, enabled: true, blocking: true },
      { executor: 'code_hooks', order: 30, enabled: true, blocking: true },
      { executor: 'rules', order: 40, enabled: true, blocking: false },
    ],
    is_active: true,
  },
  post_update: {
    event: 'post_update',
    stages: [
      { executor: 'code_hooks', order: 10, enabled: true, blocking: true },
      { executor: 'rules', order: 20, enabled: true, blocking: false },
    ],
    is_active: true,
  },
  pre_delete: {
    event: 'pre_delete',
    stages: [
      { executor: 'code_hooks', order: 10, enabled: true, blocking: true },
      { executor: 'rules', order: 20, enabled: true, blocking: false },
    ],
    is_active: true,
  },
  post_delete: {
    event: 'post_delete',
    stages: [
      { executor: 'code_hooks', order: 10, enabled: true, blocking: true },
      { executor: 'rules', order: 20, enabled: true, blocking: false },
    ],
    is_active: true,
  },
};

function isInterpreterEvent(value: unknown): value is InterpreterEvent {
  return typeof value === 'string' && VALID_EVENTS.has(value as InterpreterEvent);
}

function isStageExecutor(value: unknown): value is InterpreterStageExecutor {
  return typeof value === 'string' && value.trim().length > 0;
}

function clonePipeline(definition: InterpreterPipelineDefinition): InterpreterPipelineDefinition {
  return {
    event: definition.event,
    is_active: definition.is_active,
    stages: definition.stages.map(stage => ({
      ...stage,
      appliesToEntityTypes: stage.appliesToEntityTypes ? [...stage.appliesToEntityTypes] : undefined,
      options: stage.options ? { ...stage.options } : undefined,
    })),
  };
}

export function getDefaultInterpreterPipeline(event: InterpreterEvent): InterpreterPipelineDefinition {
  return clonePipeline(DEFAULT_PIPELINES[event]);
}

export function parseInterpreterPipelineRecord(record: DataRecord): InterpreterPipelineDefinition | undefined {
  const data = record.data || {};
  const eventCandidate = data.event ?? data['Event'];
  if (!isInterpreterEvent(eventCandidate)) return undefined;

  const rawStages = Array.isArray(data.stages)
    ? data.stages
    : Array.isArray(data['Stages'])
      ? data['Stages']
      : [];

  const normalizedStages: InterpreterPipelineStage[] = rawStages
    .map((stage: any, index: number) => {
      const executorRaw = stage.executor ?? stage.type ?? stage['Executor'];
      const executor = typeof executorRaw === 'string' ? executorRaw.trim() : executorRaw;
      if (!isStageExecutor(executor)) {
        return null;
      }

      const parsedOrder = Number(stage.order ?? stage.sequence ?? stage['Order'] ?? index);
      if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
        return null;
      }

      const enabledRaw = stage.enabled ?? stage.is_enabled ?? true;
      const enabled = !(enabledRaw === false || enabledRaw === 'false' || enabledRaw === 0);

      return {
        key: stage.key ?? stage.name ?? stage['Key'],
        executor,
        order: parsedOrder,
        enabled,
        blocking: stage.blocking,
        appliesToEntityTypes: Array.isArray(stage.appliesToEntityTypes)
          ? stage.appliesToEntityTypes.filter((value: unknown): value is EntityType => typeof value === 'string')
          : undefined,
        options: stage.options,
      } as InterpreterPipelineStage;
    })
    .filter((stage): stage is InterpreterPipelineStage => !!stage);

  if (normalizedStages.length === 0) return undefined;

  return {
    event: eventCandidate,
    stages: normalizedStages,
    is_active: data.is_active ?? data.isActive ?? true,
  };
}

function getPipelineRecordsForAccount(accountId: string): InterpreterPipelineDefinition[] {
  const records = listRecords(accountId, 'interpreter_pipeline');
  return records
    .map(parseInterpreterPipelineRecord)
    .filter((def): def is InterpreterPipelineDefinition => !!def && def.is_active !== false);
}

export function getInterpreterPipeline(
  event: InterpreterEvent,
  accountId: string = DEFAULT_ACCOUNT_ID
): InterpreterPipelineDefinition {
  const accountPipeline = getPipelineRecordsForAccount(accountId).find(def => def.event === event);
  if (accountPipeline) return clonePipeline(accountPipeline);

  if (accountId !== DEFAULT_ACCOUNT_ID) {
    const systemPipeline = getPipelineRecordsForAccount(DEFAULT_ACCOUNT_ID).find(def => def.event === event);
    if (systemPipeline) return clonePipeline(systemPipeline);
  }

  return getDefaultInterpreterPipeline(event);
}

export function getInterpreterStagesForEvent(
  event: InterpreterEvent,
  accountId: string,
  entityType: string
): InterpreterPipelineStage[] {
  const pipeline = getInterpreterPipeline(event, accountId);

  return pipeline.stages
    .filter(stage => stage.enabled !== false)
    .filter(stage => {
      if (!stage.appliesToEntityTypes || stage.appliesToEntityTypes.length === 0) {
        return true;
      }
      return stage.appliesToEntityTypes.includes(entityType as EntityType);
    })
    .sort((a, b) => a.order - b.order);
}
