/**
 * Metrics Middleware
 *
 * Records HTTP request metrics for Prometheus monitoring.
 * Tracks request duration and counts by method, route, and status code.
 */

import { Request, Response, NextFunction } from 'express';
import { recordHttpRequest } from '../../core/metrics.js';

/**
 * Middleware to record HTTP request metrics
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
    const startTime = process.hrtime.bigint();

    // Record metrics after response is sent
    res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const durationNs = Number(endTime - startTime);
        const durationSeconds = durationNs / 1e9;

        recordHttpRequest(
            req.method,
            req.path,
            res.statusCode,
            durationSeconds
        );
    });

    next();
}
