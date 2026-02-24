/**
 * Prometheus Metrics Endpoint
 *
 * Exposes application metrics in Prometheus format at /api/metrics.
 * This endpoint should be protected in production (not exposed publicly).
 *
 * Usage:
 * - Prometheus scrape target: http://localhost:3001/api/metrics
 * - Health check: GET /api/metrics returns 200 with metrics payload
 */

import { Router, Request, Response } from 'express';
import { getMetrics, getMetricsAsJSON, dbConnectionStatus } from '../../core/metrics.js';
import { db } from '../../core/db.js';
import { createLogger } from '../../core/logger.js';

const logger = createLogger('metrics');
const router = Router();

/**
 * GET /api/metrics
 * Returns Prometheus-formatted metrics
 */
router.get('/', (req: Request, res: Response) => {
    try {
        // Update database connection status
        try {
            db.prepare('SELECT 1').get();
            dbConnectionStatus.set({}, 1);
        } catch {
            dbConnectionStatus.set({}, 0);
        }

        // Get metrics in Prometheus format
        const metrics = getMetrics();

        res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
        res.end(metrics);
    } catch (err) {
        logger.error({ err }, 'Failed to collect metrics');
        res.status(500).json({ error: 'Failed to collect metrics' });
    }
});

/**
 * GET /api/metrics/json
 * Returns metrics as JSON (useful for debugging)
 */
router.get('/json', (req: Request, res: Response) => {
    try {
        const metrics = getMetricsAsJSON();
        res.json(metrics);
    } catch (err) {
        logger.error({ err }, 'Failed to collect metrics as JSON');
        res.status(500).json({ error: 'Failed to collect metrics' });
    }
});

export default router;
