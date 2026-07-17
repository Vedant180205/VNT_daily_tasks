# Architectural Decision Log

This document tracks all significant architectural decisions made during the implementation of the project. Append new entries using the template below when a new decision is made.

---

## Decision: Dynamic RBAC (Role-Permissions) vs Hardcoded Role Checks

**Stage:** RBAC Implementation

**Problem:**
Routes needed role-based protection. The options were hardcoding role names in middleware (`requireRole('organizer')`) or integrating with the existing `roles`/`permissions`/`role_permissions` tables for dynamic permission checking.

**Options:**
- Option A: Hardcode role names in middleware.
- Option B: Use existing DB tables for dynamic permission checking (`requirePermission('create_players')`).

**Chosen:** Option B – Dynamic permission checking.

**Reason:**
Tying a route to a specific capability (not a role) means future roles can gain or lose permissions via DB alone, without touching source code. This is more scalable and secure.

**Trade-offs:** Slightly more complex middleware; permissions may need to be cached in Redis to avoid per-request DB hits.

**Affected Files:**
- `backend/src/middleware/rbacMiddleware.js`
- `backend/src/routes/playerRoutes.js`
- `backend/src/routes/teamRoutes.js`

---

## Decision: User + Profile Pattern for Organizers

**Stage:** RBAC Implementation

**Problem:**
Organizers require significantly more data fields (Aadhaar, PAN, org name, documents) and an approval workflow that standard users don't need.

**Options:**
- Option A: Add all organizer fields as NULLable columns to `users`.
- Option B: Separate `organizers` table with its own auth.
- Option C: User + Profile pattern — `users` handles auth, `organizers` holds profile data linked via `user_id`.

**Chosen:** Option C – User + Profile Pattern.

**Reason:**
Keeps core auth logic (login, JWT) unified and the `users` table lightweight. The `organizers` table is queried only when needed (approval check, admin panel). No duplication of auth code.

**Affected Files:**
- `backend/migrations/`
- `backend/src/services/authService.js`
- `backend/src/models/userModel.js`
- `backend/src/models/organizerModel.js`

---

## Decision: TINYINT Flags vs. ENUM/VARCHAR for `status`, `invite_type`, `role`

**Stage:** Enrollments DataTable

**Problem:**
The `enrollments` table needs columns for status (paid/unpaid/free), invite type, and player role. The question was whether to store these as readable strings or integer codes.

**Options:**
- Option A: Store as VARCHAR/ENUM (e.g., `status = 'paid'`).
- Option B: Store as TINYINT flags (e.g., `status = 1`) with a label map in application code.

**Chosen:** Option B – TINYINT flags.

**Reason:**
TINYINT uses less storage, enables faster indexed integer comparisons in SQL WHERE clauses, and prevents data inconsistency from free-form string entry. Labels are only needed for display, handled cleanly by `enrollmentFlags.ts` on the frontend. This aligns with the existing `approval_status` and `is_active` patterns.

**Trade-offs:** Raw DB results are less readable; the flag map must stay in sync between docs and frontend constants.

**Affected Files:**
- `backend/migrations/[timestamp]_create_enrollments.sql`
- `frontend/src/utils/enrollmentFlags.ts`
- `frontend/src/components/enrollments/EnrollmentsTable.tsx`

---

## Decision: Server-Side Pagination vs. Client-Side Filtering for Enrollments

**Stage:** Enrollments DataTable

**Problem:**
With 1000 enrollment records, the application must decide where pagination and filtering happen — on the server (send only a page slice) or on the client (fetch all rows and slice in the browser).

**Options:**
- Option A: Fetch all 1000 rows; paginate and filter client-side.
- Option B: Server-side pagination and filtering; fetch 50 rows per request.

**Chosen:** Option B – Server-side pagination and filtering.

**Reason:**
1000 rows is the seed size; production could scale to tens of thousands. Fetching all rows causes high initial load time, wasted bandwidth for heavily filtered queries, and frontend memory pressure. Server-side pagination is lean and scalable, and matches the existing `GET /api/players` pattern.

**Trade-offs:** Every filter change triggers a network request. Requires a separate `COUNT(*)` query per request.

**Mitigation:** React Query caching prevents repeated fetches for identical param combinations.

**Affected Files:**
- `backend/src/models/enrollmentModel.js`
- `frontend/src/hooks/useEnrollments.ts`
- `frontend/src/pages/EnrollmentsPage.tsx`
