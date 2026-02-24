/**
 * @openapi
 * /api/relationships:
 *   get:
 *     tags:
 *       - Relationships
 *     summary: List relationships
 *     description: Returns relationships with optional filtering by from_id, to_id, or type
 *     parameters:
 *       - name: from_id
 *         in: query
 *         description: Filter by source entity ID
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: to_id
 *         in: query
 *         description: Filter by target entity ID
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: type
 *         in: query
 *         description: Filter by relationship type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of relationships
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Relationship'
 *
 *   post:
 *     tags:
 *       - Relationships
 *     summary: Create relationship
 *     description: Creates a relationship between two entities
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - from_id
 *               - to_id
 *               - type
 *             properties:
 *               from_id:
 *                 type: string
 *                 format: uuid
 *               to_id:
 *                 type: string
 *                 format: uuid
 *               type:
 *                 type: string
 *                 description: Relationship type (e.g., belongs_to, employs, owns)
 *               data:
 *                 type: object
 *                 description: Additional relationship metadata
 *           example:
 *             from_id: "123e4567-e89b-12d3-a456-426614174000"
 *             to_id: "987fcdeb-51a2-3bc4-d567-890123456789"
 *             type: "employs"
 *             data:
 *               role: "Software Engineer"
 *               start_date: "2024-01-15"
 *     responses:
 *       201:
 *         description: Relationship created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Relationship'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *
 * /api/relationships/{id}:
 *   get:
 *     tags:
 *       - Relationships
 *     summary: Get relationship
 *     description: Returns a single relationship by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Relationship found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Relationship'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     tags:
 *       - Relationships
 *     summary: Delete relationship
 *     description: Deletes a relationship
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Relationship deleted
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export {};
