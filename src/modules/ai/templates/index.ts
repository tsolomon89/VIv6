/**
 * AI Agent Templates
 *
 * Pre-configured AI agent personas that can be instantiated as Contacts.
 * Templates define the system prompt, allowed tools, and default settings.
 */

export interface AgentTemplate {
    slug: string;
    name: string;
    description: string;
    icon: string;                    // Lucide icon name
    provider: 'anthropic' | 'openai' | 'google';
    model: string;
    systemPrompt: string;
    allowedTools: string[];
    maxIterations: number;
    tokenBudget: number;
    // Suggested dimensions for pipeline routing
    suggestedRole: string;
    suggestedDepartment: string;
    // Tags for filtering
    tags: string[];
}

// Import individual templates
import { DATABOT_TEMPLATE } from './databot.js';
import { CONTENT_WRITER_TEMPLATE } from './content-writer.js';
import { LEAD_SCORER_TEMPLATE } from './lead-scorer.js';
import { RESEARCH_ASSISTANT_TEMPLATE } from './research-assistant.js';

/**
 * All available agent templates
 */
export const AGENT_TEMPLATES: AgentTemplate[] = [
    DATABOT_TEMPLATE,
    CONTENT_WRITER_TEMPLATE,
    LEAD_SCORER_TEMPLATE,
    RESEARCH_ASSISTANT_TEMPLATE,
];

/**
 * Get a template by slug
 */
export function getTemplate(slug: string): AgentTemplate | undefined {
    return AGENT_TEMPLATES.find(t => t.slug === slug);
}

/**
 * Get templates filtered by tag
 */
export function getTemplatesByTag(tag: string): AgentTemplate[] {
    return AGENT_TEMPLATES.filter(t => t.tags.includes(tag));
}

/**
 * Get templates filtered by department
 */
export function getTemplatesByDepartment(department: string): AgentTemplate[] {
    return AGENT_TEMPLATES.filter(t =>
        t.suggestedDepartment.toLowerCase() === department.toLowerCase()
    );
}
