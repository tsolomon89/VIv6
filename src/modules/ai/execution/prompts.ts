/**
 * System Prompt Generator
 *
 * Builds system prompts from AI agent Contact configuration.
 */

import type { AIAgentConfig, AIActivityData } from '../types.js';
import { getMCPToolDefinitions, getToolsByCategory } from './mcp-bridge.js';

/**
 * Build the system prompt for an AI agent executing an Activity.
 *
 * @param config - Agent configuration from Contact record
 * @param activityData - The Activity data being executed (for context)
 * @returns Complete system prompt string
 */
export function buildSystemPrompt(config: AIAgentConfig, activityData?: AIActivityData): string {
    const sections: string[] = [];

    // 1. Base persona prompt
    sections.push(buildPersonaSection(config));

    // 2. Tool instructions (if agent has tools)
    if (config.aiAllowedTools.length > 0) {
        sections.push(buildToolsSection(config.aiAllowedTools));
    }

    // 3. Context for this specific activity
    if (activityData?.ai_execution?.inputContext) {
        sections.push(buildContextSection(activityData.ai_execution.inputContext));
    }

    // 4. Standard guidelines
    sections.push(buildGuidelinesSection(config));

    return sections.join('\n\n');
}

/**
 * Build the persona section from custom system prompt or defaults.
 */
function buildPersonaSection(config: AIAgentConfig): string {
    if (config.aiSystemPrompt) {
        return config.aiSystemPrompt;
    }

    // Default persona based on role (derived from config if available)
    return `You are an AI assistant helping to manage data and complete tasks within the Victory Initiative (VI) platform.

Your role is to:
- Execute assigned tasks efficiently and accurately
- Use available tools to create, read, and update records
- Provide clear reports on completed work
- Ask for clarification if requirements are unclear`;
}

/**
 * Build the tools section explaining available tools.
 */
function buildToolsSection(allowedTools: string[]): string {
    const toolDefinitions = getMCPToolDefinitions(allowedTools);
    const categories = getToolsByCategory();

    // Group tools by category for better organization
    const toolsByCategory: Record<string, typeof toolDefinitions> = {};

    for (const tool of toolDefinitions) {
        let category = 'other';
        for (const [cat, tools] of Object.entries(categories)) {
            if (tools.includes(tool.name as any)) {
                category = cat;
                break;
            }
        }
        if (!toolsByCategory[category]) {
            toolsByCategory[category] = [];
        }
        toolsByCategory[category].push(tool);
    }

    let section = `## Available Tools

You have access to the following tools to complete your tasks:`;

    for (const [category, tools] of Object.entries(toolsByCategory)) {
        section += `\n\n### ${capitalizeFirst(category)}`;
        for (const tool of tools) {
            section += `\n- **${tool.name}**: ${tool.description}`;
        }
    }

    section += `

## Tool Usage Guidelines
- Use tools when you need to create, read, update, or delete records
- Always explain what you're doing before using a tool
- Check tool results and handle errors appropriately
- Prefer reading existing data before making changes`;

    return section;
}

/**
 * Build the context section with activity-specific information.
 */
function buildContextSection(context: Record<string, unknown>): string {
    let section = `## Task Context

The following context is provided for this task:`;

    // Format context nicely
    for (const [key, value] of Object.entries(context)) {
        if (typeof value === 'object') {
            section += `\n\n**${formatKey(key)}:**\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
        } else {
            section += `\n- **${formatKey(key)}:** ${value}`;
        }
    }

    return section;
}

/**
 * Build standard guidelines section.
 */
function buildGuidelinesSection(config: AIAgentConfig): string {
    const maxIterations = config.aiMaxIterations || 10;

    return `## Guidelines

- Complete the requested task step by step
- Stay within the scope of your assigned work
- Report your progress and results clearly
- If you cannot complete a task, explain why
- You have up to ${maxIterations} iterations to complete this task
- Be efficient - avoid unnecessary tool calls

## Output Format

When you complete a task, provide a summary that includes:
1. What was accomplished
2. Any records created or modified (with IDs)
3. Any issues or warnings encountered`;
}

/**
 * Build a prompt for a specific activity type.
 */
export function buildActivityPrompt(
    activityType: 'data' | 'asset' | 'engagement' | 'admin',
    subject: string,
    qualifiers: Array<{ name: string; description?: string }>
): string {
    const typeInstructions: Record<string, string> = {
        data: 'This is a Data activity. Focus on creating, updating, or enriching records with accurate information.',
        asset: 'This is an Asset activity. Focus on creating or modifying content assets.',
        engagement: 'This is an Engagement activity. Focus on outreach and communication tasks.',
        admin: 'This is an Admin activity. Focus on administrative and configuration tasks.',
    };

    let prompt = `# Activity: ${subject}

${typeInstructions[activityType] || ''}

## Objectives`;

    for (const qualifier of qualifiers) {
        prompt += `\n- ${qualifier.name}`;
        if (qualifier.description) {
            prompt += `: ${qualifier.description}`;
        }
    }

    prompt += `

Complete each objective and verify the work meets the requirements.`;

    return prompt;
}

/**
 * Build a prompt for chat-style interactions.
 */
export function buildChatPrompt(
    userMessage: string,
    contextRecord?: { type: string; id: string; name: string; data?: Record<string, unknown> }
): string {
    let prompt = userMessage;

    if (contextRecord) {
        prompt = `[Context: Working with ${contextRecord.type} "${contextRecord.name}" (ID: ${contextRecord.id})]

${userMessage}`;

        if (contextRecord.data) {
            prompt += `\n\nRecord data:\n\`\`\`json\n${JSON.stringify(contextRecord.data, null, 2)}\n\`\`\``;
        }
    }

    return prompt;
}

// --- Helpers ---

function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatKey(key: string): string {
    return key
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(' ')
        .map(capitalizeFirst)
        .join(' ');
}
