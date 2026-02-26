
import { DataRecordInput, DataRecord, ConstraintTrigger } from './types.js';
import { executeMatchingRules, createRuleContext, TriggerEvent } from '../modules/ops/rules.js';
import { enforceConstraints } from '../modules/ops/constraints.js';
import { enforceStateMachine } from '../modules/ops/state_machine.js';
import { getInterpreterStagesForEvent, InterpreterEvent } from '../modules/ops/interpreter_pipeline.js';
import {
    executeInterpreterExecutor,
    hasInterpreterExecutor,
    registerInterpreterExecutor,
} from '../modules/ops/interpreter_executor_registry.js';
import { validateInterpreterStageAgainstDefinition } from '../modules/ops/interpreter_executor_definitions.js';
import { DEFAULT_ACCOUNT_ID } from './constants.js';

type RecordHook = (record: DataRecordInput | DataRecord, context?: any) => Promise<void> | void;

// Flags to enable/disable Rule and Constraint execution (useful for testing or migrations)
let rulesEnabled = true;
let constraintsEnabled = true;

export function enableRules(enabled: boolean) {
    rulesEnabled = enabled;
}

export function enableConstraints(enabled: boolean) {
    constraintsEnabled = enabled;
}

/**
 * Execute data-driven Constraints for a trigger event.
 * Constraints run BEFORE code hooks since they are validation (can block).
 */
function executeConstraintsForTrigger(
    trigger: ConstraintTrigger,
    record: DataRecordInput | DataRecord
): void {
    if (!constraintsEnabled) return;

    try {
        enforceConstraints({ record, trigger });
    } catch (error) {
        // Re-throw InvariantViolation (it should block the operation)
        if (error instanceof Error && error.name === 'InvariantViolation') {
            throw error;
        }
        // Log other errors but don't block
        console.error(`[Hooks] Error executing constraints for ${trigger}:`, error);
    }
}

/**
 * Execute data-driven Rules for an event
 */
async function executeRulesForEvent(
    event: TriggerEvent,
    record: DataRecordInput | DataRecord,
    previousRecord?: DataRecord,
    context?: any
): Promise<void> {
    if (!rulesEnabled) return;

    try {
        const accountId = (record as any).account_id || DEFAULT_ACCOUNT_ID;
        const ruleContext = createRuleContext(
            accountId,
            event,
            record,
            previousRecord,
            context?.userId
        );

        const results = await executeMatchingRules(ruleContext);

        // Log rule execution results for debugging
        const triggered = results.filter(r => r.triggered && r.conditionsMet);
        if (triggered.length > 0) {
            console.log(`[Hooks] Executed ${triggered.length} rules for ${event}:${(record as any).type}`);
        }
    } catch (error) {
        // Rule errors shouldn't break the main operation
        console.error(`[Hooks] Error executing rules for ${event}:`, error);
    }
}

async function executeCodeHooks(
    hookRegistry: Record<string, RecordHook[]>,
    type: string,
    record: DataRecordInput | DataRecord,
    context?: any
): Promise<void> {
    if (!hookRegistry[type]) return;
    for (const hook of hookRegistry[type]) {
        await hook(record, context);
    }
}

function getConstraintTriggerForEvent(event: InterpreterEvent): ConstraintTrigger | null {
    switch (event) {
        case 'pre_create':
            return 'pre_create';
        case 'pre_update':
            return 'pre_update';
        default:
            return null;
    }
}

async function emitLifecycleEvent(params: {
    event: InterpreterEvent;
    type: string;
    record: DataRecordInput | DataRecord;
    previousRecord?: DataRecord;
    context?: any;
    hookRegistry: Record<string, RecordHook[]>;
}): Promise<void> {
    const { event, type, record, previousRecord, context, hookRegistry } = params;
    ensureBuiltInInterpreterExecutors();
    const accountId = (record as any).account_id || context?.account_id || DEFAULT_ACCOUNT_ID;
    const stages = getInterpreterStagesForEvent(event, accountId, type);

    for (const stage of stages) {
        try {
            const definitionErrors = validateInterpreterStageAgainstDefinition({
                accountId,
                event,
                entityType: type,
                stage,
            });
            if (definitionErrors.length > 0) {
                throw new Error(definitionErrors.join('; '));
            }

            await executeInterpreterExecutor(stage.executor, {
                event,
                type,
                stage,
                record,
                previousRecord,
                context,
                runCodeHooks: async () => executeCodeHooks(hookRegistry, type, record, context),
            });
        } catch (error) {
            if (stage.blocking === false) {
                console.error(`[Hooks] Non-blocking stage failed (${event}:${stage.executor}):`, error);
                continue;
            }
            throw error;
        }
    }
}

let builtInExecutorsRegistered = false;

function ensureBuiltInInterpreterExecutors(): void {
    if (builtInExecutorsRegistered) return;

    if (!hasInterpreterExecutor('constraints')) {
        registerInterpreterExecutor('constraints', ({ event, record }) => {
            const trigger = getConstraintTriggerForEvent(event);
            if (trigger) {
                executeConstraintsForTrigger(trigger, record);
            }
        });
    }

    if (!hasInterpreterExecutor('state_machine')) {
        registerInterpreterExecutor('state_machine', ({ event, record, previousRecord }) => {
            if (event === 'pre_update') {
                enforceStateMachine(record as DataRecordInput, previousRecord);
            }
        });
    }

    if (!hasInterpreterExecutor('code_hooks')) {
        registerInterpreterExecutor('code_hooks', async ({ runCodeHooks }) => {
            await runCodeHooks();
        });
    }

    if (!hasInterpreterExecutor('rules')) {
        registerInterpreterExecutor('rules', async ({ event, record, previousRecord, context }) => {
            await executeRulesForEvent(event, record, previousRecord, context);
        });
    }

    builtInExecutorsRegistered = true;
}

const preCreateHooks: Record<string, RecordHook[]> = {};
const postCreateHooks: Record<string, RecordHook[]> = {};
const preUpdateHooks: Record<string, RecordHook[]> = {};
const postUpdateHooks: Record<string, RecordHook[]> = {};
const preDeleteHooks: Record<string, RecordHook[]> = {};
const postDeleteHooks: Record<string, RecordHook[]> = {};

export const hooks = {
  onPreCreate: (type: string, fn: RecordHook) => {
    if (!preCreateHooks[type]) preCreateHooks[type] = [];
    preCreateHooks[type].push(fn);
  },
  
  onPostCreate: (type: string, fn: RecordHook) => {
    if (!postCreateHooks[type]) postCreateHooks[type] = [];
    postCreateHooks[type].push(fn);
  },

  onPreUpdate: (type: string, fn: RecordHook) => {
    if (!preUpdateHooks[type]) preUpdateHooks[type] = [];
    preUpdateHooks[type].push(fn);
  },

  onPostUpdate: (type: string, fn: RecordHook) => {
    if (!postUpdateHooks[type]) postUpdateHooks[type] = [];
    postUpdateHooks[type].push(fn);
  },

  onPreDelete: (type: string, fn: RecordHook) => {
    if (!preDeleteHooks[type]) preDeleteHooks[type] = [];
    preDeleteHooks[type].push(fn);
  },

  onPostDelete: (type: string, fn: RecordHook) => {
    if (!postDeleteHooks[type]) postDeleteHooks[type] = [];
    postDeleteHooks[type].push(fn);
  },

  emitPreCreate: async (type: string, record: DataRecordInput, context?: any) => {
    await emitLifecycleEvent({
      event: 'pre_create',
      type,
      record,
      context,
      hookRegistry: preCreateHooks,
    });
  },

  emitPostCreate: async (type: string, record: DataRecord, context?: any) => {
    await emitLifecycleEvent({
      event: 'post_create',
      type,
      record,
      context,
      hookRegistry: postCreateHooks,
    });
  },

  emitPreUpdate: async (type: string, record: DataRecordInput, context?: any) => {
    await emitLifecycleEvent({
      event: 'pre_update',
      type,
      record,
      previousRecord: context?.previousRecord,
      context,
      hookRegistry: preUpdateHooks,
    });
  },

  emitPostUpdate: async (type: string, record: DataRecord, context?: any) => {
    await emitLifecycleEvent({
      event: 'post_update',
      type,
      record,
      previousRecord: context?.previousRecord,
      context,
      hookRegistry: postUpdateHooks,
    });
  },

  emitPreDelete: async (type: string, record: DataRecordInput | DataRecord, context?: any) => {
    await emitLifecycleEvent({
      event: 'pre_delete',
      type,
      record,
      context,
      hookRegistry: preDeleteHooks,
    });
  },

  emitPostDelete: async (type: string, record: DataRecordInput | DataRecord, context?: any) => {
    await emitLifecycleEvent({
      event: 'post_delete',
      type,
      record,
      context,
      hookRegistry: postDeleteHooks,
    });
  }
};
