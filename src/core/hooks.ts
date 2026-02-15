
import { DataRecordInput, DataRecord } from './types.js';
import { executeMatchingRules, createRuleContext, TriggerEvent } from '../modules/ops/rules.js';
import { DEFAULT_ACCOUNT_ID } from './constants.js';

type RecordHook = (record: DataRecordInput | DataRecord, context?: any) => Promise<void> | void;

// Flag to enable/disable Rule execution (useful for testing or migrations)
let rulesEnabled = true;

export function enableRules(enabled: boolean) {
    rulesEnabled = enabled;
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
    // Execute code-based hooks first
    if (preCreateHooks[type]) {
      for (const hook of preCreateHooks[type]) {
        await hook(record, context);
      }
    }
    // Execute data-driven Rules
    await executeRulesForEvent('pre_create', record, undefined, context);
  },

  emitPostCreate: async (type: string, record: DataRecord, context?: any) => {
    // Execute code-based hooks first
    if (postCreateHooks[type]) {
      for (const hook of postCreateHooks[type]) {
        await hook(record, context);
      }
    }
    // Execute data-driven Rules
    await executeRulesForEvent('post_create', record, undefined, context);
  },

  emitPreUpdate: async (type: string, record: DataRecordInput, context?: any) => {
    // Execute code-based hooks first
    if (preUpdateHooks[type]) {
      for (const hook of preUpdateHooks[type]) {
        await hook(record, context);
      }
    }
    // Execute data-driven Rules (previousRecord is in context for updates)
    await executeRulesForEvent('pre_update', record, context?.previousRecord, context);
  },

  emitPostUpdate: async (type: string, record: DataRecord, context?: any) => {
    // Execute code-based hooks first
    if (postUpdateHooks[type]) {
      for (const hook of postUpdateHooks[type]) {
        await hook(record, context);
      }
    }
    // Execute data-driven Rules
    await executeRulesForEvent('post_update', record, context?.previousRecord, context);
  },

  emitPreDelete: async (type: string, record: DataRecordInput | DataRecord, context?: any) => {
    // Execute code-based hooks first
    if (preDeleteHooks[type]) {
      for (const hook of preDeleteHooks[type]) {
        await hook(record, context);
      }
    }
    // Execute data-driven Rules
    await executeRulesForEvent('pre_delete', record, undefined, context);
  },

  emitPostDelete: async (type: string, record: DataRecordInput | DataRecord, context?: any) => {
    // Execute code-based hooks first
    if (postDeleteHooks[type]) {
      for (const hook of postDeleteHooks[type]) {
        await hook(record, context);
      }
    }
    // Execute data-driven Rules
    await executeRulesForEvent('post_delete', record, undefined, context);
  }
};
