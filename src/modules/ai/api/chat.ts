/**
 * AI Chat API
 *
 * Handles chat message processing for AI agents.
 * Chat sessions ARE Activities (type: engagement) with ai_chat_messages in data.
 *
 * Endpoints:
 * - POST /ai/chat/:activityId/message - Send message and get response
 * - GET /ai/chat/:activityId/history - Get chat history
 */

import { Router } from 'express';
import { getRecord, updateRecord } from '../../../core/records.js';
import { executeMessage } from '../execution/engine.js';
import type { AIActivityData, ChatMessage } from '../types.js';

const router = Router();

/**
 * POST /ai/chat/:activityId/message
 * Send a message to an AI agent and get a response.
 *
 * Request body:
 * - message: string - The user's message
 * - stream?: boolean - If true, use SSE streaming (handled by streaming.ts)
 *
 * Response:
 * - success: boolean
 * - content: string - AI response
 * - tokenUsage: TokenUsage
 * - costEstimate: number
 */
router.post('/:activityId/message', async (req, res) => {
    try {
        const activityId = req.params.activityId;
        const accountId = req.odac?.accountId;
        const { message, stream } = req.body;

        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
        }

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
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

        // For streaming, redirect to streaming handler
        if (stream) {
            // The streaming endpoint will handle SSE
            return res.status(400).json({
                error: 'Use /ai/chat/:activityId/stream for streaming responses',
            });
        }

        // Execute the message (non-streaming)
        const result = await executeMessage(activityId, message);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: result.error || 'Failed to process message',
            });
        }

        res.json({
            success: true,
            content: result.content,
            tokenUsage: result.tokenUsage,
            costEstimate: result.costEstimate,
            toolCalls: result.toolCalls,
        });
    } catch (error) {
        console.error('[AI Chat] Message error:', error);
        res.status(500).json({
            error: 'Failed to process message',
            details: error instanceof Error ? error.message : String(error),
        });
    }
});

/**
 * GET /ai/chat/:activityId/history
 * Get chat message history for an activity.
 */
router.get('/:activityId/history', async (req, res) => {
    try {
        const activityId = req.params.activityId;
        const accountId = req.odac?.accountId;

        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
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
        const messages = data.ai_chat_messages || [];

        res.json({
            activityId,
            messages,
            isActive: data.ai_chat_is_active ?? false,
            contextRecordId: data.ai_chat_context_record_id,
        });
    } catch (error) {
        console.error('[AI Chat] History error:', error);
        res.status(500).json({ error: 'Failed to get chat history' });
    }
});

/**
 * POST /ai/chat/:activityId/clear
 * Clear chat history for an activity.
 */
router.post('/:activityId/clear', async (req, res) => {
    try {
        const activityId = req.params.activityId;
        const accountId = req.odac?.accountId;

        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
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

        // Clear chat messages
        const currentData = activity.data as Record<string, unknown>;
        await updateRecord(activityId, {
            data: {
                ...currentData,
                ai_chat_messages: [],
            } as any,
        });

        res.json({ success: true, message: 'Chat history cleared' });
    } catch (error) {
        console.error('[AI Chat] Clear error:', error);
        res.status(500).json({ error: 'Failed to clear chat history' });
    }
});

/**
 * POST /ai/chat/:activityId/close
 * Close/end a chat session.
 */
router.post('/:activityId/close', async (req, res) => {
    try {
        const activityId = req.params.activityId;
        const accountId = req.odac?.accountId;

        if (!accountId) {
            return res.status(400).json({ error: 'Account context required' });
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

        // Mark chat as inactive
        const currentData = activity.data as Record<string, unknown>;
        await updateRecord(activityId, {
            data: {
                ...currentData,
                ai_chat_is_active: false,
            } as any,
        });

        res.json({ success: true, message: 'Chat session closed' });
    } catch (error) {
        console.error('[AI Chat] Close error:', error);
        res.status(500).json({ error: 'Failed to close chat session' });
    }
});

export default router;
