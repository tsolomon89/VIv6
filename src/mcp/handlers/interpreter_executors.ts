/**
 * MCP Interpreter Executor Tool Handlers
 *
 * Provides parity with API-level executor discovery and stage validation.
 */

import { DEFAULT_ACCOUNT_ID } from '../../core/constants.js';
import { BUILTIN_INTERPRETER_EXECUTORS } from '../../core/config_registry.js';
import { hasInterpreterExecutor, listInterpreterExecutors } from '../../modules/ops/interpreter_executor_registry.js';
import {
  getInterpreterExecutorDefinition,
  listInterpreterExecutorDefinitions,
  validateInterpreterStageAgainstDefinition,
} from '../../modules/ops/interpreter_executor_definitions.js';
import { InterpreterEvent } from '../../modules/ops/interpreter_pipeline.js';

const VALID_EVENTS = new Set<InterpreterEvent>([
  'pre_create',
  'post_create',
  'pre_update',
  'post_update',
  'pre_delete',
  'post_delete',
]);

export interface ListInterpreterExecutorsResult {
  count: number;
  executors: Array<{
    key: string;
    isBuiltin: boolean;
    isRegistered: boolean;
    hasDefinition: boolean;
    isActive: boolean | null;
    supportedEvents: string[];
    supportedEntityTypes: string[];
    optionsContract: Record<string, any> | null;
    description: string | null;
  }>;
}

export interface ValidateInterpreterStageArgs {
  accountId?: string;
  event: InterpreterEvent;
  ObjectType: string;
  stage: {
    executor: string;
    order?: number;
    options?: Record<string, any>;
  };
}

export interface ValidateInterpreterStageResult {
  valid: boolean;
  errors: string[];
  executor: {
    key: string;
    isBuiltin: boolean;
    isRegistered: boolean;
    hasDefinition: boolean;
    definition: Record<string, any> | null;
  };
}

export function listInterpreterExecutorsHandler(accountId: string = DEFAULT_ACCOUNT_ID): ListInterpreterExecutorsResult {
  const definitions = listInterpreterExecutorDefinitions(accountId);
  const definitionMap = new Map(definitions.map(def => [def.key, def]));

  const keys = new Set<string>([
    ...BUILTIN_INTERPRETER_EXECUTORS,
    ...listInterpreterExecutors(),
    ...definitions.map(def => def.key),
  ]);

  const executors = Array.from(keys)
    .sort((a, b) => a.localeCompare(b))
    .map(key => {
      const definition = definitionMap.get(key);
      const isBuiltin = (BUILTIN_INTERPRETER_EXECUTORS as readonly string[]).includes(key);
      const isRegistered = hasInterpreterExecutor(key);

      return {
        key,
        isBuiltin,
        isRegistered,
        hasDefinition: !!definition,
        isActive: definition?.is_active ?? null,
        supportedEvents: definition?.supported_events || [],
        supportedEntityTypes: definition?.supported_entity_types || [],
        optionsContract: definition?.options_contract || null,
        description: definition?.description || null,
      };
    });

  return {
    count: executors.length,
    executors,
  };
}

export function validateInterpreterStageHandler(args: ValidateInterpreterStageArgs): ValidateInterpreterStageResult {
  const accountId = args.accountId || DEFAULT_ACCOUNT_ID;
  const event = args.event;
  const ObjectType = args.ObjectType;
  const stage = args.stage;

  if (!VALID_EVENTS.has(event)) {
    throw new Error(`Invalid event: ${event}`);
  }

  if (!ObjectType || typeof ObjectType !== 'string') {
    throw new Error('ObjectType is required');
  }

  if (!stage || typeof stage.executor !== 'string' || !stage.executor.trim()) {
    throw new Error('stage.executor is required');
  }

  const executorKey = stage.executor.trim();
  const isBuiltin = (BUILTIN_INTERPRETER_EXECUTORS as readonly string[]).includes(executorKey);
  const isRegistered = hasInterpreterExecutor(executorKey);
  const definition = getInterpreterExecutorDefinition(executorKey, accountId);

  const errors = validateInterpreterStageAgainstDefinition({
    accountId,
    event,
    ObjectType,
    stage: {
      executor: executorKey,
      order: typeof stage.order === 'number' ? stage.order : 0,
      enabled: true,
      options: stage.options,
    },
  });

  if (!isBuiltin && !isRegistered) {
    errors.push(`No runtime executor registered for "${executorKey}"`);
  }

  return {
    valid: errors.length === 0,
    errors: Array.from(new Set(errors)),
    executor: {
      key: executorKey,
      isBuiltin,
      isRegistered,
      hasDefinition: !!definition,
      definition: definition || null,
    },
  };
}


