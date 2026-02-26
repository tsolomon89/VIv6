/**
 * AI Agent Module Types
 *
 * Type definitions for AI agent integration including:
 * - Credentials (API key storage - separate table for security)
 * - AI Execution (stored in Activity.data.ai_execution)
 * - Chat (stored in Activity.data.ai_chat_messages)
 * - Provider abstractions
 *
 * NOTE: AI agents ARE Contacts with is_ai_agent=true.
 * Execution state is stored in Activity records, not separate tables.
 */

// Provider types
export type AIProviderName = 'openai' | 'anthropic' | 'google';

// =============================================================================
// Credential Types (stored in ai_credentials table)
// =============================================================================

export interface AICredential {
    id: string;
    accountId: string;
    provider: AIProviderName;
    encryptedKey: string;
    keyIv: string;
    keyHint: string | null;
    name: string | null;
    isDefault: boolean;
    tokenBudgetDaily: number | null;
    costBudgetDaily: number | null;
    usageTokensToday: number;
    lastUsedAt: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface CreateCredentialInput {
    accountId: string;
    provider: AIProviderName;
    apiKey: string;  // Plain text - will be encrypted
    name?: string;
    isDefault?: boolean;
    tokenBudgetDaily?: number;
    costBudgetDaily?: number;
}

export interface CredentialTestResult {
    success: boolean;
    error?: string;
    model?: string;  // Model name if test succeeds
}

// =============================================================================
// AI Execution Types (stored in Activity.data.ai_execution)
// =============================================================================

export type AIExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * AI Execution context stored in Activity.data.ai_execution
 * This is the token-tracked equivalent of human time-tracking in duration fields.
 */
export interface AIExecutionData {
    status: AIExecutionStatus;
    inputPrompt?: string;
    inputContext?: Record<string, unknown>;

    // Completion Report (token-tracked, not time-tracked)
    outputResult?: unknown;
    proposedChanges?: ProposedChange[];
    toolCalls?: ToolCall[];
    tokenUsage?: TokenUsage;
    costEstimate?: number;
    errorMessage?: string;

    // Timing
    queuedAt?: string;
    startedAt?: string;
    completedAt?: string;
    iterations?: number;
}

/**
 * Activity record with AI agent execution context.
 * Used when an Activity is assigned to an AI agent Contact.
 *
 * All fields are optional since we read Activity.data which has any shape.
 * The index signature allows compatibility with EntityData.
 */
export interface AIActivityData {
    // Standard Activity fields (all optional since data comes from EntityData)
    activity_type?: 'data' | 'asset' | 'engagement' | 'admin';
    assigned_to?: string;  // Contact ID (can be AI or human)
    subject?: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'completed';

    // Qualifiers: Can be simple (legacy) or full Oblio qualifiers
    // The evaluator will detect which format is used
    qualifiers?: (Qualifier | OblioQualifier)[];

    // Related record references (for qualifier evaluation)
    contact_id?: string;
    account_id?: string;
    opportunity_id?: string;

    // AI Execution Context (only present when assigned_to is AI agent)
    ai_execution?: AIExecutionData;

    // Last qualifier evaluation result (computed, updated after AI execution)
    qualifier_result?: ActivityQualifierResult;

    // Chat conversation (when Activity is interactive chat)
    ai_chat_messages?: ChatMessage[];
    ai_chat_context_record_id?: string;
    ai_chat_is_active?: boolean;

    // Allow other fields for EntityData compatibility
    [key: string]: unknown;
}

/**
 * Simple Qualifier (legacy/fallback)
 * Used when Activity doesn't have full Oblio qualifier structure.
 */
export interface Qualifier {
    name: string;
    description?: string;
    completed?: boolean;
}

// =============================================================================
// Oblio Qualifier Types (Full Implementation)
// =============================================================================

/**
 * Qualifier operators for evaluating conditions.
 * Per Oblio spec: Qualifiers are boolean logic gates that evaluate Qualifications (data fields).
 */
export type QualifierOperator = '=' | '>' | '<' | '!=' | '>=' | '<=' | 'Non-Null';

/**
 * Full Oblio Qualifier - uses object:fieldGroup:field path for auto-evaluation.
 *
 * Stored in Activity.data.qualifiers[]
 *
 * Key Oblio Terminology:
 * - Qualifications = Physical data fields (raw matter)
 * - Qualifiers = Boolean logic gates that evaluate Qualifications
 * - Activity "Won" = When ALL Qualifiers evaluate to TRUE
 * - Chain Reaction: Activity Won → Qualifier True → Opportunity Won → Next Opportunity Created
 *
 * Qualifiers are NOT checkboxes - they are computed validation rules.
 */
export interface OblioQualifier {
    // Qualifier path: "object : fieldGroup : field"
    // e.g., "contacts : details : email" or "opportunities : value : Budget"
    qualifier: string;
    qualifierOperator: QualifierOperator;
    qualifierValue: string | number | boolean;  // "Non-Null", "TRUE", or specific value

    // Optional activity condition (for engagement qualifiers)
    // e.g., qualifierActivity: "activities : basic : status" with activityValue: "Converted"
    qualifierActivity?: string;
    activityCondition?: QualifierOperator;
    activityValue?: string;

    // Metadata
    qualifierType?: 'Data' | 'Engagement' | 'Asset' | 'Admin';
    qualifierRequired?: boolean;
    qualifierPipeline?: string;  // e.g., "B2B - MQL", "B2B - SQL"

    // Evaluation state (computed at runtime, not persisted)
    _evaluated?: boolean;
    _result?: boolean;
    _evaluatedAt?: string;
    _evaluatedValue?: unknown;  // Actual value found during evaluation
}

/**
 * Result of evaluating a single qualifier
 */
export interface QualifierEvaluationResult {
    qualifier: string;
    passed: boolean;
    value: unknown;
    expectedValue: string | number | boolean;
    operator: QualifierOperator;
}

/**
 * Result of evaluating all qualifiers for an Activity
 */
export interface ActivityQualifierResult {
    allPassed: boolean;  // TRUE = Activity "Won"
    results: QualifierEvaluationResult[];
    evaluatedAt: string;
}

export interface ProposedChange {
    field: string;
    recordId?: string;
    recordType?: string;
    oldValue: unknown;
    newValue: unknown;
    confidence: number;  // 0.0 - 1.0
    requiresApproval: boolean;
}

export interface ToolCall {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
    result: unknown;
    success: boolean;
    error?: string;
    durationMs?: number;
}

export interface TokenUsage {
    promptTokens?: number;
    completionTokens?: number;
    total?: number;
}

// =============================================================================
// Chat Types (stored in Activity.data.ai_chat_messages)
// =============================================================================

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    toolCalls?: ToolCall[];
    tokenCount?: number;
}

// =============================================================================
// Provider Abstraction
// =============================================================================

export interface CompletionParams {
    model: string;
    messages: ProviderMessage[];
    tools?: ProviderTool[];
    temperature?: number;
    maxTokens?: number;
}

export interface ProviderMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    toolCallId?: string;
    toolCalls?: ProviderToolCall[];
}

export interface ProviderTool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;  // JSON Schema
    };
}

export interface ProviderToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;  // JSON string
    };
}

export interface CompletionResult {
    id: string;
    content: string | null;
    toolCalls: ProviderToolCall[];
    finishReason: 'stop' | 'tool_calls' | 'length' | 'error';
    usage: TokenUsage;
}

export interface StreamChunk {
    type: 'content' | 'tool_call' | 'done' | 'error';
    content?: string;
    toolCall?: Partial<ProviderToolCall>;
    error?: string;
    usage?: TokenUsage;
}

export interface AIProvider {
    name: AIProviderName;
    supportsStreaming: boolean;
    createCompletion(params: CompletionParams): Promise<CompletionResult>;
    streamCompletion(params: CompletionParams): AsyncIterable<StreamChunk>;
    convertTools(mcpTools: MCPToolDefinition[]): ProviderTool[];
    testConnection(): Promise<CredentialTestResult>;
}

// =============================================================================
// MCP Tool Definition
// =============================================================================

export interface MCPToolDefinition {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
}

// =============================================================================
// AI Agent Contact Configuration
// =============================================================================

/**
 * AI Agent fields stored in Contact.data
 * AI agents ARE Contacts with these additional fields.
 */
export interface AIAgentConfig {
    isAiAgent: boolean;
    aiProvider: AIProviderName | null;
    aiModel: string | null;
    aiCredentialId: string | null;
    aiSystemPrompt: string | null;
    aiAllowedTools: string[];
    aiMaxIterations: number;
    aiTokenBudget: number | null;
}

// =============================================================================
// Approval Rules (Tier-1 Configuration)
// =============================================================================

export type ApprovalTrigger = 'field_change' | 'record_create' | 'confidence_below';

export interface ApprovalRule {
    id: string;
    slug: string;
    trigger: ApprovalTrigger;
    fields?: string[];           // For field_change trigger
    targetTypes?: string[];      // For record_create trigger
    threshold?: number;          // For confidence_below trigger
    requiresRole: string;        // Role required for approval
    description: string;
}

/**
 * Context passed to approval evaluation and activity generation.
 */
export interface ApprovalContext {
    activityId: string;
    activityName: string;
    agentId: string;
    agentName: string;
    toolCalls: ToolCall[];
    proposedChanges: ProposedChange[];
    confidence: number;  // Average confidence across proposed changes
    triggeredRules: ApprovalRule[];
    executionResult: ExecutionResult;
}

// =============================================================================
// Execution Context (used by engine)
// =============================================================================

export interface ExecutionContext {
    accountId: string;
    activityId: string;  // Activity record ID being executed
    agentContact: {
        id: string;
        name: string;
        config: AIAgentConfig;
    };
    credential: AICredential;
    activity: {
        id: string;
        name: string;
        type: string;
        data: AIActivityData;
    };
    maxIterations: number;
}

/**
 * Execution result returned by engine
 */
export interface ExecutionResult {
    success: boolean;
    content?: string;
    error?: string;
    iterations: number;
    toolCalls: ToolCall[];
    proposedChanges: ProposedChange[];
    tokenUsage: TokenUsage;
    costEstimate?: number;
}

// =============================================================================
// Usage Tracking Types
// =============================================================================

export type UsageOperationType = 'activity' | 'chat' | 'test';

export interface UsageLogEntry {
    id: string;
    accountId: string;
    credentialId: string;
    agentId: string | null;
    activityId: string | null;
    model: string;
    tokensPrompt: number;
    tokensCompletion: number;
    tokensTotal: number;
    costEstimate: number;
    operationType: UsageOperationType;
    success: boolean;
    errorMessage: string | null;
    createdAt: string;
}

export interface UsageSummary {
    today: {
        tokens: number;
        cost: number;
        operations: number;
    };
    week: {
        tokens: number;
        cost: number;
        operations: number;
    };
    month: {
        tokens: number;
        cost: number;
        operations: number;
    };
    byProvider: Record<string, { tokens: number; cost: number }>;
    byModel: Record<string, { tokens: number; cost: number }>;
}

export interface UsageHistory {
    date: string;
    tokens: number;
    cost: number;
    operations: number;
}

export interface CredentialUsage {
    credentialId: string;
    credentialName: string | null;
    provider: AIProviderName;
    tokensUsed: number;
    tokenLimit: number | null;
    percentUsed: number | null;
    costEstimate: number;
}
