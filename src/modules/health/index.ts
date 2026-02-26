/**
 * Health Module - Main Entry Point
 *
 * Exports all health-related functionality.
 * Import this module to register hooks.
 */

export { HealthEngine, HealthCalculationResult } from './engine.js';
export {
    startHealthDaemon,
    stopHealthDaemon,
    isHealthDaemonRunning,
    processHealthDecay,
    processHealthDecayForType,
    DecayProcessResult
} from './daemon.js';

// Import health.ts to register hooks
import './health.js';
