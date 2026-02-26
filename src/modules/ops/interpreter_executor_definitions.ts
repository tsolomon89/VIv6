import { DEFAULT_ACCOUNT_ID } from '../../core/constants.js';
import { BUILTIN_INTERPRETER_EXECUTORS } from '../../core/config_registry.js';
import { DataRecord, EntityType } from '../../core/types.js';
import { listRecords } from '../content/services.js';
import { InterpreterEvent, InterpreterPipelineStage } from './interpreter_pipeline.js';

export interface InterpreterExecutorOptionsContract {
  required?: string[];
  allowed?: string[];
  allow_additional?: boolean;
}

export interface InterpreterExecutorDefinition {
  key: string;
  description?: string;
  is_active: boolean;
  supported_events?: InterpreterEvent[];
  supported_entity_types?: EntityType[];
  options_contract?: InterpreterExecutorOptionsContract;
  metadata?: Record<string, any>;
}

function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const normalized = value
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean);
  return normalized.length > 0 ? normalized : undefined;
}

export function parseInterpreterExecutorDefinition(
  record: DataRecord
): InterpreterExecutorDefinition | undefined {
  const data = record.data || {};
  const key = (data.key ?? data.Key ?? record.slug ?? '').toString().trim();
  if (!key) return undefined;

  const supportedEvents = toStringArray(data.supported_events ?? data.supportedEvents);
  const supportedEntityTypes = toStringArray(data.supported_entity_types ?? data.supportedEntityTypes);
  const rawOptionsContract = (data.options_contract ?? data.optionsContract) as any;
  const options_contract: InterpreterExecutorOptionsContract | undefined =
    rawOptionsContract && typeof rawOptionsContract === 'object'
      ? {
          required: toStringArray(rawOptionsContract.required),
          allowed: toStringArray(rawOptionsContract.allowed),
          allow_additional:
            typeof rawOptionsContract.allow_additional === 'boolean'
              ? rawOptionsContract.allow_additional
              : undefined,
        }
      : undefined;

  return {
    key,
    description:
      typeof data.description === 'string'
        ? data.description
        : typeof record.summary === 'string'
          ? record.summary
          : undefined,
    is_active: data.is_active ?? data.isActive ?? true,
    supported_events: supportedEvents as InterpreterEvent[] | undefined,
    supported_entity_types: supportedEntityTypes as EntityType[] | undefined,
    options_contract,
    metadata: typeof data.metadata === 'object' && data.metadata ? data.metadata : undefined,
  };
}

function listExecutorDefinitionRecords(accountId: string): DataRecord[] {
  return listRecords(accountId, 'interpreter_executor_def');
}

export function listInterpreterExecutorDefinitions(
  accountId: string = DEFAULT_ACCOUNT_ID
): InterpreterExecutorDefinition[] {
  const combined = new Map<string, InterpreterExecutorDefinition>();

  if (accountId !== DEFAULT_ACCOUNT_ID) {
    const systemDefs = listExecutorDefinitionRecords(DEFAULT_ACCOUNT_ID);
    for (const record of systemDefs) {
      const parsed = parseInterpreterExecutorDefinition(record);
      if (parsed) combined.set(parsed.key, parsed);
    }
  }

  const accountDefs = listExecutorDefinitionRecords(accountId);
  for (const record of accountDefs) {
    const parsed = parseInterpreterExecutorDefinition(record);
    if (parsed) combined.set(parsed.key, parsed);
  }

  return Array.from(combined.values());
}

export function getInterpreterExecutorDefinition(
  key: string,
  accountId: string = DEFAULT_ACCOUNT_ID
): InterpreterExecutorDefinition | undefined {
  const target = key.trim();
  if (!target) return undefined;
  return listInterpreterExecutorDefinitions(accountId).find(def => def.key === target);
}

export function validateInterpreterStageAgainstDefinition(params: {
  accountId: string;
  event: InterpreterEvent;
  entityType: string;
  stage: InterpreterPipelineStage;
}): string[] {
  const { accountId, event, entityType, stage } = params;
  const executor = stage.executor.trim();
  if (!executor) return ['Executor key is empty'];

  if ((BUILTIN_INTERPRETER_EXECUTORS as readonly string[]).includes(executor)) {
    return [];
  }

  const def = getInterpreterExecutorDefinition(executor, accountId);
  if (!def) {
    return [`No interpreter_executor_def record found for executor "${executor}"`];
  }

  const errors: string[] = [];
  if (def.is_active === false) {
    errors.push(`Executor "${executor}" is inactive`);
  }

  if (def.supported_events && def.supported_events.length > 0 && !def.supported_events.includes(event)) {
    errors.push(`Executor "${executor}" is not allowed for event "${event}"`);
  }

  if (
    def.supported_entity_types &&
    def.supported_entity_types.length > 0 &&
    !def.supported_entity_types.includes(entityType as EntityType)
  ) {
    errors.push(`Executor "${executor}" is not allowed for entity type "${entityType}"`);
  }

  const options = stage.options && typeof stage.options === 'object'
    ? stage.options as Record<string, any>
    : {};
  const contract = def.options_contract;
  if (contract) {
    const required = contract.required || [];
    for (const key of required) {
      if (!(key in options)) {
        errors.push(`Executor "${executor}" missing required option "${key}"`);
      }
    }

    const allowAdditional = contract.allow_additional ?? (contract.allowed ? false : true);
    if (!allowAdditional) {
      const allowedSet = new Set<string>([
        ...(contract.allowed || []),
        ...(contract.required || []),
      ]);
      for (const key of Object.keys(options)) {
        if (!allowedSet.has(key)) {
          errors.push(`Executor "${executor}" received unsupported option "${key}"`);
        }
      }
    }
  }

  return errors;
}
