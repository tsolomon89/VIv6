/**
 * @openapi
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Full health check
 *     description: |
 *       Returns detailed health status including database connectivity and background service states.
 *       Use this endpoint for monitoring dashboards.
 *
 *       Status values:
 *       - **healthy**: All components operational
 *       - **degraded**: Some non-critical services down
 *       - **unhealthy**: Critical components (database) down
 *     security: []
 *     responses:
 *       200:
 *         description: System healthy or degraded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 *             example:
 *               status: healthy
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *               checks:
 *                 database:
 *                   status: up
 *                   latencyMs: 2
 *                 services:
 *                   aiScheduler:
 *                     running: false
 *                     enabled: false
 *                   workflowScheduler:
 *                     running: false
 *                     enabled: false
 *                   healthDaemon:
 *                     running: false
 *                     enabled: false
 *       503:
 *         description: System unhealthy (database unavailable)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 *
 * /api/health/live:
 *   get:
 *     tags:
 *       - Health
 *     summary: Liveness probe
 *     description: |
 *       Kubernetes liveness probe - is the process alive?
 *
 *       Always returns 200 unless process should be restarted.
 *       Does not check external dependencies.
 *     security: []
 *     responses:
 *       200:
 *         description: Process is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [alive]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               status: alive
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *
 * /api/health/ready:
 *   get:
 *     tags:
 *       - Health
 *     summary: Readiness probe
 *     description: |
 *       Kubernetes readiness probe - can we serve traffic?
 *
 *       Checks database connectivity. Returns 503 if database unavailable.
 *       Use this to determine if the pod should receive traffic.
 *     security: []
 *     responses:
 *       200:
 *         description: Ready to serve traffic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [ready]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 database:
 *                   $ref: '#/components/schemas/ComponentHealth'
 *             example:
 *               status: ready
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *               database:
 *                 status: up
 *                 latencyMs: 1
 *       503:
 *         description: Not ready - database unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [not_ready]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 database:
 *                   $ref: '#/components/schemas/ComponentHealth'
 *
 * /api/health/startup:
 *   get:
 *     tags:
 *       - Health
 *     summary: Startup probe
 *     description: |
 *       Kubernetes startup probe - has initialization completed?
 *
 *       Checks if the application has finished starting up.
 *       Returns 503 while still initializing.
 *     security: []
 *     responses:
 *       200:
 *         description: Startup complete
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [started]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               status: started
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *       503:
 *         description: Still initializing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [starting]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
export {};
