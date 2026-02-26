/**
 * AI Provider Factory
 *
 * Creates provider instances based on provider name.
 */

import type { AIProvider, AIProviderName } from '../types.js';
import { createOpenAIProvider } from './openai.js';
import { createAnthropicProvider } from './anthropic.js';
import { createGoogleProvider } from './google.js';

export { DEFAULT_MODELS, MODEL_INFO, estimateCost } from './types.js';
export type { ProviderConfig, ModelInfo } from './types.js';

/**
 * Create a provider instance for the given provider name.
 *
 * @param name - Provider name: 'openai', 'anthropic', or 'google'
 * @param apiKey - The API key for the provider
 * @returns Provider instance implementing AIProvider interface
 */
export function getProvider(name: AIProviderName, apiKey: string): AIProvider {
    switch (name) {
        case 'openai':
            return createOpenAIProvider(apiKey);
        case 'anthropic':
            return createAnthropicProvider(apiKey);
        case 'google':
            return createGoogleProvider(apiKey);
        default:
            throw new Error(`Unknown provider: ${name}`);
    }
}

/**
 * Get the default model for a provider.
 */
export function getDefaultModel(provider: AIProviderName): string {
    switch (provider) {
        case 'openai':
            return 'gpt-4o';
        case 'anthropic':
            return 'claude-sonnet-4-20250514';
        case 'google':
            return 'gemini-1.5-pro';
        default:
            throw new Error(`Unknown provider: ${provider}`);
    }
}

/**
 * List available models for a provider.
 */
export function getAvailableModels(provider: AIProviderName): string[] {
    switch (provider) {
        case 'openai':
            return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
        case 'anthropic':
            return [
                'claude-opus-4-20250514',
                'claude-sonnet-4-20250514',
                'claude-3-5-haiku-20241022',
                'claude-3-5-sonnet-20241022',
            ];
        case 'google':
            return ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'];
        default:
            return [];
    }
}

// Re-export provider classes for direct use
export { OpenAIProvider, createOpenAIProvider } from './openai.js';
export { AnthropicProvider, createAnthropicProvider } from './anthropic.js';
export { GoogleProvider, createGoogleProvider } from './google.js';
