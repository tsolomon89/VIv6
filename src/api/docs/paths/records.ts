/**
 * @openapi
 * /api/records:
 *   get:
 *     tags:
 *       - Records
 *     summary: List records
 *     description: |
 *       Retrieves a paginated list of records. Can filter by type and search by name.
 *       Results are ordered by updated_at descending.
 *     parameters:
 *       - name: type
 *         in: query
 *         description: Filter by record type (e.g., contact, opportunity, product)
 *         schema:
 *           type: string
 *       - name: search
 *         in: query
 *         description: Search in record name (case-insensitive)
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         description: Number of results to return
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *       - name: offset
 *         in: query
 *         description: Number of results to skip
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Paginated list of records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Record'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *
 *   post:
 *     tags:
 *       - Records
 *     summary: Create record
 *     description: |
 *       Creates a new record. Supports idempotency via X-Idempotency-Key header.
 *       The record type must match an existing object_def.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - name
 *             properties:
 *               type:
 *                 type: string
 *                 description: Record type (must match object_def slug)
 *               name:
 *                 type: string
 *                 description: Display name
 *               slug:
 *                 type: string
 *                 description: URL-friendly identifier (auto-generated if not provided)
 *               data:
 *                 type: object
 *                 description: Type-specific data fields
 *           example:
 *             type: contact
 *             name: John Doe
 *             data:
 *               email: john@example.com
 *               phone: "+1-555-0100"
 *     responses:
 *       201:
 *         description: Record created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *
 * /api/records/{id}:
 *   get:
 *     tags:
 *       - Records
 *     summary: Get record
 *     description: Retrieves a single record by ID or slug
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Record ID (UUID) or slug
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     tags:
 *       - Records
 *     summary: Update record
 *     description: Updates an existing record. Partial updates are supported.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Record ID (UUID)
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Record updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     tags:
 *       - Records
 *     summary: Delete record
 *     description: Permanently deletes a record
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Record ID (UUID)
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Record deleted
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export {};
