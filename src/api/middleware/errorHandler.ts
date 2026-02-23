import { Request, Response, NextFunction } from 'express';
import { errors } from './validation.js';
import { InvariantViolation } from '../../core/invariants.js';
import { createLogger } from '../../core/logger.js';

const logger = createLogger('error');

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log with structured context
  logger.error({
    err,
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    statusCode: res.statusCode
  }, 'API Error');

  // Handle InvariantViolation errors (business rule violations)
  if (err instanceof InvariantViolation || err.name === 'InvariantViolation') {
    res.status(400).json(errors.badRequest(err.message));
    return;
  }

  // Handle SQLite unique constraint violations
  if (err.message?.includes('UNIQUE constraint failed')) {
    const match = err.message.match(/(?:entities|records|page_templates)\.(\w+)/);
    const field = match ? match[1] : 'field';

    res.status(409).json(errors.conflict(`Duplicate ${field}: this ${field} already exists`));
    return;
  }

  // Handle foreign key violations
  if (err.message?.includes('FOREIGN KEY constraint failed')) {
    res.status(400).json(errors.badRequest('Referenced resource not found'));
    return;
  }

  // Handle NOT NULL constraint violations
  if (err.message?.includes('NOT NULL constraint failed')) {
    const match = err.message.match(/NOT NULL constraint failed: (\w+)\.(\w+)/);
    const field = match ? match[2] : 'field';

    res.status(400).json(errors.badRequest(`Missing required field: ${field}`));
    return;
  }

  // Generic error
  res.status(500).json(errors.internal(err.message || 'Internal server error'));
}
