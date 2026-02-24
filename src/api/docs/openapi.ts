/**
 * OpenAPI 3.0 Specification for VIv5 API
 *
 * This file defines the base OpenAPI spec with common schemas and security definitions.
 * Individual route files add their own endpoint documentation via JSDoc comments.
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'VIv5 API',
            version: '1.0.0',
            description: `
Victory Initiative Platform API - A universal data platform with EAV architecture.

## Authentication

Most endpoints require authentication via one of:
- **Bearer Token**: JWT token in Authorization header
- **API Key**: X-API-Key header for admin operations
- **Session Cookie**: HTTP-only cookie from login

## Rate Limiting

- General API: 500 requests per 15 minutes
- Auth endpoints: 20 requests per 15 minutes

## Pagination

List endpoints support pagination via query parameters:
- \`limit\`: Number of results (default: 50, max: 100)
- \`offset\`: Skip N results

Response includes pagination metadata:
\`\`\`json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
\`\`\`
            `,
            contact: {
                name: 'API Support',
            },
            license: {
                name: 'Proprietary',
            },
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Development server',
            },
        ],
        tags: [
            { name: 'Health', description: 'Health check endpoints' },
            { name: 'Auth', description: 'Authentication and authorization' },
            { name: 'Records', description: 'Universal record CRUD operations' },
            { name: 'Schema', description: 'Object and field definitions' },
            { name: 'Dimensions', description: 'Dimension values and dependencies' },
            { name: 'Relationships', description: 'Entity relationship management' },
            { name: 'Pages', description: 'Page management and preview' },
            { name: 'Templates', description: 'Page templates' },
            { name: 'Presets', description: 'Component preset configurations' },
            { name: 'Domains', description: 'Domain and hostname management' },
            { name: 'Activities', description: 'Activity lifecycle management' },
            { name: 'Commercial', description: 'Opportunities and pipeline' },
            { name: 'AI', description: 'AI agent integration' },
            { name: 'Users', description: 'User management' },
            { name: 'Config', description: 'Brand configuration' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token from /api/auth/login',
                },
                apiKey: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key',
                    description: 'Admin API key for privileged operations',
                },
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'session',
                    description: 'Session cookie from login',
                },
            },
            schemas: {
                // Common response schemas
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', description: 'Error message' },
                        status: { type: 'integer', description: 'HTTP status code' },
                        code: { type: 'string', description: 'Error code' },
                    },
                    required: ['error', 'status'],
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        total: { type: 'integer', description: 'Total number of records' },
                        limit: { type: 'integer', description: 'Results per page' },
                        offset: { type: 'integer', description: 'Number of records skipped' },
                        hasMore: { type: 'boolean', description: 'Whether more results exist' },
                    },
                },

                // Core record schema
                Record: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'Unique identifier' },
                        type: { type: 'string', description: 'Record type (e.g., contact, opportunity)' },
                        slug: { type: 'string', description: 'URL-friendly identifier' },
                        name: { type: 'string', description: 'Display name' },
                        data: { type: 'object', description: 'Type-specific data fields' },
                        account_id: { type: 'string', format: 'uuid', description: 'Owning account' },
                        created_by: { type: 'string', format: 'uuid', description: 'Creator user ID' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                    required: ['id', 'type', 'name'],
                },

                // User schema
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        name: { type: 'string' },
                        primary_account_id: { type: 'string', format: 'uuid' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },

                // Dimension value schema
                DimensionValue: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        dimension: { type: 'string', description: 'Dimension type (e.g., industry, seniority)' },
                        slug: { type: 'string' },
                        label: { type: 'string' },
                        parent_id: { type: 'string', format: 'uuid', nullable: true },
                    },
                },

                // Relationship schema
                Relationship: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        from_id: { type: 'string', format: 'uuid' },
                        to_id: { type: 'string', format: 'uuid' },
                        type: { type: 'string', description: 'Relationship type (e.g., belongs_to, employs)' },
                        data: { type: 'object', description: 'Relationship metadata' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },

                // Activity schema
                Activity: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        type: { type: 'string', const: 'activity' },
                        name: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                status: {
                                    type: 'string',
                                    enum: ['pending', 'in_progress', 'paused', 'completed', 'cancelled'],
                                },
                                activity_def: { type: 'string', description: 'Activity definition slug' },
                                subject_id: { type: 'string', format: 'uuid' },
                                subject_type: { type: 'string' },
                                assignee_id: { type: 'string', format: 'uuid' },
                            },
                        },
                    },
                },

                // Health check schemas
                HealthStatus: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
                        timestamp: { type: 'string', format: 'date-time' },
                        checks: {
                            type: 'object',
                            properties: {
                                database: { $ref: '#/components/schemas/ComponentHealth' },
                                services: {
                                    type: 'object',
                                    properties: {
                                        aiScheduler: { $ref: '#/components/schemas/ServiceState' },
                                        workflowScheduler: { $ref: '#/components/schemas/ServiceState' },
                                        healthDaemon: { $ref: '#/components/schemas/ServiceState' },
                                    },
                                },
                            },
                        },
                        version: { type: 'string' },
                    },
                },
                ComponentHealth: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['up', 'down'] },
                        latencyMs: { type: 'number', description: 'Response time in milliseconds' },
                        error: { type: 'string', description: 'Error message if status is down' },
                    },
                },
                ServiceState: {
                    type: 'object',
                    properties: {
                        running: { type: 'boolean', description: 'Is the service currently running' },
                        enabled: { type: 'boolean', description: 'Is the service configured to auto-start' },
                    },
                },
                // Legacy health response (deprecated, use HealthStatus)
                HealthResponse: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['ok', 'degraded', 'unhealthy'] },
                        timestamp: { type: 'string', format: 'date-time' },
                    },
                },
            },
            responses: {
                BadRequest: {
                    description: 'Invalid request parameters',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                        },
                    },
                },
                Unauthorized: {
                    description: 'Authentication required',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                        },
                    },
                },
                Forbidden: {
                    description: 'Insufficient permissions',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                        },
                    },
                },
                NotFound: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                        },
                    },
                },
                Conflict: {
                    description: 'Resource already exists',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                        },
                    },
                },
                RateLimited: {
                    description: 'Too many requests',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                        },
                    },
                },
            },
        },
        security: [
            { bearerAuth: [] },
            { apiKey: [] },
            { cookieAuth: [] },
        ],
    },
    apis: [
        './src/api/routes/*.ts',
        './src/api/docs/paths/*.ts',
        './src/modules/*/api/routes.ts',
    ],
};

export const swaggerSpec = swaggerJsdoc(options);
