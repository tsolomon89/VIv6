/**
 * Invariant Validations
 *
 * These enforce the immutable laws of the Oblio "Physics" model.
 *
 * NOTE: As of Phase 14, invariant validation is now DATA-DRIVEN via the
 * ConstraintEngine (src/modules/ops/constraints.ts). Validation rules are
 * stored as `validation_constraint` records in the database.
 *
 * This file now contains only:
 * - InvariantViolation error class (used by ConstraintEngine)
 * - Legacy validators (exported for backward compatibility/testing)
 */

import { DataRecordInput } from './types.js';

// ============================================================================
// Validation Errors
// ============================================================================

export class InvariantViolation extends Error {
    constructor(
        public invariant: string,
        public field: string,
        message: string
    ) {
        super(`[${invariant}] ${message}`);
        this.name = 'InvariantViolation';
    }
}

// ============================================================================
// Legacy Validators (kept for backward compatibility and testing)
// These are NO LONGER registered as hooks - enforcement is via ConstraintEngine
// ============================================================================

const MAX_PRODUCT_NAME_LENGTH = 26;

function validateProductName(input: DataRecordInput): void {
    if (input.type !== 'product') return;

    if (input.name && input.name.length > MAX_PRODUCT_NAME_LENGTH) {
        throw new InvariantViolation(
            'INV-PRODUCT-NAME',
            'name',
            `Product name must be ${MAX_PRODUCT_NAME_LENGTH} characters or less. Got ${input.name.length} characters.`
        );
    }
}

function validateActivityCompletion(input: DataRecordInput): void {
    if (input.type !== 'activity') return;

    const data = input.data || {};
    const status = (data as any).status;

    if (status !== 'completed') return;

    const durationSeconds = (data as any).duration_seconds;
    const actualDuration = (data as any).actual_duration;

    if (durationSeconds !== undefined && durationSeconds <= 0) {
        throw new InvariantViolation(
            'INV-ACTIVITY-DURATION',
            'duration_seconds',
            'Activity completion requires duration > 0 seconds.'
        );
    }

    if (actualDuration !== undefined) {
        return;
    }
}

function validateOpportunityProduct(input: DataRecordInput): void {
    if (input.type !== 'opportunity') return;

    const data = input.data || {};
    const primaryProductId = (data as any).primary_product_id;

    if (!primaryProductId) {
        throw new InvariantViolation(
            'INV-PRODUCT-TENSOR',
            'primary_product_id',
            'Opportunity must have a primary product reference (primary_product_id).'
        );
    }
}

function validateOpportunityPipeline(input: DataRecordInput): void {
    if (input.type !== 'opportunity') return;

    const data = input.data || {};
    const pipelineType = (data as any).pipeline_type;

    if (!pipelineType) {
        throw new InvariantViolation(
            'INV-PIPELINE-TYPE',
            'pipeline_type',
            'Opportunity must specify pipeline_type.'
        );
    }
}

function validateUseCase(input: DataRecordInput): void {
    if (input.type !== 'useCase') return;

    const data = input.data || {};
    const linkedSolutionId = (data as any).linked_solution_id;
    const linkedPersonaId = (data as any).linked_persona_id;

    if (!linkedSolutionId || !linkedPersonaId) {
        const missing = !linkedSolutionId ? 'linked_solution_id' : 'linked_persona_id';
        throw new InvariantViolation(
            'INV-USECASE',
            missing,
            'Use case requires both a linked solution and persona (linked_solution_id and linked_persona_id).'
        );
    }
}

// Export individual validators for testing
export const validators = {
    validateProductName,
    validateActivityCompletion,
    validateOpportunityProduct,
    validateOpportunityPipeline,
    validateUseCase,
};
