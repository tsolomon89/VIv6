/**
 * Workflow Engine - Seed-Driven Automation
 *
 * Interprets workflow_step records and executes them based on step_type.
 * Step handlers are looked up from workflow_step_type records, NOT hardcoded.
 */

import { db } from '../../core/db.js';
import { DataRecord, DataRecordInput, WorkflowEnrollmentStatus, WorkflowStepType } from '../../core/types.js';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../../core/logger.js';

const logger = createLogger('workflow-engine');

export interface StepResult {
    success: boolean;
    nextStepSlug?: string;
    activitiesGenerated?: string[];
    fieldsUpdated?: Record<string, any>;
    error?: string;
    exitReason?: 'win' | 'loss' | 'manual';
}

export interface ProcessResult {
    processed: number;
    succeeded: number;
    failed: number;
    completed: number;
}

export class WorkflowEngine {
    /**
     * Get a workflow by ID or slug
     */
    static getWorkflow(idOrSlug: string, accountId?: string): DataRecord | undefined {
        const result = db.prepare(`
            SELECT * FROM records
            WHERE type = 'workflow'
            AND (id = ? OR slug = ?)
            ${accountId ? 'AND account_id = ?' : ''}
            LIMIT 1
        `).get(accountId ? [idOrSlug, idOrSlug, accountId] : [idOrSlug, idOrSlug]) as DataRecord | undefined;

        if (result && typeof result.data === 'string') {
            result.data = JSON.parse(result.data);
        }
        return result;
    }

    /**
     * Get a workflow step by slug
     */
    static getStepBySlug(slug: string, accountId?: string): DataRecord | undefined {
        const result = db.prepare(`
            SELECT * FROM records
            WHERE type = 'workflow_step'
            AND slug = ?
            ${accountId ? 'AND account_id = ?' : ''}
            LIMIT 1
        `).get(accountId ? [slug, accountId] : [slug]) as DataRecord | undefined;

        if (result && typeof result.data === 'string') {
            result.data = JSON.parse(result.data);
        }
        return result;
    }

    /**
     * Get step type configuration from seed data
     */
    static getStepTypeConfig(stepType: WorkflowStepType | string): DataRecord | undefined {
        const result = db.prepare(`
            SELECT * FROM records
            WHERE type = 'workflow_step_type'
            AND slug = ?
            LIMIT 1
        `).get(stepType) as DataRecord | undefined;

        if (result && typeof result.data === 'string') {
            result.data = JSON.parse(result.data);
        }
        return result;
    }

    /**
     * Enroll a contact in a workflow
     */
    static async enrollContact(
        workflowId: string,
        contactId: string,
        accountId: string
    ): Promise<DataRecord> {
        const workflow = this.getWorkflow(workflowId, accountId);
        if (!workflow) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }

        // Check if contact is already enrolled in this workflow
        const existing = db.prepare(`
            SELECT * FROM records
            WHERE type = 'workflow_enrollment'
            AND json_extract(data, '$.workflow_id') = ?
            AND json_extract(data, '$.contact_id') = ?
            AND json_extract(data, '$.status') = 'active'
            LIMIT 1
        `).get(workflow.id, contactId) as DataRecord | undefined;

        if (existing) {
            logger.debug({ contactId, workflowId }, 'Contact already enrolled in workflow');
            return existing;
        }

        // Get the first step
        const firstStepSlug = workflow.data?.first_step_slug;
        if (!firstStepSlug) {
            throw new Error(`Workflow ${workflowId} has no first_step_slug defined`);
        }

        const firstStep = this.getStepBySlug(firstStepSlug, accountId);
        if (!firstStep) {
            throw new Error(`First step not found: ${firstStepSlug}`);
        }

        // Create enrollment
        const enrollmentId = uuidv4();
        const now = new Date().toISOString();
        const enrollmentSlug = `enrollment-${contactId.slice(0, 8)}-${Date.now()}`;

        const enrollmentData = {
            fieldGroups: [],
            workflow_id: workflow.id,
            contact_id: contactId,
            current_step_id: firstStep.id,
            status: 'active' as WorkflowEnrollmentStatus,
            enrolled_at: now,
            next_step_due_at: this.calculateNextDueAt(firstStep, now)
        };

        db.prepare(`
            INSERT INTO records (id, account_id, type, slug, name, data, created_at, updated_at)
            VALUES (?, ?, 'workflow_enrollment', ?, ?, ?, datetime('now'), datetime('now'))
        `).run(
            enrollmentId,
            accountId,
            enrollmentSlug,
            `${workflow.name} - Enrollment`,
            JSON.stringify(enrollmentData)
        );

        logger.info({ contactId, workflowId, enrollmentId }, 'Enrolled contact in workflow');

        const result = db.prepare('SELECT * FROM records WHERE id = ?').get(enrollmentId) as DataRecord;
        if (typeof result.data === 'string') {
            result.data = JSON.parse(result.data);
        }
        return result;
    }

    /**
     * Calculate when the next step is due based on delay_hours
     */
    static calculateNextDueAt(step: DataRecord, fromTime: string): string {
        const delayHours = step.data?.delay_hours || 0;
        const dueAt = new Date(fromTime);
        dueAt.setHours(dueAt.getHours() + delayHours);
        return dueAt.toISOString();
    }

    /**
     * Process due enrollments (called by scheduler)
     */
    static async processDueEnrollments(accountId?: string): Promise<ProcessResult> {
        const result: ProcessResult = {
            processed: 0,
            succeeded: 0,
            failed: 0,
            completed: 0
        };

        const now = new Date().toISOString();

        // Query enrollments that are due
        const query = accountId
            ? `SELECT * FROM records
               WHERE type = 'workflow_enrollment'
               AND account_id = ?
               AND json_extract(data, '$.status') = 'active'
               AND json_extract(data, '$.next_step_due_at') <= ?`
            : `SELECT * FROM records
               WHERE type = 'workflow_enrollment'
               AND json_extract(data, '$.status') = 'active'
               AND json_extract(data, '$.next_step_due_at') <= ?`;

        const enrollments = db.prepare(query).all(
            accountId ? [accountId, now] : [now]
        ) as DataRecord[];

        for (const enrollment of enrollments) {
            try {
                if (typeof enrollment.data === 'string') {
                    enrollment.data = JSON.parse(enrollment.data);
                }

                const stepResult = await this.executeCurrentStep(enrollment);
                result.processed++;

                if (stepResult.success) {
                    result.succeeded++;

                    if (stepResult.exitReason) {
                        result.completed++;
                        await this.completeEnrollment(enrollment.id, stepResult.exitReason);
                    } else if (stepResult.nextStepSlug) {
                        await this.advanceToStep(enrollment, stepResult.nextStepSlug);
                    }
                } else {
                    result.failed++;
                    logger.warn({ enrollmentId: enrollment.id, error: stepResult.error }, 'Step execution failed');
                }
            } catch (err) {
                result.failed++;
                logger.error({ err, enrollmentId: enrollment.id }, 'Error processing enrollment');
            }
        }

        if (result.processed > 0) {
            logger.info({ processed: result.processed, succeeded: result.succeeded, failed: result.failed, completed: result.completed }, 'Processed enrollments');
        }

        return result;
    }

    /**
     * Execute the current step for an enrollment
     */
    static async executeCurrentStep(enrollment: DataRecord): Promise<StepResult> {
        const stepId = enrollment.data?.current_step_id;
        if (!stepId) {
            return { success: false, error: 'No current_step_id on enrollment' };
        }

        const step = db.prepare('SELECT * FROM records WHERE id = ?').get(stepId) as DataRecord | undefined;
        if (!step) {
            return { success: false, error: `Step not found: ${stepId}` };
        }

        if (typeof step.data === 'string') {
            step.data = JSON.parse(step.data);
        }

        const stepType = step.data?.step_type as WorkflowStepType;
        if (!stepType) {
            return { success: false, error: 'Step has no step_type' };
        }

        // Get step type config from seed data
        const typeConfig = this.getStepTypeConfig(stepType);
        if (!typeConfig) {
            return { success: false, error: `Unknown step type: ${stepType}` };
        }

        // Import and execute the handler
        const { executeStepHandler } = await import('./handlers.js');
        return executeStepHandler(enrollment, step, typeConfig);
    }

    /**
     * Advance enrollment to the next step
     */
    static async advanceToStep(enrollment: DataRecord, nextStepSlug: string): Promise<void> {
        const accountId = (enrollment as any).account_id;
        const nextStep = this.getStepBySlug(nextStepSlug, accountId);

        if (!nextStep) {
            logger.warn({ nextStepSlug, enrollmentId: enrollment.id }, 'Next step not found, completing enrollment');
            await this.completeEnrollment(enrollment.id, 'loss');
            return;
        }

        const now = new Date().toISOString();
        const nextDueAt = this.calculateNextDueAt(nextStep, now);

        db.prepare(`
            UPDATE records SET
                data = json_set(
                    data,
                    '$.current_step_id', ?,
                    '$.last_step_completed_at', ?,
                    '$.next_step_due_at', ?
                ),
                updated_at = datetime('now')
            WHERE id = ?
        `).run(nextStep.id, now, nextDueAt, enrollment.id);

        logger.info({ enrollmentId: enrollment.id, nextStepSlug }, 'Advanced enrollment to step');
    }

    /**
     * Complete an enrollment with exit reason
     */
    static async completeEnrollment(
        enrollmentId: string,
        exitReason: 'win' | 'loss' | 'manual'
    ): Promise<void> {
        const now = new Date().toISOString();

        db.prepare(`
            UPDATE records SET
                data = json_set(
                    data,
                    '$.status', 'completed',
                    '$.exit_reason', ?,
                    '$.completed_at', ?
                ),
                updated_at = datetime('now')
            WHERE id = ?
        `).run(exitReason, now, enrollmentId);

        logger.info({ enrollmentId, exitReason }, 'Completed enrollment');
    }

    /**
     * Pause an enrollment
     */
    static async pauseEnrollment(enrollmentId: string): Promise<void> {
        db.prepare(`
            UPDATE records SET
                data = json_set(data, '$.status', 'paused'),
                updated_at = datetime('now')
            WHERE id = ?
        `).run(enrollmentId);

        logger.info({ enrollmentId }, 'Paused enrollment');
    }

    /**
     * Resume a paused enrollment
     */
    static async resumeEnrollment(enrollmentId: string): Promise<void> {
        const now = new Date().toISOString();

        db.prepare(`
            UPDATE records SET
                data = json_set(
                    data,
                    '$.status', 'active',
                    '$.next_step_due_at', ?
                ),
                updated_at = datetime('now')
            WHERE id = ?
        `).run(now, enrollmentId);

        logger.info({ enrollmentId }, 'Resumed enrollment');
    }

    /**
     * Check for workflows matching a trigger event and enroll contacts
     */
    static async checkAndEnroll(
        record: DataRecord | DataRecordInput,
        triggerEvent: string
    ): Promise<void> {
        if (!record || record.type !== 'contact') return;

        const accountId = (record as any).account_id;
        if (!accountId) return;

        // Find active workflows with matching trigger
        const workflows = db.prepare(`
            SELECT * FROM records
            WHERE type = 'workflow'
            AND account_id = ?
            AND json_extract(data, '$.is_active') = 1
            AND json_extract(data, '$.trigger_type') = 'event'
            AND json_extract(data, '$.trigger_event') = ?
        `).all(accountId, triggerEvent) as DataRecord[];

        for (const workflow of workflows) {
            try {
                if (typeof workflow.data === 'string') {
                    workflow.data = JSON.parse(workflow.data);
                }

                const contactId = (record as DataRecord).id;
                if (contactId) {
                    await this.enrollContact(workflow.id, contactId, accountId);
                }
            } catch (err) {
                logger.warn({ err, workflowId: workflow.id }, 'Failed to enroll contact in workflow');
            }
        }
    }

    /**
     * Trigger a workflow synchronously with provided context
     * Used by chain reaction and other event-driven automations
     *
     * @param workflowSlug - The workflow slug to trigger
     * @param event - The triggering event name
     * @param context - Context data (opportunity_id, activity_id, etc.)
     */
    static async triggerWorkflow(
        workflowSlug: string,
        event: string,
        context: Record<string, any>
    ): Promise<void> {
        const workflow = this.getWorkflow(workflowSlug);
        if (!workflow) {
            throw new Error(`Workflow not found: ${workflowSlug}`);
        }

        if (!workflow.data?.is_active) {
            logger.info({ workflowSlug }, 'Workflow is not active, skipping');
            return;
        }

        // Check if the trigger event matches
        const expectedEvent = workflow.data?.trigger_event;
        if (expectedEvent && expectedEvent !== event) {
            logger.debug({ workflowSlug, event, expectedEvent }, 'Event does not match workflow trigger');
            return;
        }

        // Create a temporary enrollment record for this execution
        const enrollmentId = uuidv4();
        const accountId = (workflow as any).account_id;
        const now = new Date().toISOString();

        const enrollmentData = {
            workflow_id: workflow.id,
            contact_id: context.opportunity_id || context.contact_id || 'system',
            current_step_id: null,
            status: 'active' as WorkflowEnrollmentStatus,
            enrolled_at: now,
            ...context  // Include all context data
        };

        // Insert enrollment record
        db.prepare(`
            INSERT INTO records (id, account_id, type, slug, name, data, created_at, updated_at)
            VALUES (?, ?, 'workflow_enrollment', ?, ?, ?, datetime('now'), datetime('now'))
        `).run(
            enrollmentId,
            accountId,
            `enrollment-${workflowSlug}-${Date.now()}`,
            `${workflowSlug} - Triggered`,
            JSON.stringify(enrollmentData)
        );

        // Get the enrollment record
        const enrollment = db.prepare('SELECT * FROM records WHERE id = ?').get(enrollmentId) as DataRecord;
        if (typeof enrollment.data === 'string') {
            enrollment.data = JSON.parse(enrollment.data);
        }

        // Execute workflow synchronously
        await this.executeWorkflowSync(enrollment, workflow);
    }

    /**
     * Execute a workflow synchronously (no scheduling)
     * Used for immediate execution triggered by events
     */
    private static async executeWorkflowSync(
        enrollment: DataRecord,
        workflow: DataRecord
    ): Promise<void> {
        const firstStepSlug = workflow.data?.first_step_slug;
        if (!firstStepSlug) {
            logger.warn({ workflowId: workflow.id }, 'Workflow has no first_step_slug');
            return;
        }

        let currentStepSlug: string | undefined = firstStepSlug;
        let iterations = 0;
        const maxIterations = 100;  // Prevent infinite loops

        while (currentStepSlug && iterations < maxIterations) {
            const step = this.getStepBySlug(currentStepSlug);
            if (!step) {
                logger.warn({ stepSlug: currentStepSlug }, 'Step not found');
                break;
            }

            // Execute the step
            const result = await this.executeStep(enrollment, step);

            if (!result.success) {
                logger.warn({ stepSlug: currentStepSlug, error: result.error }, 'Step execution failed');
                break;
            }

            // Handle completion
            if (result.exitReason) {
                await this.completeEnrollment(enrollment.id, result.exitReason);
                break;
            }

            // Determine next step
            const stepType = step.data?.step_type;
            if (stepType === 'branch') {
                // Branch step - check enrollment context for branch result
                const enrollmentData = db.prepare('SELECT data FROM records WHERE id = ?').get(enrollment.id) as { data: string } | undefined;
                if (enrollmentData) {
                    const data = typeof enrollmentData.data === 'string' ? JSON.parse(enrollmentData.data) : enrollmentData.data;
                    const queryResult = data.query_result;
                    currentStepSlug = queryResult
                        ? step.data?.branch_step_slug
                        : step.data?.next_step_slug;
                } else {
                    currentStepSlug = step.data?.next_step_slug;
                }
            } else if (stepType === 'complete') {
                // Complete step - exit
                await this.completeEnrollment(enrollment.id, result.exitReason || 'win');
                break;
            } else {
                // Normal step - use nextStepSlug from result or step data
                currentStepSlug = result.nextStepSlug || step.data?.next_step_slug;
            }

            iterations++;
        }

        if (iterations >= maxIterations) {
            logger.warn({ enrollmentId: enrollment.id }, 'Workflow exceeded max iterations');
        }
    }
}
