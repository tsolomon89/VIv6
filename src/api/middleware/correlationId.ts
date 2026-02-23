/**
 * Request correlation ID middleware
 *
 * Adds a unique correlation ID to each request for tracing across logs.
 * The ID is either extracted from the x-correlation-id header (for distributed tracing)
 * or generated fresh for each request.
 */

import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../../core/logger.js';

const logger = createLogger('http');

// Extend Express Request type to include correlationId
declare global {
    namespace Express {
        interface Request {
            correlationId: string;
        }
    }
}

/**
 * Middleware to add correlation ID to requests
 *
 * - Extracts correlation ID from x-correlation-id header if present
 * - Generates a new UUID if not provided
 * - Adds the correlation ID to the response headers
 * - Logs the incoming request with correlation context
 */
export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction) {
    // Extract or generate correlation ID
    const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();

    // Attach to request for use in handlers
    req.correlationId = correlationId;

    // Add to response headers for client tracking
    res.setHeader('x-correlation-id', correlationId);

    // Log incoming request
    logger.info({
        correlationId,
        method: req.method,
        path: req.path,
        query: Object.keys(req.query).length > 0 ? req.query : undefined,
        ip: req.ip,
        userAgent: req.headers['user-agent']
    }, 'Request received');

    // Log response on finish
    res.on('finish', () => {
        logger.info({
            correlationId,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            contentLength: res.get('content-length')
        }, 'Response sent');
    });

    next();
}
