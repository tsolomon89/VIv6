import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initDb } from '../core/db.js';
import recordsRouter from './routes/records.js';
import relationshipsRouter from '../modules/content/api/relationships.js';
import '../modules/crm/crm.ts'; // Register CRM Hooks (Tier 1)
import { errorHandler } from './middleware/errorHandler.js';
import configRouter from './routes/config.js';
import { initSecurityHooks } from '../core/security.js';

// Initialize Security (Tier 0)
initSecurityHooks();

import templatesRouter from '../modules/delivery/api/templates.js';

import deriveRouter from '../modules/delivery/api/derive.js';
import buildRouter from '../modules/delivery/api/build.js';
import dimensionsRouter from './routes/dimensions.js';
import reseedRouter from './routes/reseed.js';
import domainsRouter from '../modules/delivery/api/domains.js';
import schemaRouter from './routes/schema.js';

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
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

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

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/records', recordsRouter);
app.use('/api/relationships', relationshipsRouter);
app.use('/api/config', configRouter);
app.use('/api/templates', templatesRouter);

app.use('/api/derive', deriveRouter);
app.use('/api/builds', buildRouter);
app.use('/api/dimensions', dimensionsRouter);
app.use('/api/domains', domainsRouter);
app.use('/api/schema', schemaRouter);
// app.use('/api/domains', domainsRouter); // Duplicate removed

import analyticsRouter from '../modules/crm/api/analytics.js';
import '../modules/activities/activities.js'; // Register Activity Engine Hooks
import '../modules/commercial/commercial.js'; // Register Commercial Engine Hooks
import activitiesRouter from '../modules/activities/api/routes.js';
import commercialRouter from '../modules/commercial/api/routes.js';

app.use('/api/analytics', analyticsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/commercial', commercialRouter);

import { protectedRoute } from '../modules/auth/middleware.js';
app.use('/api/reseed', ...protectedRoute, reseedRouter);
// Phase 3: Headless Infrastructure
import componentsRouter from './routes/components.js';
app.use('/api/components', componentsRouter);

import usersRouter from './routes/users.js';
app.use('/api/users', usersRouter);

// Auth Module (ODAC - Opportunity-Driven Access Control)
import authRouter from '../modules/auth/api/routes.js';
app.use('/api/auth', authRouter);

import uploadRouter from './routes/upload.js';
app.use('/api/upload', uploadRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server function
import type { Server } from 'http';

export function startServer(port: number = Number(PORT)): Promise<Server> {
    return new Promise((resolve) => {
        const server = app.listen(port, '0.0.0.0', () => {
            console.log(`API server running at http://0.0.0.0:${(server.address() as any).port}`);
            console.log('Available endpoints:');
            console.log('  GET    /api/health');
            resolve(server);
        });
    });
}

// Auto-start if run directly
const nodePath = process.argv[1];
const modulePath = fileURLToPath(import.meta.url);

if (nodePath === modulePath) {
    console.log('Initializing database...');
    initDb();
    startServer();
}

// Export for integration testing
export { initDb };
