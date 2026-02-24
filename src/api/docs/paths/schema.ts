/**
 * @openapi
 * /api/schema/objects:
 *   get:
 *     tags:
 *       - Schema
 *     summary: List object definitions
 *     description: Returns all object definitions (entity types) in the system
 *     responses:
 *       200:
 *         description: List of object definitions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       slug:
 *                         type: string
 *                       name:
 *                         type: string
 *                       data:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           fieldGroupStructs:
 *                             type: array
 *                             items:
 *                               type: object
 *
 * /api/schema/objects/{slug}:
 *   get:
 *     tags:
 *       - Schema
 *     summary: Get object definition
 *     description: Returns a single object definition by slug
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         description: Object definition slug (e.g., contact, opportunity)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Object definition
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /api/schema/objects/{slug}/fields:
 *   get:
 *     tags:
 *       - Schema
 *     summary: Get flattened fields
 *     description: Returns all fields for an object type in a flat array
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of field definitions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [text, number, email, phone, date, datetime, select, multiselect, textarea, checkbox, ref, dimension]
 *                   required:
 *                     type: boolean
 *                   dimension:
 *                     type: string
 *                   ref_target:
 *                     type: string
 *
 * /api/schema/dimensions:
 *   get:
 *     tags:
 *       - Schema
 *     summary: List dimension types
 *     description: Returns all distinct dimension types in the system
 *     responses:
 *       200:
 *         description: List of dimension types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["industry", "sector", "seniority", "function", "company_size"]
 *
 * /api/schema/dimensions/{dimension}/values:
 *   get:
 *     tags:
 *       - Schema
 *     summary: Get dimension values
 *     description: |
 *       Returns values for a specific dimension type.
 *       Supports cascading filters via query parameters.
 *     parameters:
 *       - name: dimension
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: industry
 *       - name: filter[sector]
 *         in: query
 *         description: Filter by parent dimension value (cascading pick-list)
 *         schema:
 *           type: string
 *         example: technology
 *     responses:
 *       200:
 *         description: List of dimension values
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DimensionValue'
 *
 * /api/schema/activity-defs:
 *   get:
 *     tags:
 *       - Schema
 *     summary: List activity definitions
 *     description: Returns all activity type definitions
 *     responses:
 *       200:
 *         description: List of activity definitions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       slug:
 *                         type: string
 *                       name:
 *                         type: string
 *                       data:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                             enum: [data, asset, engagement, admin]
 *                           qualifiers:
 *                             type: array
 */
export {};
