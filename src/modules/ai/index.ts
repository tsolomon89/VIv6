/**
 * AI Module
 *
 * Provides AI agent integration for VIv5/Oblio.
 *
 * Features:
 * - Secure API key storage (AES-256-GCM encrypted)
 * - Multi-provider support (OpenAI, Anthropic, Google)
 * - Activity-based execution (AI state stored in Activity.data.ai_execution)
 * - Chat sessions as Activities (Activity.data.ai_chat_messages)
 *
 * Architecture:
 * - AI agents ARE Contacts with is_ai_agent=true
 * - Execution context stored in Activity data (homoiconic pattern)
 * - No separate ai_jobs or ai_chat_sessions tables
 */

// Types
export * from './types.js';

// Credentials
export {
    encryptApiKey,
    decryptApiKey,
    generateKeyHint,
    maskApiKey,
} from './credentials/encryption.js';

export {
    listCredentials,
    getCredential,
    getDefaultCredential,
    getDecryptedKey,
    createCredential,
    updateCredential,
    rotateCredentialKey,
    deleteCredential,
    recordUsage,
    isOverBudget,
} from './credentials/service.js';

// Providers
export {
    getProvider,
    getDefaultModel,
    getAvailableModels,
    DEFAULT_MODELS,
    MODEL_INFO,
    estimateCost,
} from './providers/index.js';

// Execution
export {
    getMCPToolDefinitions,
    convertToProviderTools,
    executeMCPTool,
    MCP_TOOL_NAMES,
    isValidTool,
    getToolsByCategory,
} from './execution/mcp-bridge.js';

export {
    executeActivity,
    executeMessage,
    getAgentConfig,
} from './execution/engine.js';

export {
    buildSystemPrompt,
    buildActivityPrompt,
    buildChatPrompt,
} from './execution/prompts.js';

// Scheduler
export {
    processPendingAIActivities,
    processActivity,
    startScheduler,
    stopScheduler,
    isSchedulerRunning,
    getSchedulerAccountId,
} from './execution/scheduler.js';

// Activity Integration
export {
    isAIAgent,
    handleActivityAssignment,
    processPendingActivities,
    executeQueuedActivity,
    updateActivityFromExecution,
    createApprovalActivity,
    getPendingAIActivities,
    getRunningAIActivities,
} from './activity/integration.js';

// Qualifier Evaluation
export {
    isOblioQualifier,
    parseQualifierPath,
    resolveTargetRecord,
    getFieldValue,
    evaluateCondition,
    evaluateOblioQualifier,
    evaluateSimpleQualifier,
    evaluateAllQualifiers,
    evaluateActivityAfterExecution,
    createNonNullQualifier,
    createEqualityQualifier,
} from './activity/qualifiers.js';

// Approvals (Tier-1 Workflow)
export {
    getApprovalRules,
    evaluateApprovalRules,
    calculateAverageConfidence,
    generateApprovalActivity,
    checkAndCreateApproval,
    handleApprovalDecision,
    listPendingApprovals,
} from './activity/approvals.js';

// Templates
export {
    AGENT_TEMPLATES,
    getTemplate,
    getTemplatesByTag,
    getTemplatesByDepartment,
} from './templates/index.js';

export type { AgentTemplate } from './templates/index.js';

// Usage Tracking
export {
    logUsage,
    getUsageSummary,
    getUsageHistory,
    getCredentialUsage,
    getAgentUsage,
    getRecentUsage,
} from './usage/service.js';

// --- AI Hooks Registration ---
import { hooks } from '../../core/hooks.js';
import type { DataRecordInput, DataRecord } from '../../core/types.js';

/**
 * Register hooks to trigger AI execution when Activities are assigned to AI agents.
 *
 * This should be called once during server startup (e.g., in server.ts).
 *
 * Hooks registered:
 * - onPostCreate('activity') - Queue execution if assigned to AI agent
 * - onPostUpdate('activity') - Queue execution if assigned_to changed to AI agent
 */
export function registerAIHooks(): void {
    // Hook: On Activity Create - check if assigned to AI agent
    hooks.onPostCreate('activity', async (record: DataRecordInput | DataRecord) => {
        const data = record.data as any;
        const assignedTo = data?.assigned_to;

        if (!assignedTo) return;

        // Check if assigned to an AI agent and queue execution
        if (isAIAgent(assignedTo)) {
            console.log(`[AI] Activity ${(record as DataRecord).id} assigned to AI agent, queueing...`);
            await handleActivityAssignment((record as DataRecord).id);
        }
    });

    // Hook: On Activity Update - check if assigned_to changed to AI agent
    hooks.onPostUpdate('activity', async (record: DataRecordInput | DataRecord, context?: any) => {
        const data = record.data as any;
        const assignedTo = data?.assigned_to;

        if (!assignedTo) return;

        // Check previous value to avoid re-triggering on unrelated updates
        const previousAssignedTo = context?.previousRecord?.data?.assigned_to;
        if (assignedTo === previousAssignedTo) return;

        // Check if newly assigned to an AI agent
        if (isAIAgent(assignedTo)) {
            console.log(`[AI] Activity ${(record as DataRecord).id} reassigned to AI agent, queueing...`);
            await handleActivityAssignment((record as DataRecord).id);
        }
    });

    console.log('[AI] Activity hooks registered.');
}
