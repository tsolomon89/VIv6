/**
 * AI Usage Tracking Service
 *
 * Logs and queries AI token usage for the dashboard.
 * Stores historical data in ai_usage_log table.
 */

import * as crypto from 'crypto';
import { db } from '../../../core/db.js';
import { listCredentials } from '../credentials/service.js';
import type {
    UsageLogEntry,
    UsageSummary,
    UsageHistory,
    CredentialUsage,
    UsageOperationType,
    TokenUsage,
    AIProviderName,
} from '../types.js';

/**
 * Log a usage event to the ai_usage_log table.
 */
export function logUsage(params: {
    accountId: string;
    credentialId: string;
    agentId?: string;
    activityId?: string;
    model: string;
    tokenUsage: TokenUsage;
    costEstimate: number;
    operationType: UsageOperationType;
    success: boolean;
    errorMessage?: string;
}): UsageLogEntry {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const tokensPrompt = params.tokenUsage.promptTokens ?? 0;
    const tokensCompletion = params.tokenUsage.completionTokens ?? 0;
    const tokensTotal = params.tokenUsage.total ?? (tokensPrompt + tokensCompletion);

    db.prepare(`
        INSERT INTO ai_usage_log (
            id, account_id, credential_id, agent_id, activity_id,
            model, tokens_prompt, tokens_completion, tokens_total,
            cost_estimate, operation_type, success, error_message, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        id,
        params.accountId,
        params.credentialId,
        params.agentId || null,
        params.activityId || null,
        params.model,
        tokensPrompt,
        tokensCompletion,
        tokensTotal,
        params.costEstimate,
        params.operationType,
        params.success ? 1 : 0,
        params.errorMessage || null,
        now
    );

    return {
        id,
        accountId: params.accountId,
        credentialId: params.credentialId,
        agentId: params.agentId || null,
        activityId: params.activityId || null,
        model: params.model,
        tokensPrompt,
        tokensCompletion,
        tokensTotal,
        costEstimate: params.costEstimate,
        operationType: params.operationType,
        success: params.success,
        errorMessage: params.errorMessage || null,
        createdAt: now,
    };
}

/**
 * Get usage summary for an account.
 */
export function getUsageSummary(accountId: string): UsageSummary {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Today's usage
    const todayStats = db.prepare(`
        SELECT
            COALESCE(SUM(tokens_total), 0) as tokens,
            COALESCE(SUM(cost_estimate), 0) as cost,
            COUNT(*) as operations
        FROM ai_usage_log
        WHERE account_id = ? AND date(created_at) = date(?)
    `).get(accountId, today) as { tokens: number; cost: number; operations: number };

    // This week's usage
    const weekStats = db.prepare(`
        SELECT
            COALESCE(SUM(tokens_total), 0) as tokens,
            COALESCE(SUM(cost_estimate), 0) as cost,
            COUNT(*) as operations
        FROM ai_usage_log
        WHERE account_id = ? AND date(created_at) >= date(?)
    `).get(accountId, weekAgo) as { tokens: number; cost: number; operations: number };

    // This month's usage
    const monthStats = db.prepare(`
        SELECT
            COALESCE(SUM(tokens_total), 0) as tokens,
            COALESCE(SUM(cost_estimate), 0) as cost,
            COUNT(*) as operations
        FROM ai_usage_log
        WHERE account_id = ? AND date(created_at) >= date(?)
    `).get(accountId, monthAgo) as { tokens: number; cost: number; operations: number };

    // Usage by provider (via credential join)
    const byProviderRows = db.prepare(`
        SELECT
            c.provider,
            COALESCE(SUM(u.tokens_total), 0) as tokens,
            COALESCE(SUM(u.cost_estimate), 0) as cost
        FROM ai_usage_log u
        JOIN ai_credentials c ON u.credential_id = c.id
        WHERE u.account_id = ? AND date(u.created_at) >= date(?)
        GROUP BY c.provider
    `).all(accountId, monthAgo) as Array<{ provider: string; tokens: number; cost: number }>;

    const byProvider: Record<string, { tokens: number; cost: number }> = {};
    for (const row of byProviderRows) {
        byProvider[row.provider] = { tokens: row.tokens, cost: row.cost };
    }

    // Usage by model
    const byModelRows = db.prepare(`
        SELECT
            model,
            COALESCE(SUM(tokens_total), 0) as tokens,
            COALESCE(SUM(cost_estimate), 0) as cost
        FROM ai_usage_log
        WHERE account_id = ? AND date(created_at) >= date(?)
        GROUP BY model
    `).all(accountId, monthAgo) as Array<{ model: string; tokens: number; cost: number }>;

    const byModel: Record<string, { tokens: number; cost: number }> = {};
    for (const row of byModelRows) {
        byModel[row.model] = { tokens: row.tokens, cost: row.cost };
    }

    return {
        today: todayStats,
        week: weekStats,
        month: monthStats,
        byProvider,
        byModel,
    };
}

/**
 * Get usage history (time series) for charting.
 */
export function getUsageHistory(accountId: string, days: number = 30): UsageHistory[] {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const rows = db.prepare(`
        SELECT
            date(created_at) as date,
            COALESCE(SUM(tokens_total), 0) as tokens,
            COALESCE(SUM(cost_estimate), 0) as cost,
            COUNT(*) as operations
        FROM ai_usage_log
        WHERE account_id = ? AND date(created_at) >= date(?)
        GROUP BY date(created_at)
        ORDER BY date(created_at) ASC
    `).all(accountId, startDate) as Array<{ date: string; tokens: number; cost: number; operations: number }>;

    return rows;
}

/**
 * Get usage broken down by credential (for budget tracking).
 */
export function getCredentialUsage(accountId: string): CredentialUsage[] {
    const today = new Date().toISOString().split('T')[0];

    const credentials = listCredentials(accountId);
    const result: CredentialUsage[] = [];

    for (const cred of credentials) {
        // Get today's usage for this credential
        const todayUsage = db.prepare(`
            SELECT
                COALESCE(SUM(tokens_total), 0) as tokens,
                COALESCE(SUM(cost_estimate), 0) as cost
            FROM ai_usage_log
            WHERE credential_id = ? AND date(created_at) = date(?)
        `).get(cred.id, today) as { tokens: number; cost: number };

        result.push({
            credentialId: cred.id,
            credentialName: cred.name,
            provider: cred.provider,
            tokensUsed: todayUsage.tokens + (cred.usageTokensToday || 0), // Include any manual updates
            tokenLimit: cred.tokenBudgetDaily,
            percentUsed: cred.tokenBudgetDaily
                ? Math.round(((todayUsage.tokens + (cred.usageTokensToday || 0)) / cred.tokenBudgetDaily) * 100)
                : null,
            costEstimate: todayUsage.cost,
        });
    }

    return result;
}

/**
 * Get usage broken down by AI agent (Contact).
 */
export function getAgentUsage(accountId: string, days: number = 30): Array<{
    agentId: string;
    agentName: string;
    tokens: number;
    cost: number;
    operations: number;
}> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const rows = db.prepare(`
        SELECT
            u.agent_id,
            r.name as agent_name,
            COALESCE(SUM(u.tokens_total), 0) as tokens,
            COALESCE(SUM(u.cost_estimate), 0) as cost,
            COUNT(*) as operations
        FROM ai_usage_log u
        LEFT JOIN records r ON u.agent_id = r.id
        WHERE u.account_id = ? AND date(u.created_at) >= date(?) AND u.agent_id IS NOT NULL
        GROUP BY u.agent_id
        ORDER BY tokens DESC
    `).all(accountId, startDate) as Array<{
        agent_id: string;
        agent_name: string | null;
        tokens: number;
        cost: number;
        operations: number;
    }>;

    return rows.map(row => ({
        agentId: row.agent_id,
        agentName: row.agent_name || 'Unknown Agent',
        tokens: row.tokens,
        cost: row.cost,
        operations: row.operations,
    }));
}

/**
 * Get recent usage log entries (for detailed view).
 */
export function getRecentUsage(accountId: string, limit: number = 50): UsageLogEntry[] {
    const rows = db.prepare(`
        SELECT
            id, account_id, credential_id, agent_id, activity_id,
            model, tokens_prompt, tokens_completion, tokens_total,
            cost_estimate, operation_type, success, error_message, created_at
        FROM ai_usage_log
        WHERE account_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    `).all(accountId, limit) as Array<{
        id: string;
        account_id: string;
        credential_id: string;
        agent_id: string | null;
        activity_id: string | null;
        model: string;
        tokens_prompt: number;
        tokens_completion: number;
        tokens_total: number;
        cost_estimate: number;
        operation_type: string;
        success: number;
        error_message: string | null;
        created_at: string;
    }>;

    return rows.map(row => ({
        id: row.id,
        accountId: row.account_id,
        credentialId: row.credential_id,
        agentId: row.agent_id,
        activityId: row.activity_id,
        model: row.model,
        tokensPrompt: row.tokens_prompt,
        tokensCompletion: row.tokens_completion,
        tokensTotal: row.tokens_total,
        costEstimate: row.cost_estimate,
        operationType: row.operation_type as UsageOperationType,
        success: row.success === 1,
        errorMessage: row.error_message,
        createdAt: row.created_at,
    }));
}
