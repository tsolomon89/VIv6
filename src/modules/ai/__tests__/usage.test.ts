/**
 * AI Usage Tracking Tests
 *
 * Tests for usage logging and query functions.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type {
    UsageLogEntry,
    UsageSummary,
    UsageHistory,
    CredentialUsage,
    TokenUsage,
} from '../types.js';

// Mock database for unit tests
// Note: The actual service requires database access, so we test the types and interfaces here

describe('Usage Tracking Types', () => {
    describe('UsageLogEntry', () => {
        it('has all required fields', () => {
            const entry: UsageLogEntry = {
                id: 'usage-123',
                accountId: 'account-456',
                credentialId: 'cred-789',
                agentId: 'agent-abc',
                activityId: 'activity-def',
                model: 'claude-sonnet-4-5-20250929',
                tokensPrompt: 100,
                tokensCompletion: 50,
                tokensTotal: 150,
                costEstimate: 0.001,
                operationType: 'activity',
                success: true,
                errorMessage: null,
                createdAt: '2024-01-15T10:00:00Z',
            };

            expect(entry.id).toBe('usage-123');
            expect(entry.tokensTotal).toBe(150);
            expect(entry.operationType).toBe('activity');
        });

        it('allows null agent and activity IDs', () => {
            const entry: UsageLogEntry = {
                id: 'usage-123',
                accountId: 'account-456',
                credentialId: 'cred-789',
                agentId: null,
                activityId: null,
                model: 'claude-sonnet-4-5-20250929',
                tokensPrompt: 100,
                tokensCompletion: 50,
                tokensTotal: 150,
                costEstimate: 0.001,
                operationType: 'chat',
                success: true,
                errorMessage: null,
                createdAt: '2024-01-15T10:00:00Z',
            };

            expect(entry.agentId).toBeNull();
            expect(entry.activityId).toBeNull();
        });

        it('supports different operation types', () => {
            const activityEntry: UsageLogEntry = {
                id: '1',
                accountId: 'a',
                credentialId: 'c',
                agentId: null,
                activityId: null,
                model: 'm',
                tokensPrompt: 0,
                tokensCompletion: 0,
                tokensTotal: 0,
                costEstimate: 0,
                operationType: 'activity',
                success: true,
                errorMessage: null,
                createdAt: '',
            };

            const chatEntry: UsageLogEntry = { ...activityEntry, id: '2', operationType: 'chat' };
            const testEntry: UsageLogEntry = { ...activityEntry, id: '3', operationType: 'test' };

            expect(activityEntry.operationType).toBe('activity');
            expect(chatEntry.operationType).toBe('chat');
            expect(testEntry.operationType).toBe('test');
        });
    });

    describe('UsageSummary', () => {
        it('has all time period summaries', () => {
            const summary: UsageSummary = {
                today: { tokens: 1000, cost: 0.01, operations: 5 },
                week: { tokens: 7000, cost: 0.07, operations: 35 },
                month: { tokens: 30000, cost: 0.30, operations: 150 },
                byProvider: {
                    anthropic: { tokens: 20000, cost: 0.20 },
                    openai: { tokens: 10000, cost: 0.10 },
                },
                byModel: {
                    'claude-sonnet-4-5-20250929': { tokens: 20000, cost: 0.20 },
                    'gpt-4o': { tokens: 10000, cost: 0.10 },
                },
            };

            expect(summary.today.tokens).toBe(1000);
            expect(summary.week.operations).toBe(35);
            expect(summary.month.cost).toBe(0.30);
            expect(summary.byProvider['anthropic'].tokens).toBe(20000);
            expect(summary.byModel['gpt-4o'].cost).toBe(0.10);
        });

        it('handles empty provider/model breakdown', () => {
            const summary: UsageSummary = {
                today: { tokens: 0, cost: 0, operations: 0 },
                week: { tokens: 0, cost: 0, operations: 0 },
                month: { tokens: 0, cost: 0, operations: 0 },
                byProvider: {},
                byModel: {},
            };

            expect(Object.keys(summary.byProvider)).toHaveLength(0);
            expect(Object.keys(summary.byModel)).toHaveLength(0);
        });
    });

    describe('UsageHistory', () => {
        it('represents daily usage data point', () => {
            const dataPoint: UsageHistory = {
                date: '2024-01-15',
                tokens: 5000,
                cost: 0.05,
                operations: 25,
            };

            expect(dataPoint.date).toBe('2024-01-15');
            expect(dataPoint.tokens).toBe(5000);
        });

        it('can be used to create time series array', () => {
            const history: UsageHistory[] = [
                { date: '2024-01-13', tokens: 4000, cost: 0.04, operations: 20 },
                { date: '2024-01-14', tokens: 5000, cost: 0.05, operations: 25 },
                { date: '2024-01-15', tokens: 6000, cost: 0.06, operations: 30 },
            ];

            expect(history).toHaveLength(3);
            expect(history[0].date).toBe('2024-01-13');
            expect(history[2].date).toBe('2024-01-15');

            // Total calculations
            const totalTokens = history.reduce((sum, h) => sum + h.tokens, 0);
            expect(totalTokens).toBe(15000);
        });
    });

    describe('CredentialUsage', () => {
        it('tracks budget usage per credential', () => {
            const usage: CredentialUsage = {
                credentialId: 'cred-123',
                credentialName: 'Production Claude',
                provider: 'anthropic',
                tokensUsed: 5000,
                tokenLimit: 10000,
                percentUsed: 50,
                costEstimate: 0.05,
            };

            expect(usage.credentialName).toBe('Production Claude');
            expect(usage.percentUsed).toBe(50);
            expect(usage.tokensUsed).toBeLessThan(usage.tokenLimit!);
        });

        it('handles null limits', () => {
            const usage: CredentialUsage = {
                credentialId: 'cred-456',
                credentialName: null,
                provider: 'openai',
                tokensUsed: 8000,
                tokenLimit: null,
                percentUsed: null,
                costEstimate: 0.08,
            };

            expect(usage.credentialName).toBeNull();
            expect(usage.tokenLimit).toBeNull();
            expect(usage.percentUsed).toBeNull();
        });
    });
});

describe('Token Usage Calculations', () => {
    it('calculates total from prompt and completion', () => {
        const usage: TokenUsage = {
            promptTokens: 100,
            completionTokens: 50,
            total: 150,
        };

        expect(usage.total).toBe(usage.promptTokens! + usage.completionTokens!);
    });

    it('handles missing individual counts', () => {
        const usage: TokenUsage = {
            total: 200,
        };

        expect(usage.promptTokens).toBeUndefined();
        expect(usage.completionTokens).toBeUndefined();
        expect(usage.total).toBe(200);
    });
});

describe('Cost Estimation', () => {
    it('calculates cost from tokens and pricing', () => {
        // Anthropic Claude Sonnet 3.5 pricing: $3/1M input, $15/1M output
        const inputTokens = 1000;
        const outputTokens = 500;
        const inputPricePerM = 3;
        const outputPricePerM = 15;

        const inputCost = (inputTokens / 1_000_000) * inputPricePerM;
        const outputCost = (outputTokens / 1_000_000) * outputPricePerM;
        const totalCost = inputCost + outputCost;

        expect(inputCost).toBeCloseTo(0.003, 10);
        expect(outputCost).toBeCloseTo(0.0075, 10);
        expect(totalCost).toBeCloseTo(0.0105, 10);
    });

    it('aggregates costs across multiple operations', () => {
        const operations = [
            { tokens: 1000, cost: 0.01 },
            { tokens: 2000, cost: 0.02 },
            { tokens: 3000, cost: 0.03 },
        ];

        const totalTokens = operations.reduce((sum, op) => sum + op.tokens, 0);
        const totalCost = operations.reduce((sum, op) => sum + op.cost, 0);

        expect(totalTokens).toBe(6000);
        expect(totalCost).toBe(0.06);
    });
});

describe('Budget Tracking', () => {
    it('calculates percentage of daily budget used', () => {
        const tokensUsed = 5000;
        const dailyLimit = 10000;
        const percentUsed = Math.round((tokensUsed / dailyLimit) * 100);

        expect(percentUsed).toBe(50);
    });

    it('handles over-budget scenarios', () => {
        const tokensUsed = 12000;
        const dailyLimit = 10000;
        const percentUsed = Math.round((tokensUsed / dailyLimit) * 100);

        expect(percentUsed).toBe(120);
        expect(tokensUsed > dailyLimit).toBe(true);
    });

    it('returns null percentage when no limit set', () => {
        const tokensUsed = 5000;
        const dailyLimit: number | null = null;
        const percentUsed = dailyLimit
            ? Math.round((tokensUsed / dailyLimit) * 100)
            : null;

        expect(percentUsed).toBeNull();
    });
});
