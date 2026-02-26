/**
 * AI Module API Routes
 *
 * Endpoints:
 * Credentials:
 * - GET /ai/credentials - List credentials for account
 * - POST /ai/credentials - Create new credential
 * - PUT /ai/credentials/:id - Update credential
 * - DELETE /ai/credentials/:id - Delete credential
 * - POST /ai/credentials/:id/test - Test credential validity
 *
 * Activities (AI Execution):
 * - GET /ai/activities/pending - List pending AI activities
 * - GET /ai/activities/running - List running AI activities
 * - POST /ai/activities/:id/queue - Queue activity for AI execution
 * - POST /ai/activities/:id/execute - Trigger execution of an activity
 * - GET /ai/activities/:id/status - Get execution status
 * - POST /ai/activities/:id/evaluate - Evaluate qualifiers for an activity
 *
 * Scheduler:
 * - POST /ai/scheduler/run - Manually process all pending activities
 * - POST /ai/scheduler/start - Start background scheduler
 * - POST /ai/scheduler/stop - Stop background scheduler
 * - GET /ai/scheduler/status - Get scheduler status
 *
 * Chat:
 * - POST /ai/chat/:activityId/message - Send message and get response
 * - GET /ai/chat/:activityId/history - Get chat history
 * - POST /ai/chat/:activityId/clear - Clear chat history
 * - POST /ai/chat/:activityId/close - Close chat session
 * - GET /ai/chat/:activityId/stream - Stream response via SSE
 * - POST /ai/chat/:activityId/stream - Stream response via SSE (POST variant)
 *
 * Providers:
 * - GET /ai/providers - List available providers and models
 */

import { Router } from 'express';
import { parseSession, requireSession, loadODAC, requireCapability } from '../../auth/middleware.js';
import {
    listCredentials,
    getCredential,
    createCredential,
    updateCredential,
    deleteCredential,
    getDecryptedKey,
} from '../credentials/service.js';
import { getProvider, getAvailableModels } from '../providers/index.js';
import {
    getPendingAIActivities,
    getRunningAIActivities,
    executeQueuedActivity,
    handleActivityAssignment,
} from '../activity/integration.js';
import {
    processPendingAIActivities,
    startScheduler,
    stopScheduler,
    isSchedulerRunning,
    getSchedulerAccountId,
} from '../execution/scheduler.js';
import { evaluateAllQualifiers, evaluateActivityAfterExecution } from '../activity/qualifiers.js';
import { getRecord } from '../../../core/records.js';
import type { AIProviderName, AIActivityData } from '../types.js';

// Import chat and streaming routers
import chatRouter from './chat.js';
import streamingRouter from './streaming.js';

const router = Router();

// All AI routes require authentication and account context
router.use(parseSession, requireSession, loadODAC);

/**
 * GET /ai/credentials
 * List all credentials for the current account (keys masked)
 */
router.get('/credentials', requireCapability('admin:*'), (req, res) => {
    try {
        const accountId = req.odac?.accountId;
        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
        }

        const credentials = listCredentials(accountId);

        // Remove sensitive fields before sending
        const safeCredentials = credentials.map(c => ({
            id: c.id,
            provider: c.provider,
            name: c.name,
            keyHint: c.keyHint,
            isDefault: c.isDefault,
            tokenBudgetDaily: c.tokenBudgetDaily,
            costBudgetDaily: c.costBudgetDaily,
            usageTokensToday: c.usageTokensToday,
            lastUsedAt: c.lastUsedAt,
            createdAt: c.createdAt,
        }));

        res.json({ credentials: safeCredentials });
    } catch (error) {
        console.error('[AI] List credentials error:', error);
        res.status(500).json({ error: 'Failed to list credentials' });
    }
});

/**
 * POST /ai/credentials
 * Create a new credential
 */
router.post('/credentials', requireCapability('admin:*'), (req, res) => {
    try {
        const accountId = req.odac?.accountId;
        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
        }

        const { provider, apiKey, name, isDefault, tokenBudgetDaily, costBudgetDaily } = req.body;

        if (!provider || !apiKey) {
            return res.status(400).json({ error: 'provider and apiKey are required' });
        }

        if (!['openai', 'anthropic', 'google'].includes(provider)) {
            return res.status(400).json({ error: 'Invalid provider. Must be openai, anthropic, or google' });
        }

        const credential = createCredential({
            accountId,
            provider: provider as AIProviderName,
            apiKey,
            name,
            isDefault,
            tokenBudgetDaily,
            costBudgetDaily,
        });

        res.status(201).json({
            credential: {
                id: credential.id,
                provider: credential.provider,
                name: credential.name,
                keyHint: credential.keyHint,
                isDefault: credential.isDefault,
                tokenBudgetDaily: credential.tokenBudgetDaily,
                costBudgetDaily: credential.costBudgetDaily,
                createdAt: credential.createdAt,
            },
        });
    } catch (error) {
        console.error('[AI] Create credential error:', error);
        res.status(500).json({ error: 'Failed to create credential' });
    }
});

/**
 * PUT /ai/credentials/:id
 * Update a credential's metadata (not the key)
 */
router.put('/credentials/:id', requireCapability('admin:*'), (req, res) => {
    try {
        const id = req.params.id as string;
        const { name, isDefault, tokenBudgetDaily, costBudgetDaily } = req.body;

        const existing = getCredential(id);
        if (!existing) {
            return res.status(404).json({ error: 'Credential not found' });
        }

        // Verify ownership
        if (existing.accountId !== req.odac?.accountId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updated = updateCredential(id, {
            name,
            isDefault,
            tokenBudgetDaily,
            costBudgetDaily,
        });

        res.json({
            credential: {
                id: updated!.id,
                provider: updated!.provider,
                name: updated!.name,
                keyHint: updated!.keyHint,
                isDefault: updated!.isDefault,
                tokenBudgetDaily: updated!.tokenBudgetDaily,
                costBudgetDaily: updated!.costBudgetDaily,
                updatedAt: updated!.updatedAt,
            },
        });
    } catch (error) {
        console.error('[AI] Update credential error:', error);
        res.status(500).json({ error: 'Failed to update credential' });
    }
});

/**
 * DELETE /ai/credentials/:id
 * Soft-delete a credential
 */
router.delete('/credentials/:id', requireCapability('admin:*'), (req, res) => {
    try {
        const id = req.params.id as string;

        const existing = getCredential(id);
        if (!existing) {
            return res.status(404).json({ error: 'Credential not found' });
        }

        // Verify ownership
        if (existing.accountId !== req.odac?.accountId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const deleted = deleteCredential(id);
        if (!deleted) {
            return res.status(500).json({ error: 'Failed to delete credential' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('[AI] Delete credential error:', error);
        res.status(500).json({ error: 'Failed to delete credential' });
    }
});

/**
 * POST /ai/credentials/:id/test
 * Test a credential by making a minimal API call
 */
router.post('/credentials/:id/test', requireCapability('admin:*'), async (req, res) => {
    try {
        const id = req.params.id as string;

        const credential = getCredential(id);
        if (!credential) {
            return res.status(404).json({ error: 'Credential not found' });
        }

        // Verify ownership
        if (credential.accountId !== req.odac?.accountId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Decrypt the key and test
        const apiKey = getDecryptedKey(credential);
        const provider = getProvider(credential.provider, apiKey);
        const result = await provider.testConnection();

        res.json(result);
    } catch (error) {
        console.error('[AI] Test credential error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Test failed',
        });
    }
});

// ============================================================
// AI ACTIVITY ROUTES (replaces job routes)
// ============================================================

/**
 * GET /ai/activities/pending
 * List activities queued for AI execution
 */
router.get('/activities/pending', requireCapability('admin:*'), (req, res) => {
    try {
        const accountId = req.odac?.accountId;
        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
        }

        const activities = getPendingAIActivities(accountId);
        res.json({ activities });
    } catch (error) {
        console.error('[AI] List pending activities error:', error);
        res.status(500).json({ error: 'Failed to list pending activities' });
    }
});

/**
 * GET /ai/activities/running
 * List activities currently being executed by AI
 */
router.get('/activities/running', requireCapability('admin:*'), (req, res) => {
    try {
        const accountId = req.odac?.accountId;
        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
        }

        const activities = getRunningAIActivities(accountId);
        res.json({ activities });
    } catch (error) {
        console.error('[AI] List running activities error:', error);
        res.status(500).json({ error: 'Failed to list running activities' });
    }
});

/**
 * GET /ai/activities/:id/status
 * Get AI execution status for an activity
 */
router.get('/activities/:id/status', requireCapability('admin:*'), (req, res) => {
    try {
        const id = req.params.id as string;
        const activity = getRecord(id);

        if (!activity || activity.type !== 'activity') {
            return res.status(404).json({ error: 'Activity not found' });
        }

        // Verify ownership
        if (activity.account_id !== req.odac?.accountId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const data = activity.data as AIActivityData;
        const execution = data.ai_execution;

        if (!execution) {
            return res.json({
                hasAIExecution: false,
                status: null,
            });
        }

        res.json({
            hasAIExecution: true,
            status: execution.status,
            queuedAt: execution.queuedAt,
            startedAt: execution.startedAt,
            completedAt: execution.completedAt,
            iterations: execution.iterations,
            tokenUsage: execution.tokenUsage,
            costEstimate: execution.costEstimate,
            errorMessage: execution.errorMessage,
        });
    } catch (error) {
        console.error('[AI] Get activity status error:', error);
        res.status(500).json({ error: 'Failed to get activity status' });
    }
});

/**
 * POST /ai/activities/:id/queue
 * Queue an activity for AI execution
 */
router.post('/activities/:id/queue', requireCapability('admin:*'), async (req, res) => {
    try {
        const id = req.params.id as string;
        const activity = getRecord(id);

        if (!activity || activity.type !== 'activity') {
            return res.status(404).json({ error: 'Activity not found' });
        }

        // Verify ownership
        if (activity.account_id !== req.odac?.accountId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const queued = await handleActivityAssignment(id);
        if (!queued) {
            return res.status(400).json({
                error: 'Activity could not be queued. Check if it is assigned to an AI agent.',
            });
        }

        res.json({ success: true, queued: true });
    } catch (error) {
        console.error('[AI] Queue activity error:', error);
        res.status(500).json({ error: 'Failed to queue activity' });
    }
});

/**
 * POST /ai/activities/:id/execute
 * Trigger immediate execution of an activity
 */
router.post('/activities/:id/execute', requireCapability('admin:*'), async (req, res) => {
    try {
        const id = req.params.id as string;
        const activity = getRecord(id);

        if (!activity || activity.type !== 'activity') {
            return res.status(404).json({ error: 'Activity not found' });
        }

        // Verify ownership
        if (activity.account_id !== req.odac?.accountId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const data = activity.data as AIActivityData;

        // If not queued, queue it first
        if (!data.ai_execution || data.ai_execution.status !== 'pending') {
            const queued = await handleActivityAssignment(id);
            if (!queued) {
                return res.status(400).json({
                    error: 'Activity could not be queued for AI execution.',
                });
            }
        }

        // Execute the activity (includes qualifier evaluation)
        const result = await executeQueuedActivity(id);

        if (!result) {
            return res.status(500).json({ error: 'Execution failed' });
        }

        res.json({
            success: result.success,
            iterations: result.iterations,
            tokenUsage: result.tokenUsage,
            costEstimate: result.costEstimate,
            error: result.error,
            // Qualifier evaluation results (if execution succeeded)
            won: result.won,
            qualifierResult: result.qualifierResult,
        });
    } catch (error) {
        console.error('[AI] Execute activity error:', error);
        res.status(500).json({ error: 'Failed to execute activity' });
    }
});

// ============================================================
// QUALIFIER EVALUATION ROUTES
// ============================================================

/**
 * POST /ai/activities/:id/evaluate
 * Evaluate qualifiers for an activity (without re-executing AI)
 */
router.post('/activities/:id/evaluate', requireCapability('admin:*'), async (req, res) => {
    try {
        const id = req.params.id as string;
        const accountId = req.odac?.accountId;

        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
        }

        const activity = getRecord(id);
        if (!activity || activity.type !== 'activity') {
            return res.status(404).json({ error: 'Activity not found' });
        }

        // Verify ownership
        if (activity.account_id !== accountId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Evaluate qualifiers
        const result = evaluateAllQualifiers(id, accountId);

        res.json({
            activityId: id,
            allPassed: result.allPassed,
            won: result.allPassed,
            results: result.results,
            evaluatedAt: result.evaluatedAt,
        });
    } catch (error) {
        console.error('[AI] Evaluate qualifiers error:', error);
        res.status(500).json({ error: 'Failed to evaluate qualifiers' });
    }
});

// ============================================================
// SCHEDULER ROUTES
// ============================================================

/**
 * POST /ai/scheduler/run
 * Manually trigger processing of all pending AI activities
 */
router.post('/scheduler/run', requireCapability('admin:*'), async (req, res) => {
    try {
        const accountId = req.odac?.accountId;
        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
        }

        const result = await processPendingAIActivities(accountId);

        res.json({
            success: true,
            processed: result.processed,
            succeeded: result.succeeded,
            failed: result.failed,
            won: result.won,
            details: result.details,
        });
    } catch (error) {
        console.error('[AI] Scheduler run error:', error);
        res.status(500).json({ error: 'Failed to run scheduler' });
    }
});

/**
 * POST /ai/scheduler/start
 * Start background scheduler for automatic processing
 */
router.post('/scheduler/start', requireCapability('admin:*'), (req, res) => {
    try {
        const accountId = req.odac?.accountId;
        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
        }

        const intervalMs = req.body.intervalMs || 30000;

        if (isSchedulerRunning()) {
            return res.status(400).json({
                error: 'Scheduler is already running',
                accountId: getSchedulerAccountId(),
            });
        }

        startScheduler(accountId, intervalMs);

        res.json({
            success: true,
            running: true,
            accountId,
            intervalMs,
        });
    } catch (error) {
        console.error('[AI] Start scheduler error:', error);
        res.status(500).json({ error: 'Failed to start scheduler' });
    }
});

/**
 * POST /ai/scheduler/stop
 * Stop the background scheduler
 */
router.post('/scheduler/stop', requireCapability('admin:*'), (req, res) => {
    try {
        if (!isSchedulerRunning()) {
            return res.status(400).json({ error: 'Scheduler is not running' });
        }

        stopScheduler();

        res.json({ success: true, running: false });
    } catch (error) {
        console.error('[AI] Stop scheduler error:', error);
        res.status(500).json({ error: 'Failed to stop scheduler' });
    }
});

/**
 * GET /ai/scheduler/status
 * Get current scheduler status
 */
router.get('/scheduler/status', requireCapability('admin:*'), (req, res) => {
    res.json({
        running: isSchedulerRunning(),
        accountId: getSchedulerAccountId(),
    });
});

// ============================================================
// PROVIDER ROUTES
// ============================================================

/**
 * GET /ai/providers
 * List available providers and their models
 */
router.get('/providers', (req, res) => {
    res.json({
        providers: [
            {
                name: 'openai',
                displayName: 'OpenAI',
                models: getAvailableModels('openai'),
            },
            {
                name: 'anthropic',
                displayName: 'Anthropic',
                models: getAvailableModels('anthropic'),
            },
            {
                name: 'google',
                displayName: 'Google',
                models: getAvailableModels('google'),
            },
        ],
    });
});

// ============================================================
// CHAT ROUTES
// ============================================================

// Mount chat router: /ai/chat/:activityId/message, /ai/chat/:activityId/history, etc.
router.use('/chat', chatRouter);

// Mount streaming router: /ai/chat/:activityId/stream
router.use('/chat', streamingRouter);

// ============================================================
// APPROVAL ROUTES
// ============================================================

import {
    listPendingApprovals,
    handleApprovalDecision,
    checkAndCreateApproval,
} from '../activity/approvals.js';

/**
 * GET /ai/approvals/pending
 * List pending approval activities for the account
 */
router.get('/approvals/pending', requireCapability('admin:*'), (req, res) => {
    try {
        const accountId = req.odac?.accountId;
        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
        }

        const approvals = listPendingApprovals(accountId);
        res.json({ approvals });
    } catch (error) {
        console.error('[AI] List pending approvals error:', error);
        res.status(500).json({ error: 'Failed to list pending approvals' });
    }
});

/**
 * GET /ai/approvals/:id
 * Get specific approval activity with context
 */
router.get('/approvals/:id', requireCapability('admin:*'), (req, res) => {
    try {
        const id = req.params.id as string;
        const accountId = req.odac?.accountId;

        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
        }

        const activity = getRecord(id);
        if (!activity || activity.type !== 'activity') {
            return res.status(404).json({ error: 'Approval activity not found' });
        }

        // Verify ownership
        if (activity.account_id !== accountId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const data = activity.data as AIActivityData;
        const approvalContext = data.approval_context as Record<string, unknown> | undefined;

        if (!approvalContext) {
            return res.status(400).json({ error: 'Not an approval activity' });
        }

        res.json({
            id: activity.id,
            name: activity.name,
            status: data.status,
            originalActivityId: approvalContext.original_activity_id,
            triggeredRules: approvalContext.triggered_rules,
            proposedChanges: approvalContext.proposed_changes,
            toolCalls: approvalContext.tool_calls,
            confidence: approvalContext.confidence,
            agentId: approvalContext.agent_id,
            agentName: approvalContext.agent_name,
            createdAt: activity.created_at,
        });
    } catch (error) {
        console.error('[AI] Get approval error:', error);
        res.status(500).json({ error: 'Failed to get approval' });
    }
});

/**
 * POST /ai/approvals/:id/decide
 * Handle approval decision (approve or reject)
 */
router.post('/approvals/:id/decide', requireCapability('admin:*'), async (req, res) => {
    try {
        const id = req.params.id as string;
        const accountId = req.odac?.accountId;

        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
        }

        const { decision, comment } = req.body;

        if (!decision || !['approved', 'rejected'].includes(decision)) {
            return res.status(400).json({ error: 'decision must be "approved" or "rejected"' });
        }

        const activity = getRecord(id);
        if (!activity || activity.type !== 'activity') {
            return res.status(404).json({ error: 'Approval activity not found' });
        }

        // Verify ownership
        if (activity.account_id !== accountId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const success = await handleApprovalDecision(id, decision, comment);

        if (!success) {
            return res.status(500).json({ error: 'Failed to process approval decision' });
        }

        res.json({
            success: true,
            decision,
            approvalActivityId: id,
        });
    } catch (error) {
        console.error('[AI] Handle approval decision error:', error);
        res.status(500).json({ error: 'Failed to handle approval decision' });
    }
});

// ============================================================
// TEMPLATE ROUTES
// ============================================================

import { AGENT_TEMPLATES, getTemplate, getTemplatesByTag, getTemplatesByDepartment } from '../templates/index.js';
import { createRecord } from '../../../core/records.js';

/**
 * GET /ai/templates
 * List all available agent templates
 */
router.get('/templates', (req, res) => {
    const tag = req.query.tag as string | undefined;
    const department = req.query.department as string | undefined;

    let templates = AGENT_TEMPLATES;

    if (tag) {
        templates = getTemplatesByTag(tag);
    } else if (department) {
        templates = getTemplatesByDepartment(department);
    }

    res.json({
        templates: templates.map(t => ({
            slug: t.slug,
            name: t.name,
            description: t.description,
            icon: t.icon,
            provider: t.provider,
            model: t.model,
            suggestedRole: t.suggestedRole,
            suggestedDepartment: t.suggestedDepartment,
            tags: t.tags,
            maxIterations: t.maxIterations,
            tokenBudget: t.tokenBudget,
            allowedTools: t.allowedTools,
        })),
    });
});

/**
 * GET /ai/templates/:slug
 * Get a specific template by slug
 */
router.get('/templates/:slug', (req, res) => {
    const slug = req.params.slug as string;
    const template = getTemplate(slug);

    if (!template) {
        return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });
});

/**
 * POST /ai/templates/:slug/instantiate
 * Create a new AI Agent Contact from a template
 */
router.post('/templates/:slug/instantiate', requireCapability('admin:*'), async (req, res) => {
    try {
        const slug = req.params.slug as string;
        const accountId = req.odac?.accountId;

        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
        }

        const template = getTemplate(slug);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        const { name, credentialId } = req.body;

        if (!credentialId) {
            return res.status(400).json({ error: 'credentialId is required' });
        }

        // Verify credential exists and belongs to account
        const credential = getCredential(credentialId);
        if (!credential || credential.accountId !== accountId) {
            return res.status(400).json({ error: 'Invalid credential' });
        }

        // Create the AI Agent Contact
        const agentSlug = `ai-agent-${slug}-${Date.now()}`;
        const contact = await createRecord({
            type: 'contact',
            account_id: accountId,
            slug: agentSlug,
            name: name || template.name,
            data: {
                name: name || template.name,
                is_ai_agent: true,
                ai_provider: template.provider,
                ai_model: template.model,
                ai_credential_id: credentialId,
                ai_system_prompt: template.systemPrompt,
                ai_allowed_tools: template.allowedTools,
                ai_max_iterations: template.maxIterations,
                ai_token_budget: template.tokenBudget,
                // Dimensions for pipeline routing
                job_title: template.suggestedRole,
                department: template.suggestedDepartment,
                // Template reference
                ai_template_slug: slug,
            },
        });

        res.status(201).json({
            agent: {
                id: contact.id,
                slug: contact.slug,
                name: contact.name,
                templateSlug: slug,
                provider: template.provider,
                model: template.model,
            },
        });
    } catch (error) {
        console.error('[AI] Instantiate template error:', error);
        res.status(500).json({ error: 'Failed to create AI agent' });
    }
});

// ============================================================
// USAGE ROUTES
// ============================================================

import {
    getUsageSummary,
    getUsageHistory,
    getCredentialUsage,
    getAgentUsage,
    getRecentUsage,
} from '../usage/service.js';

/**
 * GET /ai/usage/summary
 * Get usage summary (today, week, month)
 */
router.get('/usage/summary', requireCapability('admin:*'), (req, res) => {
    try {
        const accountId = req.odac?.accountId;
        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
        }

        const summary = getUsageSummary(accountId);
        res.json(summary);
    } catch (error) {
        console.error('[AI] Get usage summary error:', error);
        res.status(500).json({ error: 'Failed to get usage summary' });
    }
});

/**
 * GET /ai/usage/history
 * Get usage history for charting (time series)
 */
router.get('/usage/history', requireCapability('admin:*'), (req, res) => {
    try {
        const accountId = req.odac?.accountId;
        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
        }

        const days = parseInt(req.query.days as string) || 30;
        const history = getUsageHistory(accountId, days);

        res.json({ history });
    } catch (error) {
        console.error('[AI] Get usage history error:', error);
        res.status(500).json({ error: 'Failed to get usage history' });
    }
});

/**
 * GET /ai/usage/credentials
 * Get usage broken down by credential (for budget tracking)
 */
router.get('/usage/credentials', requireCapability('admin:*'), (req, res) => {
    try {
        const accountId = req.odac?.accountId;
        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
        }

        const credentials = getCredentialUsage(accountId);
        res.json({ credentials });
    } catch (error) {
        console.error('[AI] Get credential usage error:', error);
        res.status(500).json({ error: 'Failed to get credential usage' });
    }
});

/**
 * GET /ai/usage/agents
 * Get usage broken down by AI agent
 */
router.get('/usage/agents', requireCapability('admin:*'), (req, res) => {
    try {
        const accountId = req.odac?.accountId;
        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
        }

        const days = parseInt(req.query.days as string) || 30;
        const agents = getAgentUsage(accountId, days);

        res.json({ agents });
    } catch (error) {
        console.error('[AI] Get agent usage error:', error);
        res.status(500).json({ error: 'Failed to get agent usage' });
    }
});

/**
 * GET /ai/usage/recent
 * Get recent usage log entries (detailed view)
 */
router.get('/usage/recent', requireCapability('admin:*'), (req, res) => {
    try {
        const accountId = req.odac?.accountId;
        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
        }

        const limit = parseInt(req.query.limit as string) || 50;
        const entries = getRecentUsage(accountId, limit);

        res.json({ entries });
    } catch (error) {
        console.error('[AI] Get recent usage error:', error);
        res.status(500).json({ error: 'Failed to get recent usage' });
    }
});

export default router;
