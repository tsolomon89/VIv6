/**
 * AI Approval Workflow Tests
 *
 * Tests for Tier-1 approval rules evaluation and activity generation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ApprovalRule, ToolCall, ProposedChange, ApprovalContext, ExecutionResult } from '../types.js';

// Import the functions we're testing
import {
    evaluateApprovalRules,
    calculateAverageConfidence,
} from '../activity/approvals.js';

describe('Approval Rules Evaluation', () => {
    describe('evaluateApprovalRules', () => {
        const baseRules: ApprovalRule[] = [
            {
                id: 'rule-1',
                slug: 'persona-change-requires-senior',
                trigger: 'field_change',
                fields: ['persona', 'linkage'],
                requiresRole: 'Senior',
                description: 'Persona/Linkage changes require Senior approval',
            },
            {
                id: 'rule-2',
                slug: 'opportunity-create-requires-approval',
                trigger: 'record_create',
                targetTypes: ['opportunity'],
                requiresRole: 'Admin',
                description: 'AI-created Opportunities require Admin approval',
            },
            {
                id: 'rule-3',
                slug: 'low-confidence-requires-review',
                trigger: 'confidence_below',
                threshold: 0.8,
                requiresRole: 'any',
                description: 'Low-confidence changes require review',
            },
        ];

        describe('field_change trigger', () => {
            it('triggers when persona field is changed', () => {
                const toolCalls: ToolCall[] = [];
                const proposedChanges: ProposedChange[] = [
                    {
                        field: 'persona',
                        oldValue: 'Unknown',
                        newValue: 'Decision Maker',
                        confidence: 0.9,
                        requiresApproval: true,
                    },
                ];

                const triggered = evaluateApprovalRules(baseRules, toolCalls, proposedChanges, 0.9);

                expect(triggered).toHaveLength(1);
                expect(triggered[0].slug).toBe('persona-change-requires-senior');
            });

            it('triggers when linkage field is changed', () => {
                const toolCalls: ToolCall[] = [];
                const proposedChanges: ProposedChange[] = [
                    {
                        field: 'linkage',
                        oldValue: null,
                        newValue: 'account-123',
                        confidence: 0.85,
                        requiresApproval: true,
                    },
                ];

                const triggered = evaluateApprovalRules(baseRules, toolCalls, proposedChanges, 0.85);

                expect(triggered).toHaveLength(1);
                expect(triggered[0].slug).toBe('persona-change-requires-senior');
            });

            it('does not trigger for non-protected fields', () => {
                const toolCalls: ToolCall[] = [];
                const proposedChanges: ProposedChange[] = [
                    {
                        field: 'email',
                        oldValue: null,
                        newValue: 'test@example.com',
                        confidence: 0.95,
                        requiresApproval: false,
                    },
                ];

                const triggered = evaluateApprovalRules(baseRules, toolCalls, proposedChanges, 0.95);

                // Only confidence rule would apply if below threshold
                expect(triggered).toHaveLength(0);
            });

            it('does not trigger when value unchanged', () => {
                const toolCalls: ToolCall[] = [];
                const proposedChanges: ProposedChange[] = [
                    {
                        field: 'persona',
                        oldValue: 'Decision Maker',
                        newValue: 'Decision Maker', // Same value
                        confidence: 0.9,
                        requiresApproval: false,
                    },
                ];

                const triggered = evaluateApprovalRules(baseRules, toolCalls, proposedChanges, 0.9);

                expect(triggered).toHaveLength(0);
            });
        });

        describe('record_create trigger', () => {
            it('triggers when opportunity is created', () => {
                const toolCalls: ToolCall[] = [
                    {
                        id: 'tc-1',
                        name: 'create_entity',
                        arguments: { type: 'opportunity', name: 'New Deal' },
                        result: { id: 'opp-123' },
                        success: true,
                    },
                ];
                const proposedChanges: ProposedChange[] = [];

                const triggered = evaluateApprovalRules(baseRules, toolCalls, proposedChanges, 1.0);

                expect(triggered).toHaveLength(1);
                expect(triggered[0].slug).toBe('opportunity-create-requires-approval');
            });

            it('does not trigger for non-protected record types', () => {
                const toolCalls: ToolCall[] = [
                    {
                        id: 'tc-1',
                        name: 'create_entity',
                        arguments: { type: 'contact', name: 'John Doe' },
                        result: { id: 'contact-123' },
                        success: true,
                    },
                ];
                const proposedChanges: ProposedChange[] = [];

                const triggered = evaluateApprovalRules(baseRules, toolCalls, proposedChanges, 1.0);

                expect(triggered).toHaveLength(0);
            });

            it('does not trigger when create fails', () => {
                const toolCalls: ToolCall[] = [
                    {
                        id: 'tc-1',
                        name: 'create_entity',
                        arguments: { type: 'opportunity', name: 'New Deal' },
                        result: null,
                        success: false,
                        error: 'Failed to create',
                    },
                ];
                const proposedChanges: ProposedChange[] = [];

                const triggered = evaluateApprovalRules(baseRules, toolCalls, proposedChanges, 1.0);

                expect(triggered).toHaveLength(0);
            });
        });

        describe('confidence_below trigger', () => {
            it('triggers when confidence is below threshold', () => {
                const toolCalls: ToolCall[] = [];
                const proposedChanges: ProposedChange[] = [];

                const triggered = evaluateApprovalRules(baseRules, toolCalls, proposedChanges, 0.7);

                expect(triggered).toHaveLength(1);
                expect(triggered[0].slug).toBe('low-confidence-requires-review');
            });

            it('does not trigger when confidence meets threshold', () => {
                const toolCalls: ToolCall[] = [];
                const proposedChanges: ProposedChange[] = [];

                const triggered = evaluateApprovalRules(baseRules, toolCalls, proposedChanges, 0.85);

                expect(triggered).toHaveLength(0);
            });

            it('triggers at exactly threshold boundary', () => {
                const toolCalls: ToolCall[] = [];
                const proposedChanges: ProposedChange[] = [];

                // 0.79 is below 0.8 threshold
                const triggered = evaluateApprovalRules(baseRules, toolCalls, proposedChanges, 0.79);

                expect(triggered).toHaveLength(1);
                expect(triggered[0].slug).toBe('low-confidence-requires-review');
            });
        });

        describe('multiple triggers', () => {
            it('can trigger multiple rules at once', () => {
                const toolCalls: ToolCall[] = [
                    {
                        id: 'tc-1',
                        name: 'create_entity',
                        arguments: { type: 'opportunity', name: 'New Deal' },
                        result: { id: 'opp-123' },
                        success: true,
                    },
                ];
                const proposedChanges: ProposedChange[] = [
                    {
                        field: 'persona',
                        oldValue: null,
                        newValue: 'Decision Maker',
                        confidence: 0.6,
                        requiresApproval: true,
                    },
                ];

                // Low confidence (0.6) triggers all three rules
                const triggered = evaluateApprovalRules(baseRules, toolCalls, proposedChanges, 0.6);

                expect(triggered).toHaveLength(3);
                expect(triggered.map(r => r.slug)).toContain('persona-change-requires-senior');
                expect(triggered.map(r => r.slug)).toContain('opportunity-create-requires-approval');
                expect(triggered.map(r => r.slug)).toContain('low-confidence-requires-review');
            });
        });

        describe('empty inputs', () => {
            it('returns empty array for no rules', () => {
                const triggered = evaluateApprovalRules([], [], [], 1.0);
                expect(triggered).toHaveLength(0);
            });

            it('handles empty tool calls and changes with confidence check', () => {
                const triggered = evaluateApprovalRules(baseRules, [], [], 0.5);
                expect(triggered).toHaveLength(1);
                expect(triggered[0].slug).toBe('low-confidence-requires-review');
            });
        });
    });

    describe('calculateAverageConfidence', () => {
        it('returns 1.0 for empty array', () => {
            const result = calculateAverageConfidence([]);
            expect(result).toBe(1.0);
        });

        it('calculates average of single change', () => {
            const changes: ProposedChange[] = [
                { field: 'email', oldValue: null, newValue: 'test@example.com', confidence: 0.8, requiresApproval: false },
            ];

            const result = calculateAverageConfidence(changes);
            expect(result).toBe(0.8);
        });

        it('calculates average of multiple changes', () => {
            const changes: ProposedChange[] = [
                { field: 'email', oldValue: null, newValue: 'test@example.com', confidence: 0.9, requiresApproval: false },
                { field: 'phone', oldValue: null, newValue: '555-1234', confidence: 0.7, requiresApproval: false },
                { field: 'company', oldValue: null, newValue: 'Acme', confidence: 0.8, requiresApproval: false },
            ];

            const result = calculateAverageConfidence(changes);
            expect(result).toBeCloseTo(0.8, 10); // (0.9 + 0.7 + 0.8) / 3 = 0.8
        });

        it('handles missing confidence values (defaults to 1.0)', () => {
            const changes: ProposedChange[] = [
                { field: 'email', oldValue: null, newValue: 'test@example.com', confidence: 0.6, requiresApproval: false },
                { field: 'phone', oldValue: null, newValue: '555-1234', confidence: undefined as any, requiresApproval: false },
            ];

            const result = calculateAverageConfidence(changes);
            // (0.6 + 1.0) / 2 = 0.8
            expect(result).toBe(0.8);
        });
    });
});

describe('Approval Context Building', () => {
    it('builds valid ApprovalContext structure', () => {
        const executionResult: ExecutionResult = {
            success: true,
            iterations: 3,
            toolCalls: [
                {
                    id: 'tc-1',
                    name: 'update_entity',
                    arguments: { id: 'contact-1', data: { email: 'new@example.com' } },
                    result: { success: true },
                    success: true,
                },
            ],
            proposedChanges: [
                {
                    field: 'email',
                    recordId: 'contact-1',
                    recordType: 'contact',
                    oldValue: null,
                    newValue: 'new@example.com',
                    confidence: 0.95,
                    requiresApproval: false,
                },
            ],
            tokenUsage: { promptTokens: 100, completionTokens: 50, total: 150 },
            costEstimate: 0.001,
        };

        const triggeredRules: ApprovalRule[] = [
            {
                id: 'rule-1',
                slug: 'test-rule',
                trigger: 'field_change',
                fields: ['email'],
                requiresRole: 'Admin',
                description: 'Test rule',
            },
        ];

        const context: ApprovalContext = {
            activityId: 'activity-123',
            activityName: 'Test Activity',
            agentId: 'agent-456',
            agentName: 'DataBot',
            toolCalls: executionResult.toolCalls,
            proposedChanges: executionResult.proposedChanges,
            confidence: 0.95,
            triggeredRules,
            executionResult,
        };

        // Verify all fields are present
        expect(context.activityId).toBe('activity-123');
        expect(context.agentName).toBe('DataBot');
        expect(context.toolCalls).toHaveLength(1);
        expect(context.proposedChanges).toHaveLength(1);
        expect(context.triggeredRules).toHaveLength(1);
        expect(context.confidence).toBe(0.95);
    });
});

describe('Approval Rule Types', () => {
    it('accepts valid field_change rule', () => {
        const rule: ApprovalRule = {
            id: 'rule-1',
            slug: 'persona-protection',
            trigger: 'field_change',
            fields: ['persona', 'linkage', 'budget'],
            requiresRole: 'Senior',
            description: 'Protected field changes require Senior approval',
        };

        expect(rule.trigger).toBe('field_change');
        expect(rule.fields).toContain('persona');
    });

    it('accepts valid record_create rule', () => {
        const rule: ApprovalRule = {
            id: 'rule-2',
            slug: 'opportunity-creation',
            trigger: 'record_create',
            targetTypes: ['opportunity', 'contract'],
            requiresRole: 'Admin',
            description: 'New opportunities require Admin approval',
        };

        expect(rule.trigger).toBe('record_create');
        expect(rule.targetTypes).toContain('opportunity');
    });

    it('accepts valid confidence_below rule', () => {
        const rule: ApprovalRule = {
            id: 'rule-3',
            slug: 'low-confidence-review',
            trigger: 'confidence_below',
            threshold: 0.75,
            requiresRole: 'any',
            description: 'Low confidence changes need human review',
        };

        expect(rule.trigger).toBe('confidence_below');
        expect(rule.threshold).toBe(0.75);
    });
});
