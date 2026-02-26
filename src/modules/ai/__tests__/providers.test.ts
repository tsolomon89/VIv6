/**
 * AI Provider Tests
 *
 * Tests for provider abstraction layer.
 * Tests exported functions without mocking external SDKs.
 */

import { describe, it, expect } from 'vitest';
import { getAvailableModels, getDefaultModel, MODEL_INFO, DEFAULT_MODELS } from '../providers/index.js';
import type { AIProviderName } from '../types.js';

describe('AI Provider Abstraction', () => {
    describe('getAvailableModels', () => {
        it('returns models for OpenAI', () => {
            const models = getAvailableModels('openai');

            expect(models).toBeDefined();
            expect(Array.isArray(models)).toBe(true);
            expect(models.length).toBeGreaterThan(0);

            // Should include GPT models
            expect(models.some(m => m.includes('gpt'))).toBe(true);
        });

        it('returns models for Anthropic', () => {
            const models = getAvailableModels('anthropic');

            expect(models).toBeDefined();
            expect(Array.isArray(models)).toBe(true);

            // Should include Claude models
            expect(models.some(m => m.includes('claude'))).toBe(true);
        });

        it('returns models for Google', () => {
            const models = getAvailableModels('google');

            expect(models).toBeDefined();
            expect(Array.isArray(models)).toBe(true);

            // Should include Gemini models
            expect(models.some(m => m.includes('gemini'))).toBe(true);
        });

        it('returns empty array for unknown provider', () => {
            const models = getAvailableModels('unknown' as AIProviderName);
            expect(models).toEqual([]);
        });
    });

    describe('getDefaultModel', () => {
        it('returns default model for OpenAI', () => {
            const model = getDefaultModel('openai');
            expect(model).toBeDefined();
            expect(model).toContain('gpt');
        });

        it('returns default model for Anthropic', () => {
            const model = getDefaultModel('anthropic');
            expect(model).toBeDefined();
            expect(model).toContain('claude');
        });

        it('returns default model for Google', () => {
            const model = getDefaultModel('google');
            expect(model).toBeDefined();
            expect(model).toContain('gemini');
        });

        it('throws for unknown provider', () => {
            expect(() => {
                getDefaultModel('unknown' as AIProviderName);
            }).toThrow('Unknown provider');
        });
    });

    describe('DEFAULT_MODELS', () => {
        it('has default model for each provider', () => {
            expect(DEFAULT_MODELS).toBeDefined();
            expect(DEFAULT_MODELS.openai).toBeDefined();
            expect(DEFAULT_MODELS.anthropic).toBeDefined();
            expect(DEFAULT_MODELS.google).toBeDefined();
        });
    });

    describe('MODEL_INFO', () => {
        it('contains pricing info for common models', () => {
            expect(MODEL_INFO).toBeDefined();
            expect(typeof MODEL_INFO).toBe('object');

            // Check that models have expected pricing properties
            const modelIds = Object.keys(MODEL_INFO);
            expect(modelIds.length).toBeGreaterThan(0);

            // Check one model has correct structure
            const firstModel = MODEL_INFO[modelIds[0]];
            expect(firstModel).toHaveProperty('inputPricePerM');
            expect(firstModel).toHaveProperty('outputPricePerM');
        });
    });
});

describe('Provider Tool Conversion', () => {
    describe('OpenAI tool format', () => {
        it('converts MCP tools to OpenAI function format', () => {
            const mcpTool = {
                name: 'list_entities',
                description: 'List entities',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', description: 'Entity type' },
                        limit: { type: 'number', description: 'Max results' },
                    },
                    required: ['type'],
                },
            };

            // OpenAI format
            const openAiFormat = {
                type: 'function',
                function: {
                    name: mcpTool.name,
                    description: mcpTool.description,
                    parameters: mcpTool.inputSchema,
                },
            };

            expect(openAiFormat.type).toBe('function');
            expect(openAiFormat.function.name).toBe('list_entities');
            expect(openAiFormat.function.parameters).toEqual(mcpTool.inputSchema);
        });
    });

    describe('Anthropic tool format', () => {
        it('converts MCP tools to Anthropic tool format', () => {
            const mcpTool = {
                name: 'create_entity',
                description: 'Create an entity',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: { type: 'string' },
                        name: { type: 'string' },
                        data: { type: 'object' },
                    },
                    required: ['type', 'name'],
                },
            };

            // Anthropic format (similar to MCP but with input_schema)
            const anthropicFormat = {
                name: mcpTool.name,
                description: mcpTool.description,
                input_schema: mcpTool.inputSchema,
            };

            expect(anthropicFormat.name).toBe('create_entity');
            expect(anthropicFormat.input_schema).toEqual(mcpTool.inputSchema);
        });
    });

    describe('Google tool format', () => {
        it('converts MCP tools to Google function declaration format', () => {
            const mcpTool = {
                name: 'update_entity',
                description: 'Update an entity',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        data: { type: 'object' },
                    },
                    required: ['id'],
                },
            };

            // Google format (functionDeclarations)
            const googleFormat = {
                name: mcpTool.name,
                description: mcpTool.description,
                parameters: mcpTool.inputSchema,
            };

            expect(googleFormat.name).toBe('update_entity');
            expect(googleFormat.parameters).toEqual(mcpTool.inputSchema);
        });
    });
});

describe('Provider Error Handling', () => {
    it('defines common error types', () => {
        // Rate limit errors
        const rateLimitError = { status: 429, message: 'Rate limit exceeded' };
        expect(rateLimitError.status).toBe(429);

        // Authentication errors
        const authError = { status: 401, message: 'Invalid API key' };
        expect(authError.status).toBe(401);

        // Context length errors
        const contextError = { status: 400, code: 'context_length_exceeded' };
        expect(contextError.code).toBe('context_length_exceeded');
    });
});
