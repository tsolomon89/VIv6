/**
 * API Documentation Route
 *
 * Serves OpenAPI/Swagger documentation at /api/docs
 */

import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../docs/openapi.js';

const router = Router();

// Serve OpenAPI spec as JSON
router.get('/spec', (req, res) => {
    res.json(swaggerSpec);
});

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'VIv5 API Documentation',
    customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 20px 0 }
        .swagger-ui .info .title { font-size: 2em }
    `,
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
    },
}));

export default router;
