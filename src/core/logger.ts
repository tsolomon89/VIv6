/**
 * Structured logging using Pino
 *
 * Provides JSON logging in production and pretty-printed logs in development.
 * Use createLogger() to create module-specific loggers with context.
 */

import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITEST_WORKER_ID;

// Base logger configuration
export const logger = pino({
    level: process.env.LOG_LEVEL || (isTest ? 'silent' : isDev ? 'debug' : 'info'),
    transport: isDev && !isTest ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
        }
    } : undefined,
    base: isDev ? undefined : { pid: process.pid },
    timestamp: pino.stdTimeFunctions.isoTime,
    // Redact sensitive fields
    redact: {
        paths: ['password', 'secret', 'token', 'apiKey', 'authorization'],
        censor: '[REDACTED]'
    }
});

/**
 * Create a child logger for a specific module
 *
 * @param module - Module name (e.g., 'http', 'auth', 'workflows')
 * @returns Pino logger instance with module context
 *
 * @example
 * const logger = createLogger('auth');
 * logger.info({ userId }, 'User logged in');
 * logger.error({ err }, 'Authentication failed');
 */
export function createLogger(module: string) {
    return logger.child({ module });
}

/**
 * Create a request-scoped logger with correlation ID
 *
 * @param module - Module name
 * @param correlationId - Request correlation ID
 * @returns Pino logger instance with module and correlation context
 */
export function createRequestLogger(module: string, correlationId: string) {
    return logger.child({ module, correlationId });
}

// Export types for consumers
export type Logger = pino.Logger;
