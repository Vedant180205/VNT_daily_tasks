# Project Overview

**Purpose:**
The VNT Player Management System is a full-stack application for managing player records, teams, and enrollments. It has progressively grown from a basic CRUD app to a system with secure authentication, JWT authorization, file uploads, background job processing, RBAC, location data management, and a full Enrollments DataTable module.

**Current System Status:**
- Authentication (register, login, me): ✅ Functional
- Protected routes via JWT: ✅ Functional
- Player CRUD with file uploads (avatar + gallery): ✅ Functional
- Team CRUD with player relationships: ✅ Functional
- Advanced player filtering (search, team, date, pagination): ✅ Functional
- Bulk CSV import via BullMQ background queue: ✅ Functional
- RBAC (Organizer signup, Admin approval, role middleware): ✅ Functional
- Location API (countries, states, cities): ✅ Functional
- Enrollments DataTable (flag-based columns, server-side pagination, multi-filter API): ✅ Functional
- Organizer Onboarding Redesign (invitation token, email service, 6-stage pipeline): 🟡 Planned

**Technology Stack:**
- **Backend:** Node.js, Express.js
- **Frontend:** React, TypeScript, Vite, React Query, Axios, Tailwind CSS
- **Database:** MySQL
- **Authentication:** JSON Web Tokens (JWT), bcrypt
- **File Uploads:** Multer (disk storage)
- **Background Jobs:** Bull + ioredis

**Key Dependencies (Backend):**
`express`, `cors`, `helmet`, `express-rate-limit`, `dotenv`, `jsonwebtoken`, `bcrypt`, `mysql2`, `multer`, `bull`, `ioredis`

---

## Folder Structure

```text
Project Root
├── backend/
│   ├── migrations/
│   ├── postman/
│   ├── scripts/
│   │   └── seeders/
│   │       └── seedEnrollments.js
│   ├── uploads/
│   │   ├── players/
│   │   │   ├── avatar/
│   │   │   └── gallery/
│   │   └── organizers/
│   │       └── documents/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── playerController.js
│   │   │   ├── teamController.js
│   │   │   ├── adminController.js
│   │   │   ├── locationController.js
│   │   │   └── enrollmentController.js
│   │   ├── middleware/
│   │   ├── models/
│   │   │   ├── userModel.js
│   │   │   ├── playerModel.js
│   │   │   ├── teamModel.js
│   │   │   ├── organizerModel.js
│   │   │   └── enrollmentModel.js
│   │   ├── queues/
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── playerRoutes.js
│   │   │   ├── teamRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── locationRoutes.js
│   │   │   └── enrollmentRoutes.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── playerService.js
│   │   │   ├── teamService.js
│   │   │   ├── organizerService.js
│   │   │   └── enrollmentService.js
│   │   ├── utils/
│   │   ├── workers/
│   │   └── app.js
│   ├── .env.example
│   └── package.json
└── frontend/
    └── src/
        ├── api/
        │   ├── playerApi.ts
        │   ├── teamApi.ts
        │   ├── authApi.ts
        │   ├── organizerApi.ts
        │   ├── adminApi.ts
        │   └── enrollmentApi.ts
        ├── components/
        │   ├── auth/
        │   ├── players/
        │   ├── teams/
        │   ├── layout/
        │   ├── ui/
        │   └── enrollments/
        │       ├── EnrollmentsTable.tsx
        │       ├── EnrollmentViewDialog.tsx
        │       ├── EnrollmentEditDialog.tsx
        │       └── EnrollmentDeleteDialog.tsx
        ├── hooks/
        │   ├── usePlayers.ts
        │   ├── useTeams.ts
        │   ├── useOrganizers.ts
        │   └── useEnrollments.ts
        ├── pages/
        │   ├── PlayersPage.tsx
        │   ├── TeamsPage.tsx
        │   ├── OrganizersPage.tsx
        │   ├── EnrollmentsPage.tsx
        │   └── ...
        ├── utils/
        │   ├── formatDate.ts
        │   └── enrollmentFlags.ts
        ├── App.tsx
        └── main.tsx
```

**Architecture summary:**
- **Backend:** N-Tier (Routes → Middleware → Controllers → Services → Models → Database).
- **Frontend:** Component-based (Pages orchestrate layouts; Hooks manage state; API layer handles network requests).

---

# Backend Audit

**Route Structure (`app.js`):**
- `/api/auth` → `authRoutes`
- `/api/players` → `playerRoutes`
- `/api/teams` → `teamRoutes`
- `/api/admin` → `adminRoutes`
- `/api/locations` → `locationRoutes`
- `/api/enrollments` → `enrollmentRoutes`

**Controllers:**
- `authController.js` – register, login, signup-organizer, *(planned)* complete-registration via token
- `playerController.js` – full CRUD + file handling
- `teamController.js` – team creation and listing
- `adminController.js` – organizer listing, approve/reject, *(planned)* verify-documents, activate, resend-invite
- `locationController.js` – countries, states, cities
- `enrollmentController.js` – paginated enrollment listing with multi-filter

**Services:**
- `authService.js` – credential validation, login restriction for unapproved organizers
- `playerService.js` – player CRUD + file path management
- `teamService.js` – team management
- `organizerService.js` – organizer creation + approval logic
- `enrollmentService.js` – query param sanitization, delegates to model
- *(Planned)* `invitationService.js` – token generation, validation, expiry check, single-use enforcement
- *(Planned)* `emailService.js` – sends invitation emails and rejection notifications

**Models:**
- `playerModel.js` – dynamic WHERE clause filtering + pagination
- `teamModel.js` – team queries
- `userModel.js` – user queries
- `organizerModel.js` – organizer save, fetch, update approval_status
- `enrollmentModel.js` – dynamic multi-filter WHERE clause, LEFT JOIN teams, COUNT + paginated SELECT
- *(Planned)* `invitationModel.js` – CRUD for `organizer_invitations` table (token store, expiry, used_at)

**Middleware:**
- `helmet` – Security headers
- `cors` – Cross-Origin Resource Sharing
- `express-rate-limit` – Rate limiting
- `authMiddleware` – JWT token validation
- `requireRole(role)` – Role-based access enforcement
- `requireApproved()` – Approval status enforcement
- `uploadMiddleware` – Multer file handling (avatar, gallery, documents)
- `rbacMiddleware` – Permission checking
- `errorHandler` – Centralized error handler

**Authentication:**
- `POST /api/auth/register` – hashes password, assigns default role
- `POST /api/auth/login` – issues signed JWTs; rejects unapproved organizers with 403
- `GET /api/auth/me` – returns authenticated user profile
- `POST /api/auth/signup-organizer` – creates organizer with `approval_status=0` (no password collected)
- *(Planned)* `GET /api/auth/verify-invite?token=` – validates invitation token, returns pre-filled organizer data
- *(Planned)* `POST /api/auth/complete-registration` – sets password, creates user row, marks token used

**Authorization:**
- `authMiddleware` checks `Authorization: Bearer <token>` on protected routes
- `requireRole('organizer')` restricts player/team creation to organizers only
- `requireRole('admin')` restricts admin panel routes
- `requireApproved()` ensures organizers are fully approved before accessing protected features

**Error Handling:**
Centralized in `errorHandler.js`. Controllers use `try/catch` and `next(error)`. Fallback to `500 Internal Server Error`.

**File Storage:**
- Player avatars: `/uploads/players/avatar/`
- Player gallery: `/uploads/players/gallery/`
- Organizer documents: `/uploads/organizers/documents/`
- Only relative file paths stored in DB (no binary/base64).

**Background Jobs:**
- Bull queue for bulk player CSV imports.
- Worker process handles row-by-row insertion with error logging.

**Environment Variables:**
- DB config (Host, User, Password, Database Name)
- `JWT_SECRET`
- `REDIS_URL`
- `PORT`

---

# Frontend Audit

**Framework:** React 18, TypeScript, Vite.

**Routes:**
- `/login` – Login page
- `/register` – Registration page
- `/players` – Player management (protected)
- `/teams` – Teams management (protected)
- `/organizers` – Organizer management
- `/signup-organizer` – Organizer signup form
- `/admin/organizers` – Admin organizer management panel
- `/enrollments` – Enrollments DataTable with filters, pagination, CSV export

**State Management:** React Query for server state. URL search params for filter state syncing.

**API Modules:**
- `playerApi.ts`, `teamApi.ts`, `authApi.ts`, `organizerApi.ts`, `adminApi.ts`, `enrollmentApi.ts`

**Authentication Flow:**
JWT in `localStorage`. Axios interceptors attach Bearer token. 401 responses trigger redirect to login.

**Components:**
- Forms: Login, Register, OrganizerSignup, PlayerForm
- Tables: PlayersTable, OrganizersTable, EnrollmentsTable
- Dialogs: EnrollmentViewDialog, EnrollmentEditDialog, EnrollmentDeleteDialog
- Layout: Sidebar, TopNavbar, DashboardHeader, Toolbar, PageContainer
- UI: Button, Input, Select, StatsCard

**Hooks:**
- `usePlayers` – paginated player data
- `useTeams` – team listing
- `useOrganizers` – pending organizer listing
- `useEnrollments` – server-side paginated, multi-filter enrollment listing + CSV export

---

# Database Audit

**Schema Overview:**
Relational schema with normalized tables: `users`, `teams`, `players`, `organizers`, `enrollments`, `countries`, `states`, `cities`.

**`organizers` table:**
```sql
CREATE TABLE organizers (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NULL,
  full_name      VARCHAR(255) NOT NULL,
  email          VARCHAR(255) NOT NULL UNIQUE,
  phone          VARCHAR(20),
  password       VARCHAR(255) NOT NULL,  -- to be REMOVED in redesign; password moves to users table only
  org_name       VARCHAR(255),
  address        TEXT,
  state          VARCHAR(100),
  city           VARCHAR(100),
  zone           VARCHAR(100),
  aadhaar_number VARCHAR(20),
  pan_number     VARCHAR(20),
  documents      JSON,
  approval_status TINYINT DEFAULT 0,   -- 0=Pending, 1=Approved, 2=Rejected (current)
  is_active      TINYINT DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

Approval Status (Redesign Lifecycle):
`0` = `PENDING_REVIEW` (Lead application submitted)
`1` = `REJECTED` (Application declined)
`2` = `REGISTRATION_PENDING` (Approved; registration link sent)
`3` = `REGISTRATION_COMPLETED` (Password & KYC documents submitted)
`4` = `DOCUMENTS_UNDER_REVIEW` (Admin reviewing KYC documents)
`5` = `DOCUMENTS_REJECTED` (Documents rejected; resubmission needed)
`6` = `ACTIVE` (Fully onboarded & active)

**`organizer_invitations` table:**
Stores token hashes for one-time registration links:
- `id`, `organizer_id` (FK → `organizers.id`), `token_hash` (VARCHAR 64 UNIQUE, SHA-256 hash of raw token), `expires_at` (TIMESTAMP), `used_at` (TIMESTAMP NULL), `created_at`
- Raw token is emailed to applicant; database stores only SHA-256 hash for defense-in-depth. Pre-fill API validates token and returns pre-filled lead data (`full_name`, `org_name`, `email`, `phone`, `state`, `city`).

**`enrollments` table:**
```sql
CREATE TABLE enrollments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  phone       VARCHAR(20)  NOT NULL,
  team_id     INT          NOT NULL,
  status      TINYINT      NOT NULL DEFAULT 0,  -- 0=unpaid, 1=paid, 2=free
  invite_type TINYINT      NOT NULL DEFAULT 0,  -- 0=non-invited, 1=invited
  role        TINYINT      NOT NULL,             -- 1=batsman, 2=bowler, 3=wicketkeeper, 4=allrounder
  enrolled_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);
```

**Relationships:**
- One-to-Many: `teams` → `players`
- One-to-Many: `teams` → `enrollments`
- One-to-Many: `countries` → `states` → `cities`

**Indexes:**
- Primary keys implicitly indexed.
- Unique constraints on `users.email`, `teams.name`, `players.email`, `organizers.email`.

---

# API Audit

**Authentication:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/signup-organizer`

**Players:**
- `GET /api/players` – paginated + filtered player list
- `POST /api/players` – create player (organizer + approved)
- `PUT /api/players/:id` – update player
- `DELETE /api/players/:id` – soft-delete

**Teams:**
- `GET /api/teams`
- `POST /api/teams` – create team (organizer + approved)

**Admin:**
- `GET /api/admin/organizers/pending` – list pending applications
- `GET /api/admin/organizers` – list all organizers
- `PATCH /api/admin/organizers/:id/approve` – approve and send invite
- `PATCH /api/admin/organizers/:id/reject` – reject with reason *(backend stub only in current code; fully planned in redesign)*
- *(Planned)* `POST /api/admin/organizers/:id/resend-invite` – regenerate and email a fresh token
- *(Planned)* `PATCH /api/admin/organizers/:id/verify-documents` – advance status to `4`
- *(Planned)* `PATCH /api/admin/organizers/:id/activate` – set `is_active=1`, status `5`

**Locations:**
- `GET /api/locations/countries`
- `GET /api/locations/states?country_id=`
- `GET /api/locations/cities?state_id=`

**Enrollments:**
- `GET /api/enrollments` – paginated + multi-filter
  - Params: `page`, `limit`, `search`, `status`, `invite_type`, `role`, `team_id`
  - Returns: `{ success, data[], pagination: { page, limit, total, totalPages } }`

**Access Levels:**
- Public: `GET /api/players`, `GET /api/teams`, `GET /api/enrollments`, `GET /api/locations/*`, auth routes
- Protected (any authenticated): `GET /api/auth/me`
- Protected (organizer + approved): `POST/PUT/DELETE /api/players`, `POST /api/teams`
- Protected (admin): `/api/admin/*`

---

# Security Audit

- Passwords hashed with bcrypt; never returned in responses.
- JWT encodes `{ id, role, approval_status }` for stateless RBAC.
- Rate limiting: 100 req / 15 mins.
- SQL injection prevented via parameterized queries.
- Helmet secures HTTP headers.
- File uploads restricted by MIME type and size.
- Aadhaar/PAN stored but never returned in general listing responses.

---

# Current Limitations

- No automated testing suites (Jest/Supertest).
- No JWT refresh token rotation (long-lived tokens).
- Admin role must be seeded manually.
- Enrollment Edit/Delete have frontend UI but no backend mutation endpoints yet.
- No email notifications on organizer approval/rejection.
- `handleReject()` in `OrganizersPage.tsx` is a UI stub — no backend `reject` endpoint exists.
- Organizer password is stored in the `organizers` table directly, collected at application time (not at registration time as intended).
- `approveOrganizer` in `adminService.js` immediately creates a `users` row on approval, bypassing a proper invitation flow.
- No document verification step exists as a separate workflow stage.
- No one-time invite token mechanism.
- `organizers` table stores `password` even though password should only be set after approval via invite link.
- Admin `approval_status` only uses values `0` and `1` — value `2` (rejected) is defined in docs but not consistently enforced.

---

# Suggested Future Improvements

- **Organizer Onboarding Redesign** – Full multi-stage pipeline with invite tokens, email service, document verification, and activation step. See `docs/tasks/organizer-onboarding-redesign.md`.
- Redis caching for `GET /api/teams` and `GET /api/enrollments`.
- Docker containerization.
- Database indexing on high-filter columns (`enrollments.status`, `players.name`).
- JWT refresh token system.
- Swagger/OpenAPI documentation.
- Jest + Supertest backend test suite.
- CI/CD pipeline via GitHub Actions.
- Enrollment Edit/Delete backend mutation endpoints.
