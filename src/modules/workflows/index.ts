/**
 * Workflows Module - Main Entry Point
 *
 * Exports all workflow-related functionality.
 * Import this module to register hooks.
 */

export { WorkflowEngine, StepResult, ProcessResult } from './engine.js';
export {
    startWorkflowScheduler,
    stopWorkflowScheduler,
    isWorkflowSchedulerRunning,
    triggerWorkflowProcessing
} from './scheduler.js';
export { executeStepHandler, StepHandler } from './handlers.js';

// Import workflows.ts to register hooks
import './workflows.js';
