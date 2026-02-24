/**
 * Health Check Utilities
 *
 * Provides health check functions for database, services, and overall system health.
 * Used by health check endpoints for Kubernetes probes and monitoring.
 */

import { db } from './db.js';
import { createLogger } from './logger.js';

const logger = createLogger('health');

export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    checks: {
        database: ComponentHealth;
        services?: ServiceHealth;
    };
    version?: string;
}

export interface ComponentHealth {
    status: 'up' | 'down';
    latencyMs?: number;
    error?: string;
}

export interface ServiceHealth {
    aiScheduler: ServiceState;
    workflowScheduler: ServiceState;
    healthDaemon: ServiceState;
}

export interface ServiceState {
    running: boolean;
    enabled: boolean;
}

/**
 * Check database connectivity
 * Executes a simple query and measures latency
 */
export function checkDatabase(): ComponentHealth {
    const start = Date.now();
    try {
        db.prepare('SELECT 1').get();
        return { status: 'up', latencyMs: Date.now() - start };
    } catch (err) {
        logger.error({ err }, 'Database health check failed');
        return {
            status: 'down',
            latencyMs: Date.now() - start,
            error: err instanceof Error ? err.message : 'Unknown error'
        };
    }
}

/**
 * Check background service status
 * Uses existing status functions from each service module
 */
export async function checkServices(): Promise<ServiceHealth> {
    // Dynamic imports to avoid circular dependencies and handle missing modules gracefully
    let aiSchedulerRunning = false;
    let workflowSchedulerRunning = false;
    let healthDaemonRunning = false;

    try {
        const { isSchedulerRunning } = await import('../modules/ai/execution/scheduler.js');
        aiSchedulerRunning = isSchedulerRunning();
    } catch (err) {
        logger.debug({ err }, 'AI scheduler module not available');
    }

    try {
        const { isWorkflowSchedulerRunning } = await import('../modules/workflows/scheduler.js');
        workflowSchedulerRunning = isWorkflowSchedulerRunning();
    } catch (err) {
        logger.debug({ err }, 'Workflow scheduler module not available');
    }

    try {
        const { isHealthDaemonRunning } = await import('../modules/health/daemon.js');
        healthDaemonRunning = isHealthDaemonRunning();
    } catch (err) {
        logger.debug({ err }, 'Health daemon module not available');
    }

    return {
        aiScheduler: {
            running: aiSchedulerRunning,
            enabled: process.env.AI_SCHEDULER_AUTO_START === 'true'
        },
        workflowScheduler: {
            running: workflowSchedulerRunning,
            enabled: process.env.WORKFLOW_SCHEDULER_AUTO_START === 'true'
        },
        healthDaemon: {
            running: healthDaemonRunning,
            enabled: process.env.HEALTH_DAEMON_AUTO_START === 'true'
        }
    };
}

/**
 * Get full health status
 * Combines database and service checks into overall health
 */
export async function getFullHealth(): Promise<HealthStatus> {
    const dbHealth = checkDatabase();
    const services = await checkServices();

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (dbHealth.status === 'down') {
        status = 'unhealthy';
    } else {
        // Check if enabled services are running
        const serviceList = [services.aiScheduler, services.workflowScheduler, services.healthDaemon];
        const enabledNotRunning = serviceList.some(s => s.enabled && !s.running);

        if (enabledNotRunning) {
            status = 'degraded';
        }
    }

    return {
        status,
        timestamp: new Date().toISOString(),
        checks: {
            database: dbHealth,
            services
        },
        version: process.env.npm_package_version
    };
}
