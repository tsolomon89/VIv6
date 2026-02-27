/**
 * @openapi
 * /api/config:
 *   get:
 *     tags: [Config]
 *     summary: Get runtime configuration
 *     responses:
 *       200:
 *         description: Configuration payload
 *   patch:
 *     tags: [Config]
 *     summary: Patch runtime configuration
 *     responses:
 *       200:
 *         description: Updated configuration payload
 *
 * /api/templates:
 *   get:
 *     tags: [Templates]
 *     summary: List page templates
 *     responses:
 *       200:
 *         description: Template list
 *   post:
 *     tags: [Templates]
 *     summary: Create page template
 *     responses:
 *       201:
 *         description: Template created
 *
 * /api/templates/{key}:
 *   get:
 *     tags: [Templates]
 *     summary: Get a template by key
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template payload
 *
 * /api/derive/{entitySlug}:
 *   get:
 *     tags: [Pages]
 *     summary: Derive compiled page for an entity slug
 *     parameters:
 *       - name: entitySlug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Derived page response
 *
 * /api/builds:
 *   get:
 *     tags: [Pages]
 *     summary: List build state entries
 *     responses:
 *       200:
 *         description: Build list
 *
 * /api/builds/summary:
 *   get:
 *     tags: [Pages]
 *     summary: Get build status summary
 *     responses:
 *       200:
 *         description: Build summary
 *
 * /api/builds/{entityId}:
 *   post:
 *     tags: [Pages]
 *     summary: Trigger build for one entity
 *     parameters:
 *       - name: entityId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Build result
 *
 * /api/domains:
 *   get:
 *     tags: [Domains]
 *     summary: List domains
 *     responses:
 *       200:
 *         description: Domain list
 *   post:
 *     tags: [Domains]
 *     summary: Create domain
 *     responses:
 *       201:
 *         description: Domain created
 *
 * /api/domains/resolve/{hostname}:
 *   get:
 *     tags: [Domains]
 *     summary: Resolve hostname to domain config
 *     parameters:
 *       - name: hostname
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Domain resolution response
 *
 * /api/pages:
 *   get:
 *     tags: [Pages]
 *     summary: List pages
 *     responses:
 *       200:
 *         description: Page list
 *   post:
 *     tags: [Pages]
 *     summary: Create page
 *     responses:
 *       201:
 *         description: Page created
 *
 * /api/pages/{slug}:
 *   get:
 *     tags: [Pages]
 *     summary: Get page by id or slug
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Page payload
 *
 * /api/presets:
 *   get:
 *     tags: [Presets]
 *     summary: List presets
 *     responses:
 *       200:
 *         description: Preset list
 *   post:
 *     tags: [Presets]
 *     summary: Create preset
 *     responses:
 *       201:
 *         description: Preset created
 *
 * /api/presets/{key}:
 *   get:
 *     tags: [Presets]
 *     summary: Get preset
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Preset payload
 *
 * /api/state-machines:
 *   get:
 *     tags: [Schema]
 *     summary: List state machines
 *     responses:
 *       200:
 *         description: State machine list
 *
 * /api/state-machines/{ObjectType}:
 *   get:
 *     tags: [Schema]
 *     summary: Get state machine for entity type
 *     parameters:
 *       - name: ObjectType
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: State machine payload
 *
 * /api/workflows:
 *   get:
 *     tags: [Activities]
 *     summary: List workflows
 *     responses:
 *       200:
 *         description: Workflow list
 *
 * /api/workflows/{slug}/trigger:
 *   post:
 *     tags: [Activities]
 *     summary: Trigger workflow
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trigger accepted
 *
 * /api/interpreter-executors:
 *   get:
 *     tags: [Schema]
 *     summary: List interpreter executors
 *     responses:
 *       200:
 *         description: Executor list
 *
 * /api/interpreter-executors/validate-stage:
 *   post:
 *     tags: [Schema]
 *     summary: Validate interpreter stage definition
 *     responses:
 *       200:
 *         description: Validation result
 *
 * /api/analytics/forecast/{accountId}:
 *   get:
 *     tags: [Commercial]
 *     summary: Get account forecast metrics
 *     parameters:
 *       - name: accountId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Forecast payload
 *
 * /api/commercial/opportunities/{id}/stage:
 *   post:
 *     tags: [Commercial]
 *     summary: Move opportunity stage
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated opportunity
 *
 * /api/reseed/preview:
 *   post:
 *     tags: [Config]
 *     summary: Preview reseed plan
 *     responses:
 *       200:
 *         description: Reseed preview
 *
 * /api/reseed/apply:
 *   post:
 *     tags: [Config]
 *     summary: Apply reseed plan
 *     responses:
 *       200:
 *         description: Reseed execution result
 *
 * /api/components:
 *   get:
 *     tags: [Templates]
 *     summary: List generated component registry
 *     responses:
 *       200:
 *         description: Component registry
 *
 * /api/users/invite:
 *   post:
 *     tags: [Users]
 *     summary: Invite user to account
 *     responses:
 *       201:
 *         description: Invite accepted
 *
 * /api/workspaces:
 *   get:
 *     tags: [Config]
 *     summary: List config workspaces
 *     responses:
 *       200:
 *         description: Workspace list
 *   post:
 *     tags: [Config]
 *     summary: Create config workspace
 *     responses:
 *       201:
 *         description: Workspace created
 *
 * /api/workspaces/{id}:
 *   get:
 *     tags: [Config]
 *     summary: Get workspace with changes
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace payload
 *
 * /api/ai/providers:
 *   get:
 *     tags: [AI]
 *     summary: List AI providers/models
 *     responses:
 *       200:
 *         description: Provider list
 *
 * /api/ai/credentials:
 *   get:
 *     tags: [AI]
 *     summary: List AI credentials
 *     responses:
 *       200:
 *         description: Credential list
 *   post:
 *     tags: [AI]
 *     summary: Create AI credential
 *     responses:
 *       201:
 *         description: Credential created
 *
 * /api/upload:
 *   post:
 *     tags: [Templates]
 *     summary: Upload media asset
 *     responses:
 *       200:
 *         description: Upload metadata
 */
export {};

