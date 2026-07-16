# Coding Standards & Architectural Guidelines

As a Senior Engineering Manager, this document outlines the strict coding standards, architectural conventions, and general best practices derived from our existing codebase. It serves as mandatory instruction for all developers and future AI implementations contributing to the VNT Player Management System.

## General Principles
- **Strict Layering**: Maintain a strict N-Tier architecture on the backend (Routes → Controllers → Services → Models) and a Component-Based architecture on the frontend. Logic must not bleed across layers.
- **Statelessness**: The backend must remain completely stateless. All session data must be managed via JWTs.
- **Readability Over Cleverness**: Code should be explicit and easy to read. Avoid overly clever one-liners if they sacrifice readability.
- **Fail Fast**: Catch errors, validate data, and throw exceptions as early in the request lifecycle as possible.

## Folder Organization
### Backend
- `src/config/`: Configuration files (e.g., database connection pool, Redis).
- `src/controllers/`: HTTP request/response handlers.
- `src/middleware/`: Express middlewares (Auth, Role, Approval, Validation, Upload, Error Handling).
- `src/models/`: Database query execution (Repositories).
- `src/routes/`: Route definitions connecting HTTP verbs to controllers.
- `src/services/`: Core business logic and validation.
- `src/queues/`: Bull queue definitions for background jobs.
- `src/workers/`: Background job processors.
- `src/utils/`: Helper utilities (file operations, formatters).

### Frontend
- `src/api/`: Axios instances and network request definitions.
- `src/components/`: Reusable UI components grouped by feature/domain (e.g., `players`, `auth`, `admin`, `ui`).
- `src/hooks/`: React Query and custom data-fetching hooks.
- `src/pages/`: Top-level routing views.
- `src/types/`: TypeScript interfaces and type definitions.
- `src/utils/`: Pure helper functions.

## Naming Conventions
- **Files/Directories**:
  - Backend files: `camelCase` (e.g., `playerController.js`, `authRoutes.js`, `requireRole.js`).
  - Frontend components/pages: `PascalCase` (e.g., `PlayerCard.tsx`, `AdminOrganizersPage.tsx`).
  - Frontend hooks/utils: `camelCase` (e.g., `usePlayers.ts`, `useOrganizers.ts`, `formatDate.ts`).
- **Variables & Functions**: `camelCase` (e.g., `createPlayer`, `isEditDialogOpen`, `approveOrganizer`).
- **Interfaces/Types (Frontend)**: `PascalCase` (e.g., `OrganizerCardProps`, `Organizer`, `ApprovalStatus`).
- **Booleans**: Prefix with `is`, `has`, or `should` (e.g., `isDeleted`, `hasAccess`, `isApproved`).
- **Database Tables**: `snake_case`, plural (e.g., `players`, `teams`, `organizers`).
- **Database Columns**: `snake_case` (e.g., `team_id`, `created_at`, `approval_status`, `is_active`).

## File Organization
- **Imports**: Group imports logically. Built-in modules first, third-party libraries second, internal relative paths last.
- **Exports**:
  - Backend: Use `module.exports = { functionName }` at the bottom of the file.
  - Frontend: Use named exports (`export const ComponentName = ...`) over default exports.

## RBAC Middleware Standards (New – Day 8)
- `requireRole(role)` must be a higher-order function returning an Express middleware. It must read from `req.user.role`.
- `requireApproved()` must be a plain Express middleware reading `req.user.approval_status`.
- **Order of middleware on protected routes MUST be**: `authMiddleware` → `requireRole(role)` → `requireApproved` → other middleware → controller.
- Middleware must return `403 Forbidden` (not `401 Unauthorized`) for role/approval failures.
- Both middleware must use the standard `{ success: false, message: "..." }` JSON format.

## Controller Guidelines
- Controllers must ONLY handle HTTP concerns: extracting `req.body`, `req.params`, `req.query`, passing them to a service, and sending the `res.json()`.
- Controllers must NOT contain business logic or database queries.
- Controllers must wrap execution in a `try/catch` block and pass errors to `next(error)`.
- Enforce standard JSON response structures: `{ success: boolean, data: any, message?: string }`.

## Service Guidelines
- Services hold the core business logic of the application.
- Validate business rules here (e.g., "Does this email already exist?", "Is this organizer approved?").
- If a business rule fails, throw a custom Error object with an attached HTTP status code:
  `javascript
  const err = new Error('Account not approved yet');
  err.status = 403;
  throw err;
  `
- Services must NOT interact with `req` or `res` objects directly.

## Repository (Model) Guidelines
- Models are the only files allowed to execute SQL queries.
- All queries must be parameterized to prevent SQL Injection.
- Models should return raw data or null. They should not throw HTTP errors.
- Use `pool.query()` exclusively for database connections.

## Database Guidelines
- **No ORM**: Continue using raw SQL via `mysql2` for maximum control and performance.
- **Soft Deletes**: Use `is_deleted = TRUE` instead of hard `DELETE` statements for player records.
- **Relationships**: Use `LEFT JOIN` when retrieving related optional data.
- **Status Fields**: Use TINYINT for status codes (`approval_status`: 0=pending, 1=approved, 2=rejected). Always document the mapping clearly in comments and the DECISION_LOG.

## Validation Rules
- **Server-Side**: Use route-level middleware for schema/shape validation (rejecting with 400 Bad Request) before it hits the controller.
  - *(Recommendation)*: Adopt a schema validation library like `Joi` or `Zod`.
- **Client-Side**: Forms must have HTML5 validation or manual state-based validation before triggering API calls.

## Authentication Rules
- **Passwords**: Must ALWAYS be hashed using `bcrypt` before storage. Never log or return passwords in API responses.
- **Tokens**: Use JSON Web Tokens (JWT). Verify JWTs exclusively in `authMiddleware`.
- **JWT Payload**: Must include `{ id, role, approval_status }` to support stateless RBAC.
- **Protected Routes**: Wrap protected API endpoints with `authMiddleware`.
- **Frontend Storage**: Persist JWTs securely. Use Axios interceptors to inject the Bearer token into all requests.

## File Upload Guidelines
- Use `multer.diskStorage` for all uploads. Never store binary/base64 in the database.
- Always validate MIME type using `fileFilter` (never trust file extension alone).
- Always validate file size using `limits: { fileSize: ... }`.
- Store only relative file paths in the database (e.g., `/uploads/players/avatar/abc.jpg`).
- Generate unique filenames (e.g., using `Date.now()` or `uuid`) to prevent collisions.
- Directory structure:
  - `/uploads/players/avatar/` – player avatars
  - `/uploads/players/gallery/` – player gallery images
  - `/uploads/organizers/documents/` – organizer verification documents

## Error Handling
- **Backend**: Never send raw stack traces to the client. The Global Error Handler middleware MUST intercept all downstream errors.
- **Frontend**: Catch Axios errors and map them to user-friendly UI notifications (Toast notifications or inline form errors).

## Logging
- Use a dedicated logger middleware to track incoming HTTP requests (Method, URL, Status, Response Time).
- *(Recommendation)*: Integrate `Winston` or `Pino` for structured log levels.

## API Design
- Adhere strictly to RESTful resource naming (e.g., `GET /api/players`, `POST /api/players`).
- Use plural nouns for endpoints.
- Admin-specific routes MUST be namespaced under `/api/admin/` to clearly delineate privileged access.
- Paginated endpoints must return metadata: `page`, `limit`, `total`, `totalPages`.

## State Management
- **Server State**: Use React Query (`@tanstack/react-query`) for all data fetching, caching, and background syncing.
- **Local State**: Use `useState` for simple component-level states.
- **URL State**: Filter states (search queries, pagination, status filters) should be synced to URL Search Parameters.

## Performance Guidelines
- **Database**: When paginating, perform a separate `COUNT(*)` query first before applying `LIMIT` and `OFFSET`.
- **Frontend**: Use memoization (`useMemo`, `useCallback`) only when necessary for expensive calculations.

## Security Practices
- Rate limiting must remain active on `/api` routes.
- Ensure `Helmet` is active to secure HTTP headers.
- Never expose environment variables (`.env`) in version control.
- File upload paths must use unique identifiers to prevent enumeration attacks.

## Code Reusability
- Extract common logic into helper functions inside the `utils/` folder.
- Build reusable UI components rather than duplicating HTML/Tailwind classes.
- RBAC middleware (`requireRole`, `requireApproved`) must be shared across all route files.

## Testing Expectations
- *(Recommendation)*: Adopt Jest and Supertest for backend integration/unit testing.
- *(Recommendation)*: Adopt React Testing Library for frontend component testing.
- Test RBAC edge cases: pending login block, wrong role access, admin approval idempotency.

## Refactoring Rules
- Do not introduce breaking changes to the REST API without versioning (e.g., moving to `/api/v2/`).
- When modifying shared components or models, verify that the changes do not break other dependent modules.

## Things That Must Never Be Done
- **NEVER** write raw SQL without `?` parameterization. String concatenation in SQL is strictly forbidden.
- **NEVER** place database queries directly inside Controllers.
- **NEVER** access `localStorage` directly inside JSX renders; use a hook or utility function.
- **NEVER** commit secrets, passwords, or `.env` files to the repository.
- **NEVER** use `any` in TypeScript unless absolutely necessary for an external library workaround.
- **NEVER** store binary file data (base64 or buffer) in the database. Always store file paths.
- **NEVER** skip the `requireApproved()` middleware on organizer-restricted routes.
- **NEVER** allow `requireRole` to be used without `authMiddleware` running first.
