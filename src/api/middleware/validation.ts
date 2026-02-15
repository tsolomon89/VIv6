import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
  status: number;
}

export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Log validation errors
        console.log('[Validation Error] Body:', JSON.stringify(req.body));
        console.log('[Validation Error] Issues:', JSON.stringify(error.issues));

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
