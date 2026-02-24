/**
 * Health Check Routes
 *
 * Provides Kubernetes-compatible health probes:
 * - /api/health - Full health check with all component statuses
 * - /api/health/live - Liveness probe (is the process alive?)
 * - /api/health/ready - Readiness probe (can we serve traffic?)
 * - /api/health/startup - Startup probe (has initialization completed?)
 */

import { Router } from 'express';
import { checkDatabase, getFullHealth } from '../../core/health.js';

const router = Router();

/**
 * GET /api/health - Full health check
 * Returns detailed health status with all component checks
 *
 * Response codes:
 * - 200: System healthy or degraded
 * - 503: System unhealthy (critical component down)
 */
router.get('/', async (req, res) => {
    const health = await getFullHealth();
    const statusCode = health.status === 'unhealthy' ? 503 : 200;
    res.status(statusCode).json(health);
});

/**
 * GET /api/health/live - Liveness probe
 * Kubernetes liveness check - is the process alive?
 *
 * Always returns 200 unless process should be restarted.
 * Does not check dependencies (database, services).
 */
router.get('/live', (req, res) => {
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/health/ready - Readiness probe
 * Kubernetes readiness check - can we serve traffic?
 *
 * Checks database connectivity.
 * Returns 503 if database is unavailable.
 */
router.get('/ready', (req, res) => {
    const dbHealth = checkDatabase();

    if (dbHealth.status === 'up') {
        res.status(200).json({
            status: 'ready',
            timestamp: new Date().toISOString(),
            database: dbHealth
        });
    } else {
        res.status(503).json({
            status: 'not_ready',
            timestamp: new Date().toISOString(),
            database: dbHealth
        });
    }
});

/**
 * GET /api/health/startup - Startup probe
 * Kubernetes startup check - has initialization completed?
 *
 * Checks if database is accessible (initialization complete).
 * Returns 503 while still starting up.
 */
router.get('/startup', (req, res) => {
    const dbHealth = checkDatabase();

    if (dbHealth.status === 'up') {
        res.status(200).json({
            status: 'started',
            timestamp: new Date().toISOString()
        });
    } else {
        res.status(503).json({
            status: 'starting',
            timestamp: new Date().toISOString()
        });
    }
});

export default router;
