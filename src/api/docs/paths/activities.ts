/**
 * @openapi
 * /api/activities/{id}/start:
 *   post:
 *     tags:
 *       - Activities
 *     summary: Start activity
 *     description: Transitions an activity from pending to in_progress
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Activity record ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Activity started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       400:
 *         description: Invalid state transition
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /api/activities/{id}/pause:
 *   post:
 *     tags:
 *       - Activities
 *     summary: Pause activity
 *     description: Pauses an in-progress activity
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Activity paused
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       400:
 *         description: Invalid state transition
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /api/activities/{id}/resume:
 *   post:
 *     tags:
 *       - Activities
 *     summary: Resume activity
 *     description: Resumes a paused activity
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Activity resumed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *
 * /api/activities/{id}/complete:
 *   post:
 *     tags:
 *       - Activities
 *     summary: Complete activity
 *     description: |
 *       Marks an activity as completed.
 *       May trigger chain reactions (e.g., opportunity stage advancement).
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Completion notes
 *               qualifiers:
 *                 type: object
 *                 description: Qualifier results from AI evaluation
 *     responses:
 *       200:
 *         description: Activity completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 */
export {};
