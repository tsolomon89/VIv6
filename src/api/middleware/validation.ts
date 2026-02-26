import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

/**
 * Standardized API Error Response Format
 *
 * All API errors should use this format for consistency.
 * - error: Human-readable error message
 * - status: HTTP status code
 * - details: Optional field-level validation errors
 * - hint: Optional guidance for fixing the error
 * - code: Optional machine-readable error code
 */
export interface ApiError {
  error: string;
  status: number;
  details?: Record<string, string[]>;
  hint?: string;
  code?: string;
}

/**
 * Create a standardized error response
 */
export function createError(
  status: number,
  message: string,
  options?: { details?: Record<string, string[]>; hint?: string; code?: string }
): ApiError {
  return {
    error: message,
    status,
    ...(options?.details && { details: options.details }),
    ...(options?.hint && { hint: options.hint }),
    ...(options?.code && { code: options.code }),
  };
}

/**
 * Common error factory functions
 */
export const errors = {
  badRequest: (message: string, hint?: string) =>
    createError(400, message, { hint, code: 'BAD_REQUEST' }),

  unauthorized: (message = 'Authentication required') =>
    createError(401, message, { code: 'UNAUTHORIZED' }),

  forbidden: (message = 'Access denied') =>
    createError(403, message, { code: 'FORBIDDEN' }),

  notFound: (resource = 'Resource') =>
    createError(404, `${resource} not found`, { code: 'NOT_FOUND' }),

  conflict: (message: string) =>
    createError(409, message, { code: 'CONFLICT' }),

  validationFailed: (details: Record<string, string[]>) =>
    createError(400, 'Validation failed', { details, code: 'VALIDATION_ERROR' }),

  internal: (message = 'Internal server error') =>
    createError(500, message, { code: 'INTERNAL_ERROR' }),
};

export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const field = issue.path.join('.');
          if (!details[field]) {
            details[field] = [];
          }
          details[field].push(issue.message);
        }
        
        res.status(400).json({
          error: 'Validation failed',
          details,
          status: 400,
        } as ApiError);
        return;
      }
      next(error);
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Just validate, don't try to assign back to req.query (which is read-only in Express 5)
      const validated = schema.parse(req.query);
      // Store validated query in a custom property
      (req as any).validatedQuery = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const field = issue.path.join('.');
          if (!details[field]) {
            details[field] = [];
          }
          details[field].push(issue.message);
        }
        
        res.status(400).json({
          error: 'Invalid query parameters',
          details,
          status: 400,
        } as ApiError);
        return;
      }
      next(error);
    }
  };
}
