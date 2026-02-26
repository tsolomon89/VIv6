/**
 * AI Execution Engine
 *
 * Orchestrates the agentic loop: receives an Activity, calls AI provider,
 * executes tool calls, and updates Activity.data.ai_execution with results.
 *
 * Key insight: AI execution state is stored in Activity.data.ai_execution,
 * which parallels human time-tracking in Activity duration fields.
 */

import { db } from '../../../core/db.js';
import { getRecord, updateRecord } from '../../../core/records.js';
import { getProvider, estimateCost } from '../providers/index.js';
import {
    getCredential,
    getDefaultCredential,
    getDecryptedKey,
    recordUsage,
    isOverBudget,
} from '../credentials/service.js';
import { getMCPToolDefinitions, convertToProviderTools, executeMCPTool } from './mcp-bridge.js';
import { buildSystemPrompt } from './prompts.js';
import type {
    AIAgentConfig,
    AIProviderName,
    AIActivityData,
    AIExecutionData,
    ExecutionResult,
    ProviderMessage,
    ProviderTool,
    ToolCall,
    TokenUsage,
    ProposedChange,
    Qualifier,
    OblioQualifier,
} from '../types.js';

/**
 * Check if a qualifier is an OblioQualifier (has 'qualifier' path)
 */
function isOblioQualifier(q: Qualifier | OblioQualifier): q is OblioQualifier {
    return 'qualifier' in q && 'qualifierOperator' in q;
}

/**
 * Get qualifier status (completed/result)
 */
function isQualifierDone(q: Qualifier | OblioQualifier): boolean {
    if (isOblioQualifier(q)) {
        return q._result === true;
    }
    return q.completed === true;
}

/**
 * Get qualifier display name
 */
function getQualifierDisplayName(q: Qualifier | OblioQualifier): string {
    if (isOblioQualifier(q)) {
        return q.qualifier;
    }
    return q.name;
}

/**
 * Get qualifier description
 */
function getQualifierDescription(q: Qualifier | OblioQualifier): string | undefined {
    if (isOblioQualifier(q)) {
        // For Oblio qualifiers, describe the expected value
        return `${q.qualifierOperator} ${q.qualifierValue}`;
    }
    return q.description;
}

/**
 * Progress callback for real-time updates.
 */
export type ProgressCallback = (update: {
    iteration: number;
    maxIterations: number;
    toolCalls?: ToolCall[];
    tokenUsage?: TokenUsage;
}) => void;

/**
 * Get AI agent configuration from a Contact record.
 */
export function getAgentConfig(contactId: string): AIAgentConfig | null {
    const record = db.prepare(`
        SELECT data FROM records WHERE id = ? AND type = 'contact'
    `).get(contactId) as { data: string } | undefined;

    if (!record) return null;

    const data = JSON.parse(record.data || '{}');
    if (!data.is_ai_agent) return null;

    return {
        isAiAgent: true,
        aiProvider: data.ai_provider || null,
        aiModel: data.ai_model || null,
        aiCredentialId: data.ai_credential_id || null,
        aiSystemPrompt: data.ai_system_prompt || null,
        aiAllowedTools: data.ai_allowed_tools || [],
        aiMaxIterations: data.ai_max_iterations || 10,
        aiTokenBudget: data.ai_token_budget || null,
    };
}

/**
 * Update Activity's ai_execution field.
 * Preserves all existing data properties (including fieldGroups if present).
 */
async function updateActivityExecution(
    activityId: string,
    execution: Partial<AIExecutionData>
): Promise<void> {
    const activity = getRecord(activityId);
    if (!activity) return;

    // Get current data, preserving all existing properties
    const currentData = activity.data as Record<string, unknown>;
    const currentExecution = (currentData.ai_execution as AIExecutionData) || { status: 'pending' };

    const updatedExecution: AIExecutionData = {
        ...currentExecution,
        ...execution,
        status: execution.status || currentExecution.status || 'pending',
    };

    // Cast to any to avoid fieldGroups requirement - we preserve existing data
    await updateRecord(activityId, {
        data: {
            ...currentData,
            ai_execution: updatedExecution,
        } as any,
    });
}

/**
 * Execute an Activity assigned to an AI agent.
 * Updates Activity.data.ai_execution with progress and results.
 */
export async function executeActivity(
    activityId: string,
    onProgress?: ProgressCallback
): Promise<ExecutionResult> {
    // 1. Get the Activity record
    const activity = getRecord(activityId);
    if (!activity || activity.type !== 'activity') {
        return errorResult('Activity not found');
    }

    const activityData = activity.data as AIActivityData;
    const agentContactId = activityData.assigned_to;

    if (!agentContactId) {
        return errorResult('Activity has no assignee');
    }

    // 2. Get agent configuration
    const config = getAgentConfig(agentContactId);
    if (!config) {
        return errorResult('Agent configuration not found');
    }

    if (!config.aiProvider) {
        return errorResult('Agent has no AI provider configured');
    }

    // 3. Get credential
    const credential = config.aiCredentialId
        ? getCredential(config.aiCredentialId)
        : getDefaultCredential(activity.account_id, config.aiProvider as AIProviderName);

    if (!credential) {
        return errorResult(`No credential found for provider: ${config.aiProvider}`);
    }

    // 4. Check budget
    if (isOverBudget(credential)) {
        return errorResult('Daily token budget exceeded');
    }

    // 5. Mark execution as running
    await updateActivityExecution(activityId, {
        status: 'running',
        startedAt: new Date().toISOString(),
    });

    // 6. Initialize provider
    const apiKey = getDecryptedKey(credential);
    const provider = getProvider(config.aiProvider as AIProviderName, apiKey);
    const model = config.aiModel || 'gpt-4o';

    // 7. Build initial messages
    const inputPrompt = buildInputPrompt(activityData);
    const systemPrompt = buildSystemPrompt(config, activityData);
    const messages: ProviderMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: inputPrompt },
    ];

    // 8. Get available tools
    const mcpTools = getMCPToolDefinitions(config.aiAllowedTools);
    const tools: ProviderTool[] = convertToProviderTools(mcpTools);

    // 9. Execute agentic loop
    const allToolCalls: ToolCall[] = [];
    let totalUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, total: 0 };
    let iterations = 0;
    let finalContent = '';
    let loopError: string | undefined;

    try {
        while (iterations < config.aiMaxIterations) {
            iterations++;

            // Notify progress
            if (onProgress) {
                onProgress({
                    iteration: iterations,
                    maxIterations: config.aiMaxIterations,
                    toolCalls: allToolCalls,
                    tokenUsage: totalUsage,
                });
            }

            // Update execution progress
            await updateActivityExecution(activityId, {
                iterations,
                toolCalls: allToolCalls,
                tokenUsage: totalUsage,
            });

            // Call AI provider
            const result = await provider.createCompletion({
                model,
                messages,
                tools: tools.length > 0 ? tools : undefined,
                temperature: 0.7,
                maxTokens: 4096,
            });

            // Update usage
            totalUsage = mergeUsage(totalUsage, result.usage);

            // Handle response
            if (result.finishReason === 'stop') {
                finalContent = result.content || '';
                break;
            }

            if (result.finishReason === 'tool_calls' && result.toolCalls.length > 0) {
                // Add assistant message with tool calls
                messages.push({
                    role: 'assistant',
                    content: result.content || '',
                    toolCalls: result.toolCalls,
                });

                // Execute each tool call
                for (const tc of result.toolCalls) {
                    const startTime = Date.now();
                    let args: Record<string, unknown>;

                    try {
                        args = JSON.parse(tc.function.arguments);
                    } catch {
                        args = {};
                    }

                    const toolResult = await executeMCPTool(tc.function.name, args, activity.account_id);
                    const durationMs = Date.now() - startTime;

                    const toolCall: ToolCall = {
                        id: tc.id,
                        name: tc.function.name,
                        arguments: args,
                        result: toolResult.result,
                        success: toolResult.success,
                        error: toolResult.error,
                        durationMs,
                    };
                    allToolCalls.push(toolCall);

                    // Add tool result to messages
                    messages.push({
                        role: 'tool',
                        content: JSON.stringify(toolResult.result),
                        toolCallId: tc.id,
                    });
                }
            } else if (result.finishReason === 'length') {
                finalContent = result.content || '';
                loopError = 'Token limit reached';
                break;
            } else {
                // Unexpected state
                loopError = `Unexpected finish reason: ${result.finishReason}`;
                break;
            }
        }

        if (iterations >= config.aiMaxIterations && !finalContent) {
            loopError = 'Maximum iterations reached';
        }
    } catch (error) {
        loopError = error instanceof Error ? error.message : String(error);
    }

    // 10. Record usage
    if (totalUsage.total) {
        recordUsage(credential.id, totalUsage.total);
    }

    // 11. Calculate cost
    const costEstimate = estimateCost(model, totalUsage.promptTokens || 0, totalUsage.completionTokens || 0);

    // 12. Generate proposed changes from tool calls
    const proposedChanges = generateProposedChanges(allToolCalls);

    // 13. Update final execution state
    const finalStatus = loopError ? 'failed' : 'completed';
    await updateActivityExecution(activityId, {
        status: finalStatus,
        completedAt: new Date().toISOString(),
        iterations,
        outputResult: { content: finalContent },
        proposedChanges,
        toolCalls: allToolCalls,
        tokenUsage: totalUsage,
        costEstimate,
        errorMessage: loopError,
    });

    return {
        success: !loopError,
        content: finalContent,
        iterations,
        toolCalls: allToolCalls,
        proposedChanges,
        tokenUsage: totalUsage,
        costEstimate,
        error: loopError,
    };
}

/**
 * Execute a single message for chat-style interactions.
 * Updates Activity.data.ai_chat_messages with the conversation.
 */
export async function executeMessage(
    activityId: string,
    userMessage: string,
    onProgress?: ProgressCallback
): Promise<ExecutionResult> {
    // Get activity
    const activity = getRecord(activityId);
    if (!activity || activity.type !== 'activity') {
        return errorResult('Activity not found');
    }

    const activityData = activity.data as AIActivityData;
    const agentContactId = activityData.assigned_to;

    if (!agentContactId) {
        return errorResult('Activity has no assignee');
    }

    // Get agent config
    const config = getAgentConfig(agentContactId);
    if (!config || !config.aiProvider) {
        return errorResult('Agent not configured');
    }

    // Get credential
    const credential = config.aiCredentialId
        ? getCredential(config.aiCredentialId)
        : getDefaultCredential(activity.account_id, config.aiProvider as AIProviderName);

    if (!credential) {
        return errorResult('No credential found');
    }

    // Initialize provider
    const apiKey = getDecryptedKey(credential);
    const provider = getProvider(config.aiProvider as AIProviderName, apiKey);
    const model = config.aiModel || 'gpt-4o';

    // Build messages from chat history
    const chatHistory = activityData.ai_chat_messages || [];
    const systemPrompt = buildSystemPrompt(config, activityData);
    const messages: ProviderMessage[] = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
    ];

    // Get tools
    const mcpTools = getMCPToolDefinitions(config.aiAllowedTools);
    const tools = convertToProviderTools(mcpTools);

    // Add user message to chat history
    const userMsg = {
        id: `msg_${Date.now()}`,
        role: 'user' as const,
        content: userMessage,
        timestamp: new Date().toISOString(),
    };

    // Single iteration for chat
    const allToolCalls: ToolCall[] = [];
    let totalUsage: TokenUsage = {};

    try {
        const result = await provider.createCompletion({
            model,
            messages,
            tools: tools.length > 0 ? tools : undefined,
            temperature: 0.7,
            maxTokens: 2048,
        });

        totalUsage = result.usage;

        // If tool calls, execute them
        if (result.toolCalls.length > 0) {
            for (const tc of result.toolCalls) {
                const args = JSON.parse(tc.function.arguments);
                const toolResult = await executeMCPTool(tc.function.name, args, activity.account_id);

                allToolCalls.push({
                    id: tc.id,
                    name: tc.function.name,
                    arguments: args,
                    result: toolResult.result,
                    success: toolResult.success,
                    error: toolResult.error,
                    durationMs: 0,
                });
            }
        }

        // Record usage
        if (totalUsage.total) {
            recordUsage(credential.id, totalUsage.total);
        }

        // Add assistant response to chat history
        const assistantMsg = {
            id: `msg_${Date.now() + 1}`,
            role: 'assistant' as const,
            content: result.content || '',
            timestamp: new Date().toISOString(),
            toolCalls: allToolCalls.length > 0 ? allToolCalls : undefined,
            tokenCount: totalUsage.total,
        };

        // Update Activity with chat messages (preserve existing data)
        const updatedHistory = [...chatHistory, userMsg, assistantMsg];
        const currentData = activity.data as Record<string, unknown>;
        await updateRecord(activityId, {
            data: {
                ...currentData,
                ai_chat_messages: updatedHistory,
                ai_chat_is_active: true,
            } as any,
        });

        const costEstimate = estimateCost(model, totalUsage.promptTokens || 0, totalUsage.completionTokens || 0);

        return {
            success: true,
            content: result.content || '',
            iterations: 1,
            toolCalls: allToolCalls,
            proposedChanges: generateProposedChanges(allToolCalls),
            tokenUsage: totalUsage,
            costEstimate,
        };
    } catch (error) {
        return errorResult(error instanceof Error ? error.message : String(error));
    }
}

// --- Helpers ---

function errorResult(error: string): ExecutionResult {
    return {
        success: false,
        content: '',
        iterations: 0,
        toolCalls: [],
        proposedChanges: [],
        tokenUsage: {},
        costEstimate: 0,
        error,
    };
}

function buildInputPrompt(data: AIActivityData): string {
    let prompt = `# Activity: ${data.subject || 'Untitled Activity'}\n\n`;

    if (data.activity_type) {
        prompt += `**Type:** ${data.activity_type}\n\n`;
    }

    if (data.description) {
        prompt += `**Description:**\n${data.description}\n\n`;
    }

    if (data.qualifiers && data.qualifiers.length > 0) {
        prompt += `## Objectives\n\n`;
        for (const qualifier of data.qualifiers) {
            const status = isQualifierDone(qualifier) ? '✓' : '☐';
            prompt += `- ${status} **${getQualifierDisplayName(qualifier)}**`;
            const desc = getQualifierDescription(qualifier);
            if (desc) {
                prompt += `: ${desc}`;
            }
            prompt += '\n';
        }
        prompt += '\n';
    }

    prompt += `Please complete the uncompleted objectives listed above.`;
    return prompt;
}

function mergeUsage(existing: TokenUsage, incoming: TokenUsage): TokenUsage {
    return {
        promptTokens: (existing.promptTokens || 0) + (incoming.promptTokens || 0),
        completionTokens: (existing.completionTokens || 0) + (incoming.completionTokens || 0),
        total: (existing.total || 0) + (incoming.total || 0),
    };
}

function generateProposedChanges(toolCalls: ToolCall[]): ProposedChange[] {
    return toolCalls
        .filter(tc => tc.success && (tc.name.startsWith('create_') || tc.name.startsWith('update_')))
        .map(tc => ({
            field: tc.name,
            recordId: (tc.result as { id?: string })?.id || undefined,
            recordType: tc.name.replace('create_', '').replace('update_', ''),
            oldValue: null,
            newValue: tc.arguments,
            confidence: 0.9,
            requiresApproval: shouldRequireApproval(tc),
        }));
}

function shouldRequireApproval(toolCall: ToolCall): boolean {
    // Check if tool call affects high-risk fields
    // This is a simplified check - real implementation would use Tier-1 approval rules
    const highRiskFields = ['persona', 'budget', 'decision_maker', 'linkage'];
    const args = toolCall.arguments;

    for (const field of highRiskFields) {
        if (field in args) {
            return true;
        }
    }

    return false;
}
