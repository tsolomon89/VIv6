/**
 * Environment variable validation and typing
 *
 * Validates required environment variables at startup and provides
 * typed access to configuration values.
 */

import { z } from 'zod';

// Schema for environment variables
const envSchema = z.object({
    // Environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Server
    API_PORT: z.string().default('3001'),
    CORS_ORIGINS: z.string().optional(),

    // Security (optional in dev, required in production)
    JWT_SECRET: z.string().optional(),
    ADMIN_KEY: z.string().optional(),
    AI_ENCRYPTION_KEY: z.string().optional(),

    // Logging
    LOG_LEVEL: z.enum(['silent', 'trace', 'debug', 'info', 'warn', 'error', 'fatal']).optional(),

    // Background services
    AI_SCHEDULER_AUTO_START: z.string().optional(),
    AI_SCHEDULER_INTERVAL: z.string().optional(),
    WORKFLOW_SCHEDULER_AUTO_START: z.string().optional(),
    WORKFLOW_SCHEDULER_INTERVAL: z.string().optional(),
    HEALTH_DAEMON_AUTO_START: z.string().optional(),
    HEALTH_DAEMON_INTERVAL: z.string().optional(),

    // Testing
    VITEST_WORKER_ID: z.string().optional(),
});

// Production-specific validations
const productionSchema = envSchema.refine(
    (env) => env.NODE_ENV !== 'production' || (env.JWT_SECRET && env.JWT_SECRET.length >= 32),
    { message: 'JWT_SECRET must be at least 32 characters in production' }
).refine(
    (env) => env.NODE_ENV !== 'production' || (env.ADMIN_KEY && env.ADMIN_KEY !== 'secret' && env.ADMIN_KEY.length >= 16),
    { message: 'ADMIN_KEY must be secure (not "secret", at least 16 chars) in production' }
);

// Parse and validate environment
function parseEnv() {
    const result = productionSchema.safeParse(process.env);

    if (!result.success) {
        console.error('❌ Environment validation failed:');
        for (const issue of result.error.issues) {
            console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
        }
        // In production, fail hard. In development, warn and continue.
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
        console.warn('⚠️  Continuing with invalid environment (development mode)');
        // Return parsed values without refinement checks for dev
        return envSchema.parse(process.env);
    }

    return result.data;
}

// Export validated environment
export const env = parseEnv();

// Helper to check if running in production
export const isProduction = env.NODE_ENV === 'production';

// Helper to check if running in test
export const isTest = env.NODE_ENV === 'test' || !!env.VITEST_WORKER_ID;

// Helper to check if running in development
export const isDevelopment = env.NODE_ENV === 'development' && !isTest;
