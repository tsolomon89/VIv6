import { Router, Request, Response, NextFunction } from 'express';
import { DEFAULT_ACCOUNT_ID } from '../../core/constants.js';
import { BUILTIN_INTERPRETER_EXECUTORS } from '../../core/config_registry.js';
import { hasInterpreterExecutor, listInterpreterExecutors } from '../../modules/ops/interpreter_executor_registry.js';
import {
  getInterpreterExecutorDefinition,
  listInterpreterExecutorDefinitions,
  validateInterpreterStageAgainstDefinition,
} from '../../modules/ops/interpreter_executor_definitions.js';
import type { InterpreterEvent } from '../../modules/ops/interpreter_pipeline.js';

const router = Router();

const VALID_EVENTS = new Set<InterpreterEvent>([
  'pre_create',
  'post_create',
  'pre_update',
  'post_update',
  'pre_delete',
  'post_delete',
]);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const accountId = (req.query.account_id as string) || DEFAULT_ACCOUNT_ID;
    const definitions = listInterpreterExecutorDefinitions(accountId);
    const definitionMap = new Map(definitions.map(def => [def.key, def]));

    const keys = new Set<string>([
      ...BUILTIN_INTERPRETER_EXECUTORS,
      ...listInterpreterExecutors(),
      ...definitions.map(def => def.key),
    ]);

    const result = Array.from(keys)
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

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

router.post('/validate-stage', (req: Request, res: Response, next: NextFunction) => {
  try {
    const accountId = (req.body.account_id as string) || DEFAULT_ACCOUNT_ID;
    const event = req.body.event as InterpreterEvent;
    const entityType = req.body.entity_type as string;
    const stage = req.body.stage as { executor?: string; options?: Record<string, any>; order?: number };

    if (!VALID_EVENTS.has(event)) {
      res.status(400).json({ error: 'Invalid event' });
      return;
    }
    if (!entityType || typeof entityType !== 'string') {
      res.status(400).json({ error: 'entity_type is required' });
      return;
    }
    if (!stage || typeof stage.executor !== 'string' || !stage.executor.trim()) {
      res.status(400).json({ error: 'stage.executor is required' });
      return;
    }

    const errors = validateInterpreterStageAgainstDefinition({
      accountId,
      event,
      entityType,
      stage: {
        executor: stage.executor.trim(),
        order: typeof stage.order === 'number' ? stage.order : 0,
        enabled: true,
        options: stage.options,
      },
    });

    const executorKey = stage.executor.trim();
    const definition = getInterpreterExecutorDefinition(executorKey, accountId);
    const isBuiltin = (BUILTIN_INTERPRETER_EXECUTORS as readonly string[]).includes(executorKey);
    const isRegistered = hasInterpreterExecutor(executorKey);

    if (!isBuiltin && !isRegistered) {
      errors.push(`No runtime executor registered for "${executorKey}"`);
    }

    res.json({
      data: {
        valid: errors.length === 0,
        errors: Array.from(new Set(errors)),
        executor: {
          key: executorKey,
          isBuiltin,
          isRegistered,
          hasDefinition: !!definition,
          definition: definition || null,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
