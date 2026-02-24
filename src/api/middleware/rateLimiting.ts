/**
 * Rate Limiting Configuration
 *
 * Defines per-endpoint rate limits to protect against abuse.
 * Uses express-rate-limit with different configurations per endpoint type.
 *
 * Rate Limit Tiers:
 * - General: 500 req/15min - Default for most endpoints
 * - Auth: 20 req/15min - Login/register attempts
 * - Upload: 30 req/15min - File uploads (resource intensive)
 * - Build: 10 req/15min - Site builds (CPU intensive)
 * - Reseed: 5 req/15min - Database reseed (admin only)
 * - AI: 60 req/15min - AI operations (external API calls)
 * - Search: 100 req/15min - Search/list operations
 */

import rateLimit from 'express-rate-limit';
import { createLogger } from '../../core/logger.js';

const logger = createLogger('rate-limit');

// Skip rate limiting in test mode
const isTest = process.env.NODE_ENV === 'test';
const skipInTest = () => isTest;

// Standard response for rate limit exceeded
const createRateLimitMessage = (context: string) => ({
    error: `Too many ${context} requests, please try again later`,
    status: 429,
});

/**
 * General rate limiter - Default for most API endpoints
 * 500 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    message: createRateLimitMessage(''),
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    handler: (req, res, next, options) => {
        logger.warn({ ip: req.ip, path: req.path }, 'General rate limit exceeded');
        res.status(options.statusCode).json(options.message);
    },
});

/**
 * Authentication rate limiter - Login/register/password reset
 * 20 requests per 15 minutes (stricter to prevent brute force)
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: createRateLimitMessage('authentication'),
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count all attempts
    skip: skipInTest,
    handler: (req, res, next, options) => {
        logger.warn({ ip: req.ip, path: req.path }, 'Auth rate limit exceeded');
        res.status(options.statusCode).json(options.message);
    },
});

/**
 * Upload rate limiter - File uploads
 * 30 requests per 15 minutes (uploads are expensive)
 */
export const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    message: createRateLimitMessage('upload'),
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    handler: (req, res, next, options) => {
        logger.warn({ ip: req.ip, path: req.path }, 'Upload rate limit exceeded');
        res.status(options.statusCode).json(options.message);
    },
});

/**
 * Build rate limiter - Site generation/builds
 * 10 requests per 15 minutes (very CPU intensive)
 */
export const buildLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: createRateLimitMessage('build'),
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    handler: (req, res, next, options) => {
        logger.warn({ ip: req.ip, path: req.path }, 'Build rate limit exceeded');
        res.status(options.statusCode).json(options.message);
    },
});

/**
 * Reseed rate limiter - Database reseed operations
 * 5 requests per 15 minutes (admin only, very intensive)
 */
export const reseedLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: createRateLimitMessage('reseed'),
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    handler: (req, res, next, options) => {
        logger.warn({ ip: req.ip, path: req.path }, 'Reseed rate limit exceeded');
        res.status(options.statusCode).json(options.message);
    },
});

/**
 * AI rate limiter - AI operations (external API calls)
 * 60 requests per 15 minutes (moderate - depends on external API costs)
 */
export const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60,
    message: createRateLimitMessage('AI'),
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    handler: (req, res, next, options) => {
        logger.warn({ ip: req.ip, path: req.path }, 'AI rate limit exceeded');
        res.status(options.statusCode).json(options.message);
    },
});

/**
 * Search rate limiter - Search/list operations
 * 100 requests per 15 minutes (prevent scraping)
 */
export const searchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: createRateLimitMessage('search'),
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    handler: (req, res, next, options) => {
        logger.warn({ ip: req.ip, path: req.path }, 'Search rate limit exceeded');
        res.status(options.statusCode).json(options.message);
    },
});

/**
 * Derive rate limiter - Template derivation (generates content)
 * 20 requests per 15 minutes (content generation is expensive)
 */
export const deriveLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: createRateLimitMessage('derive'),
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    handler: (req, res, next, options) => {
        logger.warn({ ip: req.ip, path: req.path }, 'Derive rate limit exceeded');
        res.status(options.statusCode).json(options.message);
    },
});
