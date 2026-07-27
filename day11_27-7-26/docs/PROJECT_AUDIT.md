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
- Organizer Onboarding Redesign (invitation token, email service, 6-status pipeline): ✅ Functional / Implemented

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
- `/api/organizers` → `organizerRoutes`
- `/api/enrollments` → `enrollmentRoutes`

**Controllers:**
- `authController.js` – register, login, me
- `organizerController.js` – apply (Phase 1), validate-token (Phase 2 pre-fill), complete-registration (Phase 2 submission)
- `playerController.js` – full CRUD + file handling
- `teamController.js` – team creation and listing
- `adminController.js` – organizer listing, approve/reject leads, verify documents, activate account, resend invite link
- `locationController.js` – countries, states, cities
- `enrollmentController.js` – paginated enrollment listing with multi-filter

**Services:**
- `authService.js` – credential validation, login restriction for unactivated organizers
- `organizerService.js` – submits application, token validation and registration completion logic
- `invitationService.js` – token generation, validation, expiry check, single-use hashing
- `emailService.js` – sends registration, rejection, and activation emails using database templates
- `playerService.js` – player CRUD + file path management
- `teamService.js` – team management
- `enrollmentService.js` – query param sanitization, delegates to model

**Models:**
- `playerModel.js` – dynamic WHERE clause filtering + pagination
- `teamModel.js` – team queries
- `userModel.js` – user queries
- `organizerModel.js` – organizer creation, profile update, and status management
- `invitationModel.js` – CRUD for `organizer_invitations` table (token hash store, expiry, used_at)
- `enrollmentModel.js` – dynamic multi-filter WHERE clause, LEFT JOIN teams, COUNT + paginated SELECT

**Middleware:**
- `helmet` – Security headers
- `cors` – Cross-Origin Resource Sharing
- `express-rate-limit` – Rate limiting
- `authMiddleware` – JWT token validation
- `requireRole(role)` – Role-based access enforcement
- `uploadMiddleware` – Multer file handling (avatar, gallery, documents)
- `rbacMiddleware` – Permission checking
- `errorHandler` – Centralized error handler

**Authentication:**
- `POST /api/auth/register` – hashes password, assigns default role
- `POST /api/auth/login` – issues signed JWTs; rejects unactivated organizers with 403
- `GET /api/auth/me` – returns authenticated user profile
- `POST /api/organizers/apply` – creates organizer lead application with `approval_status=0` (no password or KYC collected)
- `GET /api/organizers/registration/validate?token=` – validates raw token via SHA-256 lookup, returns pre-filled lead data
- `POST /api/organizers/registration/submit` – sets password, saves profile data & KYC files, sets status to 3

**Authorization:**
- `authMiddleware` checks `Authorization: Bearer <token>` on protected routes
- `requireRole('organizer')` restricts player/team creation to organizers only
- `requireRole('admin')` restricts admin panel routes
- Login checks ensure only active and activated organizers (`is_active = 1` and status 5) can access organizer features.

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
  password       VARCHAR(255) NULL,      -- stores hashed password temporarily until account activation
  org_name       VARCHAR(255),
  address        TEXT,
  state          VARCHAR(100),
  city           VARCHAR(100),
  zone           VARCHAR(100),
  aadhaar_number VARCHAR(20),
  pan_number     VARCHAR(20),
  documents      JSON,
  approval_status TINYINT DEFAULT 0,   -- maps to status lifecycle 0-5
  is_active      TINYINT DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

Approval Status Lifecycle:
`0` = `PENDING_REVIEW` (Lead application submitted)
`1` = `REJECTED` (Application or KYC documents rejected)
`2` = `REGISTRATION_PENDING` (Approved; registration link sent)
`3` = `REGISTRATION_COMPLETED` (Password & KYC documents submitted)
`4` = `DOCUMENTS_VERIFIED` (Admin verified KYC documents)
`5` = `ACTIVE` (Fully onboarded & active; user account created)

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

**Organizers & Registration:**
- `POST /api/organizers/apply` – Phase 1 lead application submission (alias: `POST /api/auth/signup-organizer`)
- `GET /api/organizers/registration/validate?token=` – validates raw token via SHA-256 lookup, returns pre-filled lead data
- `POST /api/organizers/registration/submit` – sets password, saves profile data & KYC files, sets status to 3

**Players:**
- `GET /api/players` – paginated + filtered player list
- `POST /api/players` – create player (organizer + approved/activated)
- `PUT /api/players/:id` – update player
- `DELETE /api/players/:id` – soft-delete

**Teams:**
- `GET /api/teams`
- `POST /api/teams` – create team (organizer + approved/activated)

**Admin:**
- `GET /api/admin/organizers/pending` – list pending applications
- `GET /api/admin/organizers` – list all organizers
- `PATCH /api/admin/organizers/:id/approve` – approves lead application and generates/emails token (status 2)
- `PATCH /api/admin/organizers/:id/reject` – rejects application or KYC with reason and sends rejection email (status 1)
- `POST /api/admin/organizers/:id/resend-invite` – regenerates and emails a fresh invitation token
- `PATCH /api/admin/organizers/:id/verify-documents` – verifies uploaded KYC documents (status 4)
- `PATCH /api/admin/organizers/:id/activate` – inserts into `users`, sets `is_active = 1`, status to 5 (ACTIVE)

**Locations:**
- `GET /api/locations/countries`
- `GET /api/locations/states?country_id=`
- `GET /api/locations/cities?state_id=`

**Enrollments:**
- `GET /api/enrollments` – paginated + multi-filter
  - Params: `page`, `limit`, `search`, `status`, `invite_type`, `role`, `team_id`
  - Returns: `{ success, data[], pagination: { page, limit, total, totalPages } }`

**Access Levels:**
- Public: `GET /api/players`, `GET /api/teams`, `GET /api/enrollments`, `GET /api/locations/*`, auth routes, organizer application & registration validation/submit routes
- Protected (any authenticated): `GET /api/auth/me`
- Protected (organizer + approved/activated): `POST/PUT/DELETE /api/players`, `POST /api/teams`
- Protected (admin): `/api/admin/*`

---

# Security Audit

- Passwords hashed with bcrypt; never returned in responses.
- JWT encodes `{ id, email, role }` for stateless RBAC.
- Rate limiting: 10000 req (increased for development) / 15 mins.
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

---

# Suggested Future Improvements

- Redis caching for `GET /api/teams` and `GET /api/enrollments`.
- Docker containerization.
- Database indexing on high-filter columns (`enrollments.status`, `players.name`).
- JWT refresh token system.
- Swagger/OpenAPI documentation.
- Jest + Supertest backend test suite.
- CI/CD pipeline via GitHub Actions.
- Enrollment Edit/Delete backend mutation endpoints.
