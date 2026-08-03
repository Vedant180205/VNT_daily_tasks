# Coding Standards & Architectural Guidelines

This document defines the mandatory coding standards and conventions for the VNT Player Management System. All contributors and future AI implementations must follow these rules.

---

## General Principles

- **Strict Layering**: Maintain N-Tier architecture on the backend (Routes → Controllers → Services → Models) and Component-Based on the frontend. Logic must not bleed across layers.
- **Statelessness**: Backend must remain completely stateless. All session data managed via JWTs.
- **Readability Over Cleverness**: Code should be explicit and easy to read.
- **Fail Fast**: Validate data and throw exceptions as early in the request lifecycle as possible.

---

## Folder Organization

### Backend
- `src/config/` – DB connection pool, Redis config.
- `src/controllers/` – HTTP request/response handlers.
- `src/middleware/` – Auth, Role, Approval, Validation, Upload, Error Handling.
- `src/models/` – Database query execution (Repositories).
- `src/routes/` – Route definitions connecting HTTP verbs to controllers.
- `src/services/` – Core business logic and validation.
- `src/queues/` – Bull queue definitions.
- `src/workers/` – Background job processors.
- `src/utils/` – Helper utilities.

### Frontend
- `src/api/` – Axios instances and network request definitions.
- `src/components/` – Reusable UI components grouped by feature (`players/`, `teams/`, `enrollments/`, `ui/`, `layout/`).
- `src/hooks/` – React Query and custom data-fetching hooks.
- `src/pages/` – Top-level routing views (including Dashboard, Settings, Notifications, etc.).
- `src/utils/` – Pure helper functions and flag constants (e.g., `enrollmentFlags.ts`).

### Background Tasks & Scripts
- `src/scripts/` or root – Standalone sync scripts (e.g., `mvpSync.js`).
- `src/cron/` or `src/jobs/` – Automated cron job definitions.

---

## Naming Conventions

- **Backend files**: `camelCase` (`playerController.js`, `enrollmentRoutes.js`).
- **Frontend components/pages**: `PascalCase` (`EnrollmentsPage.tsx`, `EnrollmentsTable.tsx`).
- **Frontend hooks/utils**: `camelCase` (`useEnrollments.ts`, `enrollmentFlags.ts`).
- **Variables & Functions**: `camelCase` (`getEnrollments`, `isEditDialogOpen`).
- **TypeScript Interfaces/Types**: `PascalCase` (`Enrollment`, `EnrollmentsResponse`).
- **Booleans**: Prefix with `is`, `has`, or `should` (`isDeleted`, `isApproved`).
- **DB Tables**: `snake_case`, plural (`players`, `teams`, `enrollments`).
- **DB Columns**: `snake_case` (`team_id`, `invite_type`, `enrolled_at`).

---

## File Organization

- **Imports**: Built-in modules first, third-party libraries second, internal relative paths last.
- **Backend Exports**: `module.exports = { functionName }` at the bottom.
- **Frontend Exports**: Named exports (`export const ComponentName = ...`) over default exports.

---

## Controller Guidelines

- Controllers handle ONLY HTTP concerns: extracting `req.body`, `req.params`, `req.query`, calling a service, sending `res.json()`.
- No business logic or database queries in controllers.
- Wrap all execution in `try/catch` and pass errors to `next(error)`.
- Standard response structure: `{ success: boolean, data: any, message?: string }`.

---

## Service Guidelines

- Services contain all business logic.
- Validate rules here (e.g., duplicate email check, approval status check).
- Throw custom errors with an attached HTTP status:
  ```javascript
  const err = new Error('Account not approved yet');
  err.status = 403;
  throw err;
  ```
- Services must NOT interact with `req` or `res` objects.

---

## Model (Repository) Guidelines

- Models are the ONLY files allowed to execute SQL queries.
- All queries must be parameterized to prevent SQL injection.
- Models return raw data or null. They do not throw HTTP errors.
- Use `pool.query()` exclusively.

---

## Database Guidelines

- **No ORM**: Use raw SQL via `mysql2` for maximum control.
- **Soft Deletes**: Use `is_deleted = TRUE` instead of hard `DELETE` for player records.
- **Relationships**: Use `LEFT JOIN` for optional related data.
- **Status/Flag Fields**: Use TINYINT for enum-like columns. Always document the value mapping in:
  1. An inline SQL comment in the migration file.
  2. A corresponding entry in `DECISION_LOG.md`.
  3. A frontend constants file (e.g., `enrollmentFlags.ts`) — single source of truth for label rendering.

---

## RBAC Middleware Standards

- `requirePermission('permission_name')` must be a higher-order function returning Express middleware. It currently queries the database per-request to verify permissions (future optimization: Redis caching).
- `requireRole(role)` must be a higher-order function returning Express middleware. Reads from DB to verify user's role against required role.
- **Order on protected routes MUST be**: `authMiddleware` → `requirePermission(...)` or `requireRole(...)` → controller.
- Middlewares return `403 Forbidden` (not `401`) for role/approval failures.
- They use the standard response format: `{ success: false, message: "..." }`.

---

## Validation Rules

- **Server-Side**: Route-level middleware for schema validation (reject with `400 Bad Request`) before hitting the controller.
- **Client-Side**: Forms must validate before triggering API calls.

---

## Authentication Rules

- Passwords ALWAYS hashed with `bcrypt`. Never log or return them.
- JWT payload must include `{ id, email, role }`.
- Protected routes wrapped with `authMiddleware`.
- Frontend stores JWT in `localStorage` and attaches via Axios interceptors.

---

## File Upload Guidelines

- Use `multer.diskStorage`. Never store binary/base64 in DB.
- Validate MIME type via `fileFilter` (never trust extension alone).
- Validate file size with `limits: { fileSize: ... }`.
- Store only relative paths in DB (e.g., `/uploads/players/avatar/abc.jpg`).
- Use unique filenames (`Date.now()` or `uuid`) to prevent collisions.
- Directory structure:
  - `/uploads/players/avatar/` – player avatars
  - `/uploads/players/gallery/` – player gallery images
  - `/uploads/organizers/documents/` – organizer KYC documents

---

## Invitation Token Standards

- Tokens must be generated using `crypto.randomBytes(32).toString('hex')` (64-char hex). Do NOT use JWT or Math.random().
- Tokens are stored in the `organizer_invitations` table — never in the `organizers` table.
- Every token must have an `expires_at` timestamp (recommended: 72 hours from creation).
- A `used_at` column (nullable TIMESTAMP) marks consumption. A token is valid only when `used_at IS NULL` AND `expires_at > NOW()`.
- Token validation must be verified during registration submission and the token consumed immediately.
- When a new invite is issued (resend), the previous token for that organizer must be invalidated (set `used_at = NOW()`).
- Token must never be logged, returned in list responses, or embedded in JWT payloads.

---

## Email Service Standards

- All email-sending logic lives exclusively in `src/services/emailService.js`.
- Controllers and routes must never call mail-sending functions directly — delegate to service layer.
- Email templates must be stored in the database (`email_templates` table) and retrieved using `emailTemplateModel` — never hardcoded as raw HTML strings in service code.
- All email sends must be wrapped in `try/catch`. Email failure must NOT block the API response (log the error; the approval action itself already succeeded).
- Required environment variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `FRONTEND_URL`.

---

## Organizer Onboarding Status Standards

- `approval_status` transitions are strictly forward — no status may decrease.
- Each status transition must be driven by an explicit API call, not inferred or auto-advanced.
- Status values must be documented in all three places: DB migration SQL comment, `DECISION_LOG.md`, and a frontend constants file.
- The `is_active` flag must only be set to `1` at the final `activate` step (status `5`).
- The `password` column in `organizers` is modified to be nullable, holding the hashed password from the registration completion step until the user account is formally created and activated.

---

## Error Handling

- **Backend**: Never send raw stack traces to the client. Global Error Handler MUST intercept all errors.
- **Frontend**: Catch Axios errors and map to user-friendly toasts or inline errors.

---

## API Design

- RESTful resource naming: plural nouns (`GET /api/players`, `POST /api/enrollments`).
- Admin-specific routes namespaced under `/api/admin/`.
- Paginated endpoints return: `page`, `limit`, `total`, `totalPages`.

---

## State Management

- **Server State**: React Query for all data fetching, caching, background sync.
- **Local State**: `useState` for simple component-level states.
- **URL State**: Filter states (search, pagination, status flags) synced to URL Search Parameters.

---

## Performance Guidelines

- When paginating: separate `COUNT(*)` query first, then `LIMIT`/`OFFSET`.
- Frontend: use memoization (`useMemo`, `useCallback`) only when needed for expensive calculations.
- Never fetch an entire large dataset client-side when server-side filtering is available.

---

## Caching & Background Jobs Guidelines

- **Redis Caching**: Use Redis for frequently accessed, heavy-to-compute data (e.g., Leaderboards).
  - Use an **atomic overwrite** pattern (e.g., `redisClient.set(key, data, { EX: TTL })`) instead of `DEL` followed by `SET`. This prevents a brief cache-miss window.
  - Set appropriate TTLs (e.g., 60-300 seconds) for time-sensitive data.
- **Cron Jobs**: 
  - Background syncing tasks (e.g., `node-cron`) should run independently of the main API request lifecycle.
  - Track background task execution status (start time, end time, success/failure) in a dedicated log table (e.g., `mvp_sync_logs`).
  - **Fail Fast & Gracefully**: If a cron job fails, it must log the error securely but NEVER crash the main server process. Use try-catch blocks thoroughly.
  - **Optimization**: Do not process all records blindly; use incremental updates or process only recent logs when possible.

---

## Security Practices

- Rate limiting active on `/api` routes.
- `Helmet` active to secure HTTP headers.
- Never expose `.env` files in version control.
- Upload paths use unique identifiers to prevent enumeration.

---

## Code Reusability

- Extract common logic into `utils/`.
- Build reusable UI components rather than duplicating markup.
- RBAC middleware (`requireRole`, `requireApproved`) shared across all route files.
- Flag constants (`STATUS_LABELS`, `INVITE_LABELS`, `ROLE_LABELS`) defined once in `enrollmentFlags.ts` and imported everywhere needed.

---

## Things That Must NEVER Be Done

- **NEVER** write raw SQL without `?` parameterization.
- **NEVER** place database queries inside Controllers.
- **NEVER** access `localStorage` directly in JSX renders.
- **NEVER** commit secrets, passwords, or `.env` files.
- **NEVER** use `any` in TypeScript unless absolutely necessary for an external library workaround.
- **NEVER** store binary file data (base64 or buffer) in the database.
- **NEVER** skip `requireApproved()` on organizer-restricted routes.
- **NEVER** use `requireRole` without `authMiddleware` running first.
- **NEVER** hardcode TINYINT flag labels (e.g., `'Paid'`, `'Batsman'`) in JSX. Always import from `enrollmentFlags.ts`.
- **NEVER** fetch an entire large dataset client-side for the purpose of client-side pagination.
- **NEVER** collect an organizer's password at application submission time — password must only be collected after admin approval via the invite link.
- **NEVER** reuse or skip invalidating an invitation token. Each token is single-use; previous tokens must be invalidated on resend.
- **NEVER** let email-send failure block the HTTP response for an approval or rejection action.
- **NEVER** decrease `approval_status` — transitions are strictly forward.
