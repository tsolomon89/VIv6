/**
 * OpenAI Provider Adapter
 *
 * Implements the AIProvider interface for OpenAI's API.
 */

import OpenAI from 'openai';
import type {
    AIProvider,
    CompletionParams,
    CompletionResult,
    StreamChunk,
    ProviderTool,
    ProviderToolCall,
    CredentialTestResult,
    MCPToolDefinition,
} from '../types.js';
import type { ProviderConfig } from './types.js';

export class OpenAIProvider implements AIProvider {
    name = 'openai' as const;
    supportsStreaming = true;

    private client: OpenAI;

    constructor(config: ProviderConfig) {
        this.client = new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseUrl,
            timeout: config.timeout || 60000,
            maxRetries: config.maxRetries || 2,
        });
    }

    async createCompletion(params: CompletionParams): Promise<CompletionResult> {
        const messages = this.convertMessages(params.messages);
        const tools = params.tools?.map(tool => ({
            type: 'function' as const,
            function: tool.function,
        }));

        const response = await this.client.chat.completions.create({
            model: params.model,
            messages,
            tools,
            temperature: params.temperature,
            max_tokens: params.maxTokens,
        });

        const choice = response.choices[0];
        const message = choice.message;

        return {
            id: response.id,
            content: message.content,
            toolCalls: (message.tool_calls || []).map(tc => ({
                id: tc.id,
                type: tc.type,
                function: {
                    name: tc.function.name,
                    arguments: tc.function.arguments,
                },
            })),
            finishReason: this.mapFinishReason(choice.finish_reason),
            usage: {
                promptTokens: response.usage?.prompt_tokens,
                completionTokens: response.usage?.completion_tokens,
                total: response.usage?.total_tokens,
            },
        };
    }

    async *streamCompletion(params: CompletionParams): AsyncIterable<StreamChunk> {
        const messages = this.convertMessages(params.messages);
        const tools = params.tools?.map(tool => ({
            type: 'function' as const,
            function: tool.function,
        }));

        const stream = await this.client.chat.completions.create({
            model: params.model,
            messages,
            tools,
            temperature: params.temperature,
            max_tokens: params.maxTokens,
            stream: true,
            stream_options: { include_usage: true },
        });

        const toolCallsInProgress: Map<number, Partial<ProviderToolCall>> = new Map();

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;

            if (!delta) {
                // Usage info at the end
                if (chunk.usage) {
                    yield {
                        type: 'done',
                        usage: {
                            promptTokens: chunk.usage.prompt_tokens,
                            completionTokens: chunk.usage.completion_tokens,
                            total: chunk.usage.total_tokens,
                        },
                    };
                }
                continue;
            }

            // Content delta
            if (delta.content) {
                yield { type: 'content', content: delta.content };
            }

            // Tool call deltas
            if (delta.tool_calls) {
                for (const tc of delta.tool_calls) {
                    let toolCall = toolCallsInProgress.get(tc.index);
                    if (!toolCall) {
                        toolCall = {
                            id: tc.id,
                            type: 'function',
                            function: { name: '', arguments: '' },
                        };
                        toolCallsInProgress.set(tc.index, toolCall);
                    }

                    if (tc.id) toolCall.id = tc.id;
                    if (tc.function?.name) {
                        toolCall.function = toolCall.function || { name: '', arguments: '' };
                        toolCall.function.name = tc.function.name;
                    }
                    if (tc.function?.arguments) {
                        toolCall.function = toolCall.function || { name: '', arguments: '' };
                        toolCall.function.arguments += tc.function.arguments;
                    }

                    yield { type: 'tool_call', toolCall };
                }
            }
        }
    }

    convertTools(mcpTools: MCPToolDefinition[]): ProviderTool[] {
        return mcpTools.map(tool => ({
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema,
            },
        }));
    }

    async testConnection(): Promise<CredentialTestResult> {
        try {
            // Make a minimal API call to verify the key works
            const response = await this.client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: 'Hi' }],
                max_tokens: 5,
            });

            return {
                success: true,
                model: response.model,
            };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : String(err),
            };
        }
    }

    private mapFinishReason(
        reason: string | null
    ): 'stop' | 'tool_calls' | 'length' | 'error' {
        switch (reason) {
            case 'stop':
                return 'stop';
            case 'tool_calls':
                return 'tool_calls';
            case 'length':
                return 'length';
            default:
                return 'error';
        }
    }

    private convertMessages(messages: CompletionParams['messages']): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
        return messages.map(msg => {
            if (msg.role === 'system') {
                return { role: 'system' as const, content: msg.content };
            }
            if (msg.role === 'user') {
                return { role: 'user' as const, content: msg.content };
            }
            if (msg.role === 'tool') {
                return {
                    role: 'tool' as const,
                    content: msg.content,
                    tool_call_id: msg.toolCallId || '',
                };
            }
            // assistant
            const assistantMsg: OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam = {
                role: 'assistant' as const,
                content: msg.content,
            };
            if (msg.toolCalls && msg.toolCalls.length > 0) {
                assistantMsg.tool_calls = msg.toolCalls.map(tc => ({
                    id: tc.id,
                    type: 'function' as const,
                    function: tc.function,
                }));
            }
            return assistantMsg;
        });
    }
}

/**
 * Create an OpenAI provider instance.
 */
export function createOpenAIProvider(apiKey: string): OpenAIProvider {
    return new OpenAIProvider({ apiKey });
}
