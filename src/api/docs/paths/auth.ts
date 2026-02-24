/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register new user
 *     description: Creates a new user account with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Minimum 8 characters
 *               name:
 *                 type: string
 *           example:
 *             email: user@example.com
 *             password: securepassword123
 *             name: John Doe
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Authenticate user
 *     description: |
 *       Authenticates a user with email and password.
 *       Returns a JWT token and sets a session cookie.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *           example:
 *             email: user@example.com
 *             password: securepassword123
 *     responses:
 *       200:
 *         description: Authentication successful
 *         headers:
 *           Set-Cookie:
 *             description: Session cookie
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 accounts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get current user
 *     description: Returns the authenticated user's profile and accessible accounts
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 accounts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       role:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout user
 *     description: Revokes the session token and clears the session cookie
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out
 *
 * /api/auth/capabilities:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get user capabilities
 *     description: |
 *       Returns the capabilities (permissions) for the current user in the specified account.
 *       Uses ODAC (Opportunity-Driven Access Control).
 *     parameters:
 *       - name: account_id
 *         in: query
 *         description: Account ID to check capabilities for
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User capabilities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 capabilities:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["read:*", "write:contact", "admin:*"]
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export {};
