/**
 * Anthropic Provider Adapter
 *
 * Implements the AIProvider interface for Anthropic's Claude API.
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
    AIProvider,
    CompletionParams,
    CompletionResult,
    StreamChunk,
    ProviderTool,
    ProviderToolCall,
    CredentialTestResult,
    MCPToolDefinition,
    ProviderMessage,
} from '../types.js';
import type { ProviderConfig } from './types.js';

export class AnthropicProvider implements AIProvider {
    name = 'anthropic' as const;
    supportsStreaming = true;

    private client: Anthropic;

    constructor(config: ProviderConfig) {
        this.client = new Anthropic({
            apiKey: config.apiKey,
            baseURL: config.baseUrl,
            timeout: config.timeout || 60000,
            maxRetries: config.maxRetries || 2,
        });
    }

    async createCompletion(params: CompletionParams): Promise<CompletionResult> {
        // Extract system message
        const systemMessage = params.messages.find(m => m.role === 'system');
        const otherMessages = params.messages.filter(m => m.role !== 'system');

        const response = await this.client.messages.create({
            model: params.model,
            max_tokens: params.maxTokens || 4096,
            system: systemMessage?.content,
            messages: this.convertMessages(otherMessages),
            tools: params.tools ? this.convertToolsForAPI(params.tools) : undefined,
            temperature: params.temperature,
        });

        // Extract content and tool calls from response
        let textContent = '';
        const toolCalls: ProviderToolCall[] = [];

        for (const block of response.content) {
            if (block.type === 'text') {
                textContent += block.text;
            } else if (block.type === 'tool_use') {
                toolCalls.push({
                    id: block.id,
                    type: 'function',
                    function: {
                        name: block.name,
                        arguments: JSON.stringify(block.input),
                    },
                });
            }
        }

        return {
            id: response.id,
            content: textContent || null,
            toolCalls,
            finishReason: this.mapStopReason(response.stop_reason),
            usage: {
                promptTokens: response.usage.input_tokens,
                completionTokens: response.usage.output_tokens,
                total: response.usage.input_tokens + response.usage.output_tokens,
            },
        };
    }

    async *streamCompletion(params: CompletionParams): AsyncIterable<StreamChunk> {
        // Extract system message
        const systemMessage = params.messages.find(m => m.role === 'system');
        const otherMessages = params.messages.filter(m => m.role !== 'system');

        const stream = this.client.messages.stream({
            model: params.model,
            max_tokens: params.maxTokens || 4096,
            system: systemMessage?.content,
            messages: this.convertMessages(otherMessages),
            tools: params.tools ? this.convertToolsForAPI(params.tools) : undefined,
            temperature: params.temperature,
        });

        let currentToolCall: Partial<ProviderToolCall> | null = null;
        let toolInput = '';

        for await (const event of stream) {
            if (event.type === 'content_block_start') {
                const block = event.content_block;
                if (block.type === 'tool_use') {
                    currentToolCall = {
                        id: block.id,
                        type: 'function',
                        function: { name: block.name, arguments: '' },
                    };
                    toolInput = '';
                }
            } else if (event.type === 'content_block_delta') {
                const delta = event.delta;
                if (delta.type === 'text_delta') {
                    yield { type: 'content', content: delta.text };
                } else if (delta.type === 'input_json_delta' && currentToolCall) {
                    toolInput += delta.partial_json;
                    currentToolCall.function = {
                        name: currentToolCall.function?.name || '',
                        arguments: toolInput,
                    };
                    yield { type: 'tool_call', toolCall: currentToolCall };
                }
            } else if (event.type === 'content_block_stop') {
                currentToolCall = null;
                toolInput = '';
            } else if (event.type === 'message_delta') {
                // Final usage info
                if (event.usage) {
                    yield {
                        type: 'done',
                        usage: {
                            completionTokens: event.usage.output_tokens,
                        },
                    };
                }
            }
        }

        // Get final message for complete usage
        const finalMessage = await stream.finalMessage();
        yield {
            type: 'done',
            usage: {
                promptTokens: finalMessage.usage.input_tokens,
                completionTokens: finalMessage.usage.output_tokens,
                total: finalMessage.usage.input_tokens + finalMessage.usage.output_tokens,
            },
        };
    }

    convertTools(mcpTools: MCPToolDefinition[]): ProviderTool[] {
        // Return in OpenAI-compatible format (our common format)
        return mcpTools.map(tool => ({
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema,
            },
        }));
    }

    private convertToolsForAPI(tools: ProviderTool[]): Anthropic.Tool[] {
        // Convert to Anthropic's native format
        return tools.map(tool => ({
            name: tool.function.name,
            description: tool.function.description,
            input_schema: tool.function.parameters as Anthropic.Tool.InputSchema,
        }));
    }

    private convertMessages(messages: ProviderMessage[]): Anthropic.MessageParam[] {
        return messages.map(msg => {
            if (msg.role === 'tool') {
                // Tool result message
                return {
                    role: 'user' as const,
                    content: [
                        {
                            type: 'tool_result' as const,
                            tool_use_id: msg.toolCallId!,
                            content: msg.content,
                        },
                    ],
                };
            } else if (msg.role === 'assistant' && msg.toolCalls?.length) {
                // Assistant message with tool calls
                const content: Anthropic.ContentBlockParam[] = [];
                if (msg.content) {
                    content.push({ type: 'text', text: msg.content });
                }
                for (const tc of msg.toolCalls) {
                    content.push({
                        type: 'tool_use',
                        id: tc.id,
                        name: tc.function.name,
                        input: JSON.parse(tc.function.arguments),
                    });
                }
                return {
                    role: 'assistant' as const,
                    content,
                };
            } else {
                // Regular user or assistant message
                return {
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
                };
            }
        });
    }

    async testConnection(): Promise<CredentialTestResult> {
        try {
            const response = await this.client.messages.create({
                model: 'claude-3-5-haiku-20241022',
                max_tokens: 10,
                messages: [{ role: 'user', content: 'Hi' }],
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

    private mapStopReason(
        reason: string | null
    ): 'stop' | 'tool_calls' | 'length' | 'error' {
        switch (reason) {
            case 'end_turn':
                return 'stop';
            case 'tool_use':
                return 'tool_calls';
            case 'max_tokens':
                return 'length';
            default:
                return 'error';
        }
    }
}

/**
 * Create an Anthropic provider instance.
 */
export function createAnthropicProvider(apiKey: string): AnthropicProvider {
    return new AnthropicProvider({ apiKey });
}
