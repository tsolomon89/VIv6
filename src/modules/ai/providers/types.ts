/**
 * Provider Types
 *
 * Common interfaces for AI provider abstraction.
 * Re-exports relevant types from main types.ts for convenience.
 */

export type {
    AIProviderName,
    AIProvider,
    CompletionParams,
    CompletionResult,
    StreamChunk,
    ProviderMessage,
    ProviderTool,
    ProviderToolCall,
    TokenUsage,
    CredentialTestResult,
    MCPToolDefinition,
} from '../types.js';

// Provider-specific configuration
export interface ProviderConfig {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
    maxRetries?: number;
}

// Model info for each provider
export interface ModelInfo {
    id: string;
    name: string;
    contextWindow: number;
    inputPricePerM: number;   // Price per million input tokens
    outputPricePerM: number;  // Price per million output tokens
    supportsTools: boolean;
    supportsStreaming: boolean;
}

// Default models for each provider
export const DEFAULT_MODELS: Record<string, string> = {
    openai: 'gpt-4o',
    anthropic: 'claude-sonnet-4-20250514',
    google: 'gemini-1.5-pro',
};

// Model pricing (as of 2025)
export const MODEL_INFO: Record<string, ModelInfo> = {
    // OpenAI
    'gpt-4o': {
        id: 'gpt-4o',
        name: 'GPT-4o',
        contextWindow: 128000,
        inputPricePerM: 2.50,
        outputPricePerM: 10.00,
        supportsTools: true,
        supportsStreaming: true,
    },
    'gpt-4o-mini': {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        contextWindow: 128000,
        inputPricePerM: 0.15,
        outputPricePerM: 0.60,
        supportsTools: true,
        supportsStreaming: true,
    },
    // Anthropic
    'claude-opus-4-20250514': {
        id: 'claude-opus-4-20250514',
        name: 'Claude Opus 4',
        contextWindow: 200000,
        inputPricePerM: 15.00,
        outputPricePerM: 75.00,
        supportsTools: true,
        supportsStreaming: true,
    },
    'claude-sonnet-4-20250514': {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude Sonnet 4',
        contextWindow: 200000,
        inputPricePerM: 3.00,
        outputPricePerM: 15.00,
        supportsTools: true,
        supportsStreaming: true,
    },
    'claude-3-5-haiku-20241022': {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        contextWindow: 200000,
        inputPricePerM: 0.80,
        outputPricePerM: 4.00,
        supportsTools: true,
        supportsStreaming: true,
    },
    // Google
    'gemini-1.5-pro': {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        contextWindow: 1000000,
        inputPricePerM: 1.25,
        outputPricePerM: 5.00,
        supportsTools: true,
        supportsStreaming: true,
    },
    'gemini-1.5-flash': {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        contextWindow: 1000000,
        inputPricePerM: 0.075,
        outputPricePerM: 0.30,
        supportsTools: true,
        supportsStreaming: true,
    },
};

/**
 * Estimate cost for a completion based on token usage.
 */
export function estimateCost(
    modelId: string,
    promptTokens: number,
    completionTokens: number
): number {
    const info = MODEL_INFO[modelId];
    if (!info) return 0;

    const inputCost = (promptTokens / 1_000_000) * info.inputPricePerM;
    const outputCost = (completionTokens / 1_000_000) * info.outputPricePerM;

    return inputCost + outputCost;
}
