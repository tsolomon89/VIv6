/**
 * AI Streaming API
 *
 * Server-Sent Events (SSE) streaming for real-time AI responses.
 * Enables streaming chat responses as they're generated.
 *
 * Endpoints:
 * - GET /ai/chat/:activityId/stream?message=... - Stream response via SSE
 */

import { Router, Request, Response } from 'express';
import { getRecord, updateRecord } from '../../../core/records.js';
import { getAgentConfig } from '../execution/engine.js';
import { getCredential, getDefaultCredential, getDecryptedKey } from '../credentials/service.js';
import { getProvider } from '../providers/index.js';
import { getMCPToolDefinitions, convertToProviderTools, executeMCPTool } from '../execution/mcp-bridge.js';
import { buildSystemPrompt } from '../execution/prompts.js';
import type {
    AIActivityData,
    AIProviderName,
    ChatMessage,
    ProviderMessage,
    ProviderToolCall,
    TokenUsage,
    ToolCall,
} from '../types.js';

const router = Router();

/**
 * GET /ai/chat/:activityId/stream
 * Stream AI response via Server-Sent Events (SSE).
 *
 * Query params:
 * - message: string - The user's message
 *
 * SSE Events:
 * - content: Partial content chunk
 * - tool_call: Tool being called
 * - done: Stream complete with final stats
 * - error: Error occurred
 */
router.get('/:activityId/stream', async (req: Request, res: Response) => {
    const activityId = req.params.activityId as string;
    const accountId = req.odac?.accountId as string | undefined;
    const rawMessage = req.query.message;
    const userMessage = (Array.isArray(rawMessage) ? rawMessage[0] : rawMessage) as string | undefined;

    // Validate inputs
    if (!accountId) {
        return res.status(400).json({ error: 'Account context required' });
    }

    if (!userMessage || typeof userMessage !== 'string') {
        return res.status(400).json({ error: 'Message query parameter required' });
    }

    // Get the activity
    const activity = getRecord(activityId);
    if (!activity || activity.type !== 'activity') {
        return res.status(404).json({ error: 'Activity not found' });
    }

    // Verify ownership
    if (activity.account_id !== accountId) {
        return res.status(403).json({ error: 'Access denied' });
    }

    const data = activity.data as AIActivityData;

    // Verify it's an AI chat activity
    if (!data.assigned_to) {
        return res.status(400).json({ error: 'Activity has no AI agent assigned' });
    }

    // Get agent config
    const config = getAgentConfig(data.assigned_to);
    if (!config || !config.aiProvider) {
        return res.status(400).json({ error: 'Agent not configured' });
    }

    // Get credential
    const credential = config.aiCredentialId
        ? getCredential(config.aiCredentialId)
        : getDefaultCredential(accountId, config.aiProvider as AIProviderName);

    if (!credential) {
        return res.status(400).json({ error: 'No credential found' });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    // Helper to send SSE event
    const sendEvent = (event: string, eventData: unknown) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    };

    try {
        // Get decrypted API key
        const apiKey = getDecryptedKey(credential);

        // Get provider
        const provider = getProvider(config.aiProvider as AIProviderName, apiKey);

        if (!provider.supportsStreaming) {
            sendEvent('error', { error: 'Provider does not support streaming' });
            res.end();
            return;
        }

        // Build messages from chat history
        const chatHistory = data.ai_chat_messages || [];
        const systemPrompt = buildSystemPrompt(config, data);

        const messages: ProviderMessage[] = [
            { role: 'system', content: systemPrompt },
            ...chatHistory.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage },
        ];

        // Get tools if agent has them configured
        const mcpTools = config.aiAllowedTools?.length
            ? getMCPToolDefinitions(config.aiAllowedTools)
            : [];
        const tools = convertToProviderTools(mcpTools);

        const model = config.aiModel || 'claude-sonnet-4-20250514';

        // Track full response
        let fullContent = '';
        const toolCalls: ToolCall[] = [];
        let totalUsage: TokenUsage = {};

        // Stream the response
        const stream = provider.streamCompletion({
            model,
            messages,
            tools: tools.length > 0 ? tools : undefined,
            maxTokens: config.aiTokenBudget || 4096,
            temperature: 0.7,
        });

        for await (const chunk of stream) {
            switch (chunk.type) {
                case 'content':
                    if (chunk.content) {
                        fullContent += chunk.content;
                        sendEvent('content', { content: chunk.content });
                    }
                    break;

                case 'tool_call':
                    if (chunk.toolCall) {
                        const tc = chunk.toolCall as ProviderToolCall;
                        sendEvent('tool_call', {
                            name: tc.function?.name,
                            arguments: tc.function?.arguments,
                        });

                        // Execute tool call
                        try {
                            const toolName = tc.function?.name || '';
                            const toolArgs = tc.function?.arguments
                                ? JSON.parse(tc.function.arguments)
                                : {};

                            const toolResult = await executeMCPTool(toolName, toolArgs, accountId);

                            toolCalls.push({
                                id: tc.id || `tool_${Date.now()}`,
                                name: toolName,
                                arguments: toolArgs,
                                result: toolResult.result,
                                success: toolResult.success,
                                error: toolResult.error,
                                durationMs: 0,
                            });

                            sendEvent('tool_result', {
                                name: toolName,
                                success: toolResult.success,
                                result: toolResult.result,
                            });
                        } catch (toolError) {
                            sendEvent('tool_error', {
                                name: tc.function?.name,
                                error: toolError instanceof Error ? toolError.message : String(toolError),
                            });
                        }
                    }
                    break;

                case 'done':
                    if (chunk.usage) {
                        totalUsage = chunk.usage;
                    }
                    break;

                case 'error':
                    sendEvent('error', { error: chunk.error });
                    break;
            }
        }

        // Store messages in activity
        const userMsg: ChatMessage = {
            id: `msg_${Date.now()}_user`,
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString(),
        };
        const assistantMsg: ChatMessage = {
            id: `msg_${Date.now()}_assistant`,
            role: 'assistant',
            content: fullContent,
            timestamp: new Date().toISOString(),
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        };

        const updatedHistory = [...chatHistory, userMsg, assistantMsg];
        const currentData = activity.data as Record<string, unknown>;
        await updateRecord(activityId, {
            data: {
                ...currentData,
                ai_chat_messages: updatedHistory,
                ai_chat_is_active: true,
            } as any,
        });

        // Send done event with final stats
        sendEvent('done', {
            content: fullContent,
            tokenUsage: totalUsage,
            toolCallCount: toolCalls.length,
        });

        res.end();
    } catch (error) {
        console.error('[AI Stream] Error:', error);
        sendEvent('error', {
            error: error instanceof Error ? error.message : 'Streaming failed',
        });
        res.end();
    }
});

/**
 * POST /ai/chat/:activityId/stream
 * Alternative POST endpoint for streaming (for clients that can't use GET with body).
 * Body: { message: string }
 */
router.post('/:activityId/stream', async (req: Request, res: Response) => {
    const activityId = req.params.activityId as string;
    const accountId = req.odac?.accountId as string | undefined;
    const message = req.body.message as string | undefined;

    if (!accountId) {
        return res.status(400).json({ error: 'Account context required' });
    }

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
    }

    const activity = getRecord(activityId);
    if (!activity || activity.type !== 'activity') {
        return res.status(404).json({ error: 'Activity not found' });
    }

    if (activity.account_id !== accountId) {
        return res.status(403).json({ error: 'Access denied' });
    }

    const data = activity.data as AIActivityData;

    if (!data.assigned_to) {
        return res.status(400).json({ error: 'Activity has no AI agent assigned' });
    }

    const config = getAgentConfig(data.assigned_to);
    if (!config || !config.aiProvider) {
        return res.status(400).json({ error: 'Agent not configured' });
    }

    const credential = config.aiCredentialId
        ? getCredential(config.aiCredentialId)
        : getDefaultCredential(accountId, config.aiProvider as AIProviderName);

    if (!credential) {
        return res.status(400).json({ error: 'No credential found' });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const sendEvent = (event: string, eventData: unknown) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    };

    try {
        const apiKey = getDecryptedKey(credential);
        const provider = getProvider(config.aiProvider as AIProviderName, apiKey);

        if (!provider.supportsStreaming) {
            sendEvent('error', { error: 'Provider does not support streaming' });
            res.end();
            return;
        }

        const chatHistory = data.ai_chat_messages || [];
        const systemPrompt = buildSystemPrompt(config, data);

        const messages: ProviderMessage[] = [
            { role: 'system', content: systemPrompt },
            ...chatHistory.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: message },
        ];

        const mcpTools = config.aiAllowedTools?.length
            ? getMCPToolDefinitions(config.aiAllowedTools)
            : [];
        const tools = convertToProviderTools(mcpTools);

        const model = config.aiModel || 'claude-sonnet-4-20250514';

        let fullContent = '';
        const toolCalls: ToolCall[] = [];
        let totalUsage: TokenUsage = {};

        const stream = provider.streamCompletion({
            model,
            messages,
            tools: tools.length > 0 ? tools : undefined,
            maxTokens: config.aiTokenBudget || 4096,
            temperature: 0.7,
        });

        for await (const chunk of stream) {
            switch (chunk.type) {
                case 'content':
                    if (chunk.content) {
                        fullContent += chunk.content;
                        sendEvent('content', { content: chunk.content });
                    }
                    break;

                case 'tool_call':
                    if (chunk.toolCall) {
                        const tc = chunk.toolCall as ProviderToolCall;
                        sendEvent('tool_call', {
                            name: tc.function?.name,
                            arguments: tc.function?.arguments,
                        });

                        try {
                            const toolName = tc.function?.name || '';
                            const toolArgs = tc.function?.arguments
                                ? JSON.parse(tc.function.arguments)
                                : {};

                            const toolResult = await executeMCPTool(toolName, toolArgs, accountId);

                            toolCalls.push({
                                id: tc.id || `tool_${Date.now()}`,
                                name: toolName,
                                arguments: toolArgs,
                                result: toolResult.result,
                                success: toolResult.success,
                                error: toolResult.error,
                                durationMs: 0,
                            });

                            sendEvent('tool_result', {
                                name: toolName,
                                success: toolResult.success,
                                result: toolResult.result,
                            });
                        } catch (toolError) {
                            sendEvent('tool_error', {
                                name: tc.function?.name,
                                error: toolError instanceof Error ? toolError.message : String(toolError),
                            });
                        }
                    }
                    break;

                case 'done':
                    if (chunk.usage) {
                        totalUsage = chunk.usage;
                    }
                    break;

                case 'error':
                    sendEvent('error', { error: chunk.error });
                    break;
            }
        }

        const userMsg: ChatMessage = {
            id: `msg_${Date.now()}_user`,
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
        };
        const assistantMsg: ChatMessage = {
            id: `msg_${Date.now()}_assistant`,
            role: 'assistant',
            content: fullContent,
            timestamp: new Date().toISOString(),
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        };

        const updatedHistory = [...chatHistory, userMsg, assistantMsg];
        const currentData = activity.data as Record<string, unknown>;
        await updateRecord(activityId, {
            data: {
                ...currentData,
                ai_chat_messages: updatedHistory,
                ai_chat_is_active: true,
            } as any,
        });

        sendEvent('done', {
            content: fullContent,
            tokenUsage: totalUsage,
            toolCallCount: toolCalls.length,
        });

        res.end();
    } catch (error) {
        console.error('[AI Stream] Error:', error);
        sendEvent('error', {
            error: error instanceof Error ? error.message : 'Streaming failed',
        });
        res.end();
    }
});

export default router;
