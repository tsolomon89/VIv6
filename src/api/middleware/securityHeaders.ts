/**
 * Security Headers Middleware
 *
 * Configures helmet with environment-aware CSP and security headers.
 * - Development: Allows 'unsafe-eval' for HMR, localhost connections
 * - Production: Stricter CSP, HSTS with preload
 */

import helmet from 'helmet';
import { RequestHandler } from 'express';

const isDev = process.env.NODE_ENV !== 'production';
const isReportOnly = process.env.CSP_REPORT_ONLY === 'true';

// CSP directives that vary by environment
const scriptSrc = isDev
    ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"]  // Dev needs eval for HMR
    : ["'self'", "'unsafe-inline'"];  // Prod: no eval

const connectSrc = isDev
    ? ["'self'", "http://localhost:*", "ws://localhost:*"]
    : ["'self'"];

export const securityHeaders: RequestHandler = helmet({
    contentSecurityPolicy: {
        reportOnly: isReportOnly,
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc,
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            fontSrc: ["'self'", "data:"],
            connectSrc,
            frameSrc: ["'self'"],
            frameAncestors: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            ...(isDev ? {} : { upgradeInsecureRequests: [] }),
        },
    },
    // Stricter HSTS in production (1 year + preload)
    strictTransportSecurity: isDev
        ? false  // Don't set HSTS in dev (breaks localhost)
        : { maxAge: 31536000, includeSubDomains: true, preload: true },
    // Allow preview iframes to work
    crossOriginEmbedderPolicy: false,
    // X-Frame-Options: Allow same origin (for visual editor preview)
    frameguard: { action: 'sameorigin' },
});
