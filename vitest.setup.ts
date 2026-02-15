/**
 * Vitest Global Setup
 *
 * This file runs once before all tests.
 * Per-test setup (like database reset) should be handled in individual test files
 * using beforeEach() hooks.
 */

// Initialize database on first load
import { initDb } from './src/core/db';

// Ensure database is initialized before any tests run
initDb();
