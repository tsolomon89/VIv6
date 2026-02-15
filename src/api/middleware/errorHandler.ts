import { Request, Response, NextFunction } from 'express';
import { ApiError } from './validation.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('API Error:', err);

  // Handle SQLite unique constraint violations
  if (err.message?.includes('UNIQUE constraint failed')) {
    const match = err.message.match(/entities\.(\w+)/);
    const field = match ? match[1] : 'field';
    
    res.status(409).json({
      error: `Duplicate ${field}`,
      details: { [field]: [`This ${field} already exists`] },
      status: 409,
    } as ApiError);
    return;
  }

  // Handle foreign key violations
  if (err.message?.includes('FOREIGN KEY constraint failed')) {
    res.status(400).json({
      error: 'Referenced entity not found',
      status: 400,
    } as ApiError);
    return;
  }

  // Generic error
  res.status(500).json({
    error: err.message || 'Internal server error',
    status: 500,
  } as ApiError);
}
