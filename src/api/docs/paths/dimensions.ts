/**
 * @openapi
 * /api/dimensions:
 *   get:
 *     tags:
 *       - Dimensions
 *     summary: List dimension values
 *     description: Returns dimension values with optional filtering
 *     parameters:
 *       - name: dimension
 *         in: query
 *         description: Filter by dimension type
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 100
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of dimension values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DimensionValue'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *
 *   post:
 *     tags:
 *       - Dimensions
 *     summary: Create dimension value
 *     description: Creates a new dimension value
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dimension
 *               - slug
 *               - label
 *             properties:
 *               dimension:
 *                 type: string
 *               slug:
 *                 type: string
 *               label:
 *                 type: string
 *               parent_id:
 *                 type: string
 *                 format: uuid
 *           example:
 *             dimension: industry
 *             slug: cloud-computing
 *             label: Cloud Computing
 *     responses:
 *       201:
 *         description: Dimension value created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DimensionValue'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *
 * /api/dimensions/types:
 *   get:
 *     tags:
 *       - Dimensions
 *     summary: List dimension types
 *     description: Returns distinct dimension types
 *     responses:
 *       200:
 *         description: List of dimension types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *
 * /api/dimensions/targeting:
 *   get:
 *     tags:
 *       - Dimensions
 *     summary: Reverse lookup
 *     description: Find entities that target a specific dimension value
 *     parameters:
 *       - name: dimension
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *       - name: value
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entities targeting the dimension value
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Record'
 *
 * /api/dimensions/{id}:
 *   delete:
 *     tags:
 *       - Dimensions
 *     summary: Delete dimension value
 *     description: Deletes a dimension value by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Dimension value deleted
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /api/dimensions/dependencies:
 *   get:
 *     tags:
 *       - Dimensions
 *     summary: List dependencies
 *     description: Returns dimension value dependencies (for cascading pick-lists)
 *     responses:
 *       200:
 *         description: List of dependencies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   from_dimension_id:
 *                     type: string
 *                     format: uuid
 *                   to_dimension_id:
 *                     type: string
 *                     format: uuid
 *
 *   post:
 *     tags:
 *       - Dimensions
 *     summary: Create dependency
 *     description: Creates a dependency between two dimension values
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - from_dimension_id
 *               - to_dimension_id
 *             properties:
 *               from_dimension_id:
 *                 type: string
 *                 format: uuid
 *               to_dimension_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Dependency created
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
export {};
