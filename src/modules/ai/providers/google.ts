/**
 * Google Provider Adapter
 *
 * Implements the AIProvider interface for Google's Gemini API.
 */

import { GoogleGenerativeAI, type Content, type Part, type Tool, type FunctionDeclaration } from '@google/generative-ai';
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

export class GoogleProvider implements AIProvider {
    name = 'google' as const;
    supportsStreaming = true;

    private client: GoogleGenerativeAI;

    constructor(config: ProviderConfig) {
        this.client = new GoogleGenerativeAI(config.apiKey);
    }

    async createCompletion(params: CompletionParams): Promise<CompletionResult> {
        const model = this.client.getGenerativeModel({
            model: params.model,
            generationConfig: {
                temperature: params.temperature,
                maxOutputTokens: params.maxTokens,
            },
            tools: params.tools ? this.convertToolsForAPI(params.tools) : undefined,
        });

        // Extract system instruction
        const systemMessage = params.messages.find(m => m.role === 'system');
        const otherMessages = params.messages.filter(m => m.role !== 'system');

        const chat = model.startChat({
            history: this.convertHistory(otherMessages.slice(0, -1)),
            systemInstruction: systemMessage?.content,
        });

        const lastMessage = otherMessages[otherMessages.length - 1];
        const result = await chat.sendMessage(this.convertMessageContent(lastMessage));

        const response = result.response;
        const candidate = response.candidates?.[0];

        if (!candidate) {
            return {
                id: '',
                content: null,
                toolCalls: [],
                finishReason: 'error',
                usage: {},
            };
        }

        // Extract text and tool calls
        let textContent = '';
        const toolCalls: ProviderToolCall[] = [];

        for (const part of candidate.content.parts) {
            if ('text' in part) {
                textContent += part.text;
            } else if ('functionCall' in part && part.functionCall) {
                toolCalls.push({
                    id: `fc_${Date.now()}_${toolCalls.length}`,
                    type: 'function',
                    function: {
                        name: part.functionCall.name,
                        arguments: JSON.stringify(part.functionCall.args),
                    },
                });
            }
        }

        return {
            id: '',
            content: textContent || null,
            toolCalls,
            finishReason: this.mapFinishReason(candidate.finishReason),
            usage: {
                promptTokens: response.usageMetadata?.promptTokenCount,
                completionTokens: response.usageMetadata?.candidatesTokenCount,
                total: response.usageMetadata?.totalTokenCount,
            },
        };
    }

    async *streamCompletion(params: CompletionParams): AsyncIterable<StreamChunk> {
        const model = this.client.getGenerativeModel({
            model: params.model,
            generationConfig: {
                temperature: params.temperature,
                maxOutputTokens: params.maxTokens,
            },
            tools: params.tools ? this.convertToolsForAPI(params.tools) : undefined,
        });

        // Extract system instruction
        const systemMessage = params.messages.find(m => m.role === 'system');
        const otherMessages = params.messages.filter(m => m.role !== 'system');

        const chat = model.startChat({
            history: this.convertHistory(otherMessages.slice(0, -1)),
            systemInstruction: systemMessage?.content,
        });

        const lastMessage = otherMessages[otherMessages.length - 1];
        const result = await chat.sendMessageStream(this.convertMessageContent(lastMessage));

        for await (const chunk of result.stream) {
            const candidate = chunk.candidates?.[0];
            if (!candidate) continue;

            for (const part of candidate.content.parts) {
                if ('text' in part) {
                    yield { type: 'content', content: part.text };
                } else if ('functionCall' in part && part.functionCall) {
                    yield {
                        type: 'tool_call',
                        toolCall: {
                            id: `fc_${Date.now()}`,
                            type: 'function',
                            function: {
                                name: part.functionCall.name,
                                arguments: JSON.stringify(part.functionCall.args),
                            },
                        },
                    };
                }
            }
        }

        // Get final response for usage
        const response = await result.response;
        yield {
            type: 'done',
            usage: {
                promptTokens: response.usageMetadata?.promptTokenCount,
                completionTokens: response.usageMetadata?.candidatesTokenCount,
                total: response.usageMetadata?.totalTokenCount,
            },
        };
    }

    convertTools(mcpTools: MCPToolDefinition[]): ProviderTool[] {
        // Return in common format
        return mcpTools.map(tool => ({
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema,
            },
        }));
    }

    private convertToolsForAPI(tools: ProviderTool[]): Tool[] {
        const functionDeclarations: FunctionDeclaration[] = tools.map(tool => ({
            name: tool.function.name,
            description: tool.function.description,
            parameters: tool.function.parameters as unknown as FunctionDeclaration['parameters'],
        }));

        return [{ functionDeclarations }];
    }

    private convertHistory(messages: ProviderMessage[]): Content[] {
        const history: Content[] = [];

        for (const msg of messages) {
            const parts = this.convertMessageToParts(msg);
            history.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts,
            });
        }

        return history;
    }

    private convertMessageContent(msg: ProviderMessage): string | Part[] {
        if (msg.role === 'tool') {
            // Tool result
            return [
                {
                    functionResponse: {
                        name: 'tool_result',
                        response: { result: msg.content },
                    },
                },
            ];
        }
        return msg.content;
    }

    private convertMessageToParts(msg: ProviderMessage): Part[] {
        const parts: Part[] = [];

        if (msg.content) {
            parts.push({ text: msg.content });
        }

        if (msg.toolCalls) {
            for (const tc of msg.toolCalls) {
                parts.push({
                    functionCall: {
                        name: tc.function.name,
                        args: JSON.parse(tc.function.arguments),
                    },
                });
            }
        }

        if (msg.role === 'tool' && msg.toolCallId) {
            parts.push({
                functionResponse: {
                    name: msg.toolCallId,
                    response: { result: msg.content },
                },
            });
        }

        return parts.length > 0 ? parts : [{ text: '' }];
    }

    async testConnection(): Promise<CredentialTestResult> {
        try {
            const model = this.client.getGenerativeModel({
                model: 'gemini-1.5-flash',
            });

            const result = await model.generateContent('Hi');
            const response = result.response;

            return {
                success: true,
                model: 'gemini-1.5-flash',
            };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : String(err),
            };
        }
    }

    private mapFinishReason(
        reason: string | undefined
    ): 'stop' | 'tool_calls' | 'length' | 'error' {
        switch (reason) {
            case 'STOP':
                return 'stop';
            case 'MAX_TOKENS':
                return 'length';
            case 'TOOL_CODE':
                return 'tool_calls';
            default:
                return 'error';
        }
    }
}

/**
 * Create a Google provider instance.
 */
export function createGoogleProvider(apiKey: string): GoogleProvider {
    return new GoogleProvider({ apiKey });
}
