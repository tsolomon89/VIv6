import { Request } from 'express';

/**
 * Pagination utilities for API endpoints
 */

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Default pagination values
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 500;

/**
 * Parse pagination parameters from request query
 */
export function parsePagination(req: Request): PaginationParams {
  let limit = parseInt(req.query.limit as string, 10);
  let offset = parseInt(req.query.offset as string, 10);

  // Validate and apply defaults
  if (isNaN(limit) || limit < 1) {
    limit = DEFAULT_LIMIT;
  } else if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  if (isNaN(offset) || offset < 0) {
    offset = 0;
  }

  return { limit, offset };
}

/**
 * Create a paginated response with metadata
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      total,
      limit: params.limit,
      offset: params.offset,
      hasMore: params.offset + data.length < total,
    },
  };
}

/**
 * Apply LIMIT and OFFSET to a SQL query
 * Returns the modified query string
 */
export function applyPaginationToQuery(
  query: string,
  params: PaginationParams
): string {
  // Remove any existing LIMIT/OFFSET (case insensitive)
  let cleanQuery = query.replace(/\s+LIMIT\s+\d+(\s+OFFSET\s+\d+)?/gi, '');

  return `${cleanQuery} LIMIT ${params.limit} OFFSET ${params.offset}`;
}

/**
 * Create count query from a SELECT query
 * Wraps the query as a subquery
 */
export function createCountQuery(selectQuery: string): string {
  // Remove ORDER BY clause for count query (performance)
  const withoutOrder = selectQuery.replace(/\s+ORDER\s+BY\s+[^)]+$/gi, '');
  return `SELECT COUNT(*) as total FROM (${withoutOrder}) as count_subquery`;
}
