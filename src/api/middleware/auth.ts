/**
 * @deprecated This middleware is deprecated. Use the ODAC auth middleware instead.
 * @see src/modules/auth/middleware.ts - protectedRoute, allowApiKeyBypass, parseSession, requireSession, loadODAC
 *
 * Migration: Replace `requireAuth` with `...protectedRoute` from '@/modules/auth/middleware.js'
 *
 * This file is kept for backwards compatibility but should not be used in new code.
 */
import { Request, Response, NextFunction } from 'express';

/** @deprecated Use allowApiKeyBypass from src/modules/auth/middleware.ts instead */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  const validKey = process.env.ADMIN_KEY;

  if (!validKey) {
    // If ADMIN_KEY is not set in env, we might want to fail safe or warn.
    // For now, let's log a warning and block defaults for safety.
    console.warn('WARNING: ADMIN_KEY not set in environment. Blocking protected route.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!apiKey || apiKey !== validKey) {
    console.log(`[AUTH FAIL] Received: '${apiKey}', Expected: '${validKey}'`);
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
  }

  res.locals.isAdmin = true;
  next();
};
