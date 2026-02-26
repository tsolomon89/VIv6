/**
 * AI Agent Templates Tests
 *
 * Tests for template definitions and lookup functions.
 */

import { describe, it, expect } from 'vitest';
import {
    AGENT_TEMPLATES,
    getTemplate,
    getTemplatesByTag,
    getTemplatesByDepartment,
} from '../templates/index.js';
import type { AgentTemplate } from '../templates/index.js';

describe('AI Agent Templates', () => {
    describe('AGENT_TEMPLATES', () => {
        it('contains 4 templates', () => {
            expect(AGENT_TEMPLATES).toHaveLength(4);
        });

        it('has unique slugs', () => {
            const slugs = AGENT_TEMPLATES.map(t => t.slug);
            const uniqueSlugs = new Set(slugs);
            expect(uniqueSlugs.size).toBe(slugs.length);
        });

        it('all templates have required fields', () => {
            const requiredFields: (keyof AgentTemplate)[] = [
                'slug',
                'name',
                'description',
                'icon',
                'provider',
                'model',
                'systemPrompt',
                'allowedTools',
                'maxIterations',
                'tokenBudget',
                'suggestedRole',
                'suggestedDepartment',
                'tags',
            ];

            for (const template of AGENT_TEMPLATES) {
                for (const field of requiredFields) {
                    expect(template[field]).toBeDefined();
                }
            }
        });

        it('all templates have valid providers', () => {
            const validProviders = ['openai', 'anthropic', 'google'];
            for (const template of AGENT_TEMPLATES) {
                expect(validProviders).toContain(template.provider);
            }
        });

        it('all templates have non-empty allowedTools', () => {
            for (const template of AGENT_TEMPLATES) {
                expect(template.allowedTools.length).toBeGreaterThan(0);
            }
        });
    });

    describe('DataBot template', () => {
        it('exists and has correct slug', () => {
            const databot = getTemplate('databot');
            expect(databot).toBeDefined();
            expect(databot!.name).toBe('DataBot');
        });

        it('has data enrichment tools', () => {
            const databot = getTemplate('databot')!;
            expect(databot.allowedTools).toContain('list_entities');
            expect(databot.allowedTools).toContain('update_entity');
        });

        it('is in Operations department', () => {
            const databot = getTemplate('databot')!;
            expect(databot.suggestedDepartment).toBe('Operations');
        });

        it('has data and enrichment tags', () => {
            const databot = getTemplate('databot')!;
            expect(databot.tags).toContain('data');
            expect(databot.tags).toContain('enrichment');
        });
    });

    describe('ContentWriter template', () => {
        it('exists and has correct slug', () => {
            const writer = getTemplate('content-writer');
            expect(writer).toBeDefined();
            expect(writer!.name).toBe('ContentWriter');
        });

        it('is in Marketing department', () => {
            const writer = getTemplate('content-writer')!;
            expect(writer.suggestedDepartment).toBe('Marketing');
        });

        it('has higher token budget for content generation', () => {
            const writer = getTemplate('content-writer')!;
            const databot = getTemplate('databot')!;
            expect(writer.tokenBudget).toBeGreaterThan(databot.tokenBudget);
        });
    });

    describe('LeadScorer template', () => {
        it('exists and has correct slug', () => {
            const scorer = getTemplate('lead-scorer');
            expect(scorer).toBeDefined();
            expect(scorer!.name).toBe('LeadScorer');
        });

        it('is in Sales department', () => {
            const scorer = getTemplate('lead-scorer')!;
            expect(scorer.suggestedDepartment).toBe('Sales');
        });

        it('has targeting suggestions tool', () => {
            const scorer = getTemplate('lead-scorer')!;
            expect(scorer.allowedTools).toContain('get_targeting_suggestions');
        });
    });

    describe('ResearchAssistant template', () => {
        it('exists and has correct slug', () => {
            const research = getTemplate('research-assistant');
            expect(research).toBeDefined();
            expect(research!.name).toBe('ResearchAssistant');
        });

        it('has dimension tools for data exploration', () => {
            const research = getTemplate('research-assistant')!;
            expect(research.allowedTools).toContain('list_dimension_values');
            expect(research.allowedTools).toContain('list_dimension_types');
        });
    });

    describe('getTemplate', () => {
        it('returns template for valid slug', () => {
            const template = getTemplate('databot');
            expect(template).toBeDefined();
            expect(template!.slug).toBe('databot');
        });

        it('returns undefined for invalid slug', () => {
            const template = getTemplate('nonexistent');
            expect(template).toBeUndefined();
        });

        it('is case-sensitive', () => {
            const template = getTemplate('DataBot');
            expect(template).toBeUndefined();
        });
    });

    describe('getTemplatesByTag', () => {
        it('filters templates by tag', () => {
            const dataTemplates = getTemplatesByTag('data');
            expect(dataTemplates.length).toBeGreaterThan(0);
            expect(dataTemplates.every(t => t.tags.includes('data'))).toBe(true);
        });

        it('returns empty array for unknown tag', () => {
            const templates = getTemplatesByTag('unknowntag');
            expect(templates).toHaveLength(0);
        });

        it('returns multiple templates for common tags', () => {
            const researchTemplates = getTemplatesByTag('research');
            expect(researchTemplates.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('getTemplatesByDepartment', () => {
        it('filters templates by department', () => {
            const salesTemplates = getTemplatesByDepartment('Sales');
            expect(salesTemplates.length).toBeGreaterThan(0);
            expect(salesTemplates.every(t =>
                t.suggestedDepartment.toLowerCase() === 'sales'
            )).toBe(true);
        });

        it('is case-insensitive', () => {
            const marketingLower = getTemplatesByDepartment('marketing');
            const marketingUpper = getTemplatesByDepartment('MARKETING');
            expect(marketingLower).toHaveLength(marketingUpper.length);
        });

        it('returns empty array for unknown department', () => {
            const templates = getTemplatesByDepartment('Unknown');
            expect(templates).toHaveLength(0);
        });

        it('returns Operations templates', () => {
            const opsTemplates = getTemplatesByDepartment('Operations');
            expect(opsTemplates.length).toBeGreaterThanOrEqual(1);
        });
    });
});
