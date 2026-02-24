import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { securityHeaders } from './middleware/securityHeaders.js';
import {
    generalLimiter,
    authLimiter,
    uploadLimiter,
    buildLimiter,
    reseedLimiter,
    aiLimiter,
    deriveLimiter,
} from './middleware/rateLimiting.js';
import { db, initDb } from '../core/db.js';
import { createLogger } from '../core/logger.js';
import '../core/env.js'; // Validate environment at startup
import recordsRouter from './routes/records.js';
import relationshipsRouter from '../modules/content/api/relationships.js';
import '../modules/crm/crm.ts'; // Register CRM Hooks (Tier 1)
import '../modules/health/health.js'; // Register Health Hooks
import '../modules/workflows/workflows.js'; // Register Workflow Hooks
import { errorHandler } from './middleware/errorHandler.js';
import { correlationIdMiddleware } from './middleware/correlationId.js';
import { metricsMiddleware } from './middleware/metricsMiddleware.js';
import configRouter from './routes/config.js';
import { initSecurityHooks } from '../core/security.js';

const logger = createLogger('server');

// Global error handlers for uncaught errors
process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, 'Unhandled Rejection');
    // Don't exit - log and continue
});

process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught Exception - exiting');
    // Exit on uncaught - state may be corrupt
    process.exit(1);
});

// Initialize Security (Tier 0)
initSecurityHooks();

import templatesRouter from '../modules/delivery/api/templates.js';

import deriveRouter from '../modules/delivery/api/derive.js';
import buildRouter from '../modules/delivery/api/build.js';
import dimensionsRouter from './routes/dimensions.js';
import reseedRouter from './routes/reseed.js';
import domainsRouter from '../modules/delivery/api/domains.js';
import schemaRouter from './routes/schema.js';
import pagesRouter from './routes/pages.js';
import presetsRouter from './routes/presets.js';

import { initDeliveryModule } from '../modules/delivery/index.js';
import { fileURLToPath } from 'url';

initDeliveryModule();

export const app = express();
const PORT = process.env.API_PORT || 3001;

// Initialize database
// console.log('Initializing database...'); 
// initDb(); 
// MOVED inside auto-start block or export

// Middleware
// CORS configuration - allow all localhost ports in development
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    // Allow all localhost/127.0.0.1 origins in development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    // Check explicit allowlist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Increased for reseed payloads
app.use(cookieParser());

// Security headers (CSP, HSTS, X-Frame-Options, etc.)
app.use(securityHeaders);

// Apply general rate limit to all API routes (500 req/15min)
// Specific endpoints have stricter limits applied at route level
app.use('/api', generalLimiter);

// Correlation ID for request tracing
app.use('/api', correlationIdMiddleware);

// Metrics collection (Prometheus)
app.use('/api', metricsMiddleware);

// Audit Log (Phase 14)
import { auditMiddleware } from './middleware/audit.js';
app.use(auditMiddleware);

// Serve static site for preview
import path from 'path';
const DIST_DIR = path.resolve(process.cwd(), 'dist');
app.use('/preview', express.static(DIST_DIR));
app.use('/assets', express.static(path.join(DIST_DIR, 'assets')));

// Serve uploaded files
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve theme preview (React App)
const THEME_DIST_DIR = path.resolve(process.cwd(), 'src/themes/victory-studio/dist');
app.use('/preview-theme', express.static(THEME_DIST_DIR));

// API Routes
app.use('/api/records', recordsRouter);
app.use('/api/relationships', relationshipsRouter);
app.use('/api/config', configRouter);
app.use('/api/templates', templatesRouter);

app.use('/api/derive', deriveLimiter, deriveRouter);
app.use('/api/builds', buildLimiter, buildRouter);
app.use('/api/dimensions', dimensionsRouter);
app.use('/api/domains', domainsRouter);
app.use('/api/schema', schemaRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/presets', presetsRouter);
// app.use('/api/domains', domainsRouter); // Duplicate removed

import analyticsRouter from '../modules/crm/api/analytics.js';
import '../modules/activities/activities.js'; // Register Activity Engine Hooks
import '../modules/commercial/commercial.js'; // Register Commercial Engine Hooks
// Invariant validations are now data-driven via ConstraintEngine
// Legacy hook registration removed - validation_constraint records enforce invariants
import activitiesRouter from '../modules/activities/api/routes.js';
import commercialRouter from '../modules/commercial/api/routes.js';

app.use('/api/analytics', analyticsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/commercial', commercialRouter);

import { protectedRoute } from '../modules/auth/middleware.js';
app.use('/api/reseed', reseedLimiter, ...protectedRoute, reseedRouter);
// Phase 3: Headless Infrastructure
import componentsRouter from './routes/components.js';
app.use('/api/components', componentsRouter);

import usersRouter from './routes/users.js';
app.use('/api/users', usersRouter);

// Auth Module (ODAC - Opportunity-Driven Access Control)
import authRouter from '../modules/auth/api/routes.js';
app.use('/api/auth', authLimiter, authRouter);

// AI Module (AI Agent Integration)
import aiRouter from '../modules/ai/api/routes.js';
app.use('/api/ai', aiLimiter, aiRouter);

// Register AI hooks for automatic activity execution
import('../modules/ai/index.js').then(ai => ai.registerAIHooks());

import uploadRouter from './routes/upload.js';
app.use('/api/upload', uploadLimiter, uploadRouter);

// API Documentation (Swagger UI)
import docsRouter from './routes/docs.js';
app.use('/api/docs', docsRouter);

// Health check endpoints (Kubernetes probes)
import healthRouter from './routes/health.js';
app.use('/api/health', healthRouter);

// Prometheus metrics endpoint
import metricsRouter from './routes/metrics.js';
app.use('/api/metrics', metricsRouter);

// Error handler (must be last)
app.use(errorHandler);

// Start server function
import type { Server } from 'http';

// Track active server for graceful shutdown
let activeServer: Server | null = null;

function gracefulShutdown(signal: string) {
    logger.info({ signal }, 'Shutdown signal received, shutting down gracefully...');

    if (activeServer) {
        activeServer.close(() => {
            logger.info('HTTP server closed');
            // Close database connection
            try {
                db.close();
                logger.info('Database connection closed');
            } catch (err) {
                logger.error({ err }, 'Error closing database');
            }
            process.exit(0);
        });

        // Force exit after 10 seconds
        setTimeout(() => {
            logger.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export function startServer(port: number = Number(PORT)): Promise<Server> {
    return new Promise((resolve, reject) => {
        const server = app.listen(port, '0.0.0.0', () => {
            const addr = server.address();
            const actualPort = addr && typeof addr === 'object' ? addr.port : port;
            logger.info({ port: actualPort, host: '0.0.0.0' }, 'API server started');
            activeServer = server; // Track for graceful shutdown
            resolve(server);
        });

        server.on('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'EADDRINUSE') {
                logger.error({ port }, 'Port is already in use');
            } else {
                logger.error({ err }, 'Server error');
            }
            reject(err);
        });
    });
}

// Auto-start if run directly
const nodePath = process.argv[1];
const modulePath = fileURLToPath(import.meta.url);

if (nodePath === modulePath) {
    logger.info('Initializing database...');
    initDb();
    startServer().then(async () => {
        // Optionally start AI scheduler based on environment variable
        if (process.env.AI_SCHEDULER_AUTO_START === 'true') {
            const { startScheduler } = await import('../modules/ai/execution/scheduler.js');
            const intervalMs = parseInt(process.env.AI_SCHEDULER_INTERVAL || '30000');
            logger.info({ intervalMs }, 'Starting AI background scheduler');
            startScheduler('', intervalMs); // Empty string = all accounts
        }

        // Optionally start Workflow scheduler
        if (process.env.WORKFLOW_SCHEDULER_AUTO_START === 'true') {
            const { startWorkflowScheduler } = await import('../modules/workflows/scheduler.js');
            const intervalMs = parseInt(process.env.WORKFLOW_SCHEDULER_INTERVAL || '60000');
            logger.info({ intervalMs }, 'Starting Workflow background scheduler');
            startWorkflowScheduler('', intervalMs);
        }

        // Optionally start Health decay daemon
        if (process.env.HEALTH_DAEMON_AUTO_START === 'true') {
            const { startHealthDaemon } = await import('../modules/health/daemon.js');
            const intervalMs = parseInt(process.env.HEALTH_DAEMON_INTERVAL || '300000');
            logger.info({ intervalMs }, 'Starting Health decay daemon');
            startHealthDaemon('', intervalMs);
        }
    });
}

// Export for integration testing
export { initDb };
