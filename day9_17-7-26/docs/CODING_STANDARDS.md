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
- `src/pages/` – Top-level routing views.
- `src/utils/` – Pure helper functions and flag constants (e.g., `enrollmentFlags.ts`).

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

- `requireRole(role)` must be a higher-order function returning Express middleware. Reads from `req.user.role`.
- `requireApproved()` must be a plain Express middleware reading `req.user.approval_status`.
- **Order on protected routes MUST be**: `authMiddleware` → `requireRole(role)` → `requireApproved` → controller.
- Both middlewares return `403 Forbidden` (not `401`) for role/approval failures.
- Both use the standard response format: `{ success: false, message: "..." }`.

---

## Validation Rules

- **Server-Side**: Route-level middleware for schema validation (reject with `400 Bad Request`) before hitting the controller.
- **Client-Side**: Forms must validate before triggering API calls.

---

## Authentication Rules

- Passwords ALWAYS hashed with `bcrypt`. Never log or return them.
- JWT payload must include `{ id, role, approval_status }`.
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
  - `/uploads/organizers/documents/` – organizer documents

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
