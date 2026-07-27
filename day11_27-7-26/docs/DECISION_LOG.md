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

---

## Decision: Multi-Stage Organizer Onboarding vs. Single-Step Approval

**Stage:** Organizer Onboarding Redesign (Implemented)

**Problem:**
The previous `approveOrganizer` flow collapsed the entire onboarding into one admin action: approve → immediately create `users` row with the organizer's pre-supplied password. This meant:
- The organizer submitted their password at application time (before approval), which was a UX and security anti-pattern.
- There was no email communication — the organizer had no way to know they had been approved.
- There was no formal rejection path (backend stub only).
- There was no document verification step as a distinct stage.
- Organizer could not distinguish between "still pending", "approved but not registered", "documents under review", and "fully active".

**Options:**
- **Option A:** Keep the single-step approval. Add email notification and rejection endpoint as patches.
- **Option B:** Full redesign — decouple application (no password), admin review, token-based invitation, self-registration (password set by organizer), document verification, and activation as separate explicit stages.

**Chosen:** Option B – Full multi-stage redesign.

**Reason:**
Option A results in continued architectural debt: the `organizers` table would still store a password before the user is even approved, and the login flow would remain fragile. Option B aligns with industry-standard onboarding (e.g., "admin invites user via email link"), eliminates premature password collection, provides clear status visibility to both the admin and organizer, and makes each stage independently auditable and reversible.

**Implemented Status Contract:**
| Value | Code | Stage |
|-------|------|-------|
| `PENDING_REVIEW` | `0` | Initial lead application awaiting admin review |
| `REJECTED` | `1` | Lead application or KYC documents rejected by admin |
| `REGISTRATION_PENDING` | `2` | Approved by admin; registration link sent via email |
| `REGISTRATION_COMPLETED` | `3` | Full registration & KYC submitted by organizer |
| `DOCUMENTS_VERIFIED` | `4` | Admin verified KYC documents |
| `ACTIVE` | `5` | Organizer account fully activated (`is_active = 1`) |

**Token & Security Design:**
- Generated server-side using `crypto.randomBytes(32).toString('hex')` (64-char hex).
- **Hashed in DB:** Raw token is emailed to applicant; database stores only `token_hash = SHA-256(raw_token)` for defense-in-depth security.
- Stored in `organizer_invitations` table with `expires_at` (72 hours), `used_at` (NULL until consumed).
- Pre-fill validation (`GET /api/organizers/registration/validate?token=...`): Hashes incoming token, verifies match, not expired, not used (`used_at IS NULL`), status = `REGISTRATION_PENDING` (2). Returns Phase 1 lead data to pre-fill form.
- Submission validation (`POST /api/organizers/registration/submit`): Re-hashes token, re-validates, updates `organizers` profile data with password & documents, marks `token_hash` used (`used_at = NOW()`), sets status to `REGISTRATION_COMPLETED` (3).
- User Creation & Activation: On admin activation (`PATCH /api/admin/organizers/:id/activate`), creates `users` entry in a transaction and sets status to `ACTIVE` (5).

**Trade-offs:**
- Requires email service dependency (nodemailer) and `email_templates` database table.
- Requires `organizer_invitations` table migration.
- `organizers` table altered: `password` column nullable.
- Frontend needs a new `/organizer/register` page (`CompleteRegistrationPage.tsx`).
- Precise admin UI steps (approve lead → invite → verify docs → activate).

**Affected Files:**
- `backend/migrations/008_create_organizer_invitations.sql`
- `backend/migrations/009_update_organizers_for_redesign.sql`
- `backend/migrations/010_make_application_fields_not_null.sql`
- `backend/migrations/011_create_organizer_statuses.sql`
- `backend/migrations/012_consolidate_organizer_statuses.sql`
- `backend/migrations/013_add_documents_verified_status.sql`
- `backend/migrations/014_create_email_templates.sql`
- `backend/src/services/invitationService.js` – SHA-256 token hashing & validation
- `backend/src/services/emailService.js` – email notifications via DB templates
- `backend/src/models/invitationModel.js` – DB queries for `organizer_invitations`
- `backend/src/controllers/adminController.js` – approve, reject, verify-docs, activate handlers
- `backend/src/controllers/organizerController.js` – Phase 1 application submission, Phase 2 validate & complete handlers
- `backend/src/routes/adminRoutes.js` – admin endpoints
- `backend/src/routes/organizerRoutes.js` – organizer and registration endpoints
- `frontend/src/pages/CompleteRegistrationPage.tsx` – invite link landing page at `/organizer/register`
- `frontend/src/pages/OrganizersPage.tsx` – multi-stage admin UI
- `frontend/src/components/admin/OrganizerDocsDialog.tsx` – KYC document verification modal
- `frontend/src/components/admin/OrganizerDetailsDialog.tsx` – organizer details modal
