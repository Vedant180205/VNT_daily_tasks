# Project Overview

**Purpose of the project:**
The VNT Player Management System is a full-stack application designed to handle the creation, reading, updating, and deletion (CRUD) of player records and their associated teams. Starting as a foundational CRUD app, it has progressively integrated secure authentication, JWT-based authorization, file upload handling, background job processing (Bull queues), and now a full Role-Based Access Control (RBAC) system with an organizer approval workflow.

**Current implementation status (Day 8):**
- Registration, Login, and Me endpoints: Functional.
- Protected routes secured with JWT authentication: Functional.
- Relational queries (Teams-to-Players): Functional.
- Advanced filtering (search, team, date, pagination): Functional.
- File upload (player avatar + gallery via multer): Functional (Day 7).
- Background bulk import (CSV → Bull queue → worker): Functional (Day 7).
- RBAC (Organizer signup, Admin approval, Role middleware): **New – Day 8.**

**Technology stack:**
- **Backend:** Node.js, Express.js
- **Frontend:** React, TypeScript, Vite, React Query, Axios, Tailwind CSS
- **Database:** MySQL
- **Authentication:** JSON Web Tokens (JWT), bcrypt
- **File Uploads:** Multer (disk storage)
- **Background Jobs:** Bull + ioredis (Day 7)

**Dependencies:**
Verified via `package.json` analysis. Backend: `express`, `cors`, `helmet`, `express-rate-limit`, `dotenv`, `jsonwebtoken`, `bcrypt`, `mysql2`, `multer`, `bull`, `ioredis`.

**Folder structure:**
`	ext
Project Root
├── backend/
│   ├── migrations/
│   ├── postman/
│   ├── uploads/
│   │   ├── players/
│   │   │   ├── avatar/
│   │   │   └── gallery/
│   │   └── organizers/
│   │       └── documents/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── queues/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── workers/
│   │   └── app.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   ├── services/
    │   ├── types/
    │   ├── utils/
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
`

**Application architecture summary:**
- **Backend:** Layered (N-Tier) Architecture. Request flows from Routes → Middleware (Auth, Role, Approval, Upload, Validate) → Controllers → Services → Models (Database).
- **Frontend:** Component-based architecture. Pages orchestrate layouts, Components handle UI, Hooks manage state, API layer handles network requests.

---

# Backend Audit

**Route structure:**
Modular route structure configured in `app.js`.
- `/api/players` → `playerRoutes`
- `/api/auth` → `authRoutes`
- `/api/teams` → `teamRoutes`
- `/api/admin` → `adminRoutes` *(New – Day 8)*

**Controllers:**
Responsible for handling HTTP requests, extracting parameters, and delegating business logic to services.
- `authController.js` – login, register, signup-organizer
- `playerController.js` – full CRUD + file handling
- `teamController.js` – team creation and listing
- `adminController.js` – organizer listing, approve/reject *(New – Day 8)*

**Services:**
Encapsulate core business logic, including validations before passing data to models.
- `authService.js` – credential validation, login restriction for unapproved organizers
- `playerService.js` – player CRUD + file path management
- `teamService.js` – team management
- `organizerService.js` – organizer creation + approval logic *(New – Day 8)*

**Repositories (Models):**
Direct database interactions using parameterized SQL queries.
- `playerModel.js` – dynamic WHERE clause filtering + pagination
- `teamModel.js` – team queries
- `userModel.js` – user queries (login, register, me)
- `organizerModel.js` – organizer save, fetch, update approval_status *(New – Day 8)*

**Middleware:**
- `helmet` – Security headers
- `cors` – Cross-Origin Resource Sharing
- `express-rate-limit` – Rate limiting
- `logger` – Request logging
- `authMiddleware` – JWT token validation
- `requireRole(role)` – Role-based access enforcement *(New – Day 8)*
- `requireApproved()` – Approval status enforcement *(New – Day 8)*
- `uploadMiddleware` – Multer file handling (avatar, gallery, documents)
- `errorHandler` – Centralized error handler
- `notFound` – 404 handler

**Authentication:**
- Powered by JWT and bcrypt.
- `POST /api/auth/register` – hashes passwords, assigns default role.
- `POST /api/auth/login` – issues signed JWTs; now rejects unapproved organizers.
- `GET /api/auth/me` – returns the authenticated user profile.
- `POST /api/auth/signup-organizer` – creates organizer with `approval_status=0`. *(New – Day 8)*

**Authorization:**
- `authMiddleware` checks for `Authorization: Bearer <token>` on protected routes.
- `requireRole('organizer')` restricts player/team creation to organizers only. *(New – Day 8)*
- `requireRole('admin')` restricts admin panel routes. *(New – Day 8)*
- `requireApproved()` ensures organizers are fully approved before accessing protected features. *(New – Day 8)*

**Validation:**
- Validation errors return `400 Bad Request`.
- Service layer conflicts (e.g., duplicate email) return `409 Conflict`.
- Login restriction for pending/rejected organizers returns `403 Forbidden`.

**Error handling:**
Centralized error handling in `errorHandler.js`. Controllers use `try/catch` blocks and pass errors via `next(error)`. Fallback to `500 Internal Server Error`.

**File storage:**
- Player avatars: `/uploads/players/avatar/`
- Player gallery: `/uploads/players/gallery/`
- Organizer documents: `/uploads/organizers/documents/` *(New – Day 8)*
- Only relative file paths are stored in the database (no binary/base64).
- Static file serving via `express.static('uploads')`.

**Background Jobs (Day 7):**
- Bull queue for bulk player CSV imports.
- Worker process handles row-by-row insertion with error logging.

**Configuration:**
Application is configured using environment variables (.env).

**Environment variables used:**
- Database configuration (Host, User, Password, Database Name)
- `JWT_SECRET` for token signing
- `REDIS_URL` for Bull queue connection
- `PORT` for server binding

**Logging:**
Custom `logger` middleware tracks incoming requests (Method, URL, Status, Response Time).

---

# Frontend Audit

**Framework:**
React 18 with TypeScript, bundled by Vite.

**Routing:**
Client-side routing via React Router. Includes a `<ProtectedRoute>` wrapper for authenticated routes.
- `/login` – Login page
- `/register` – Registration page
- `/players` – Player management (protected)
- `/signup-organizer` – Organizer signup form *(New – Day 8)*
- `/admin/organizers` – Admin organizer management panel *(New – Day 8)*

**State management:**
React Query for server state. URL state for syncing filters (Team, Date, Search, Pagination).

**API communication:**
Handled via Axios instances (`frontend/src/api/axios.ts`). Centralized API modules:
- `playerApi.ts`
- `teamApi.ts`
- `authApi.ts`
- `organizerApi.ts` *(New – Day 8)*
- `adminApi.ts` *(New – Day 8)*

**Authentication flow:**
JWT persisted in `localStorage`. Axios Interceptors automatically attach Bearer token. Unauthenticated requests (401) trigger redirect to login page.

**Components:**
- Forms: Login, Register, OrganizerSignup, PlayerForm
- Tables: PlayersTable, OrganizersTable *(New – Day 8)*
- UI: Dialogs, Badges, Buttons, Upload previews

**Hooks:**
Custom hooks using React Query for data fetching:
- `usePlayers` – paginated player data
- `useTeams` – team listing
- `useOrganizers` – pending organizer listing *(New – Day 8)*

**Validation:**
Client-side validation maps backend errors inline and prevents invalid form submissions.

---

# Database Audit

**Schema overview:**
Relational schema with normalized tables: `users`, `teams`, `players`, `organizers`.

**New table – `organizers` (Day 8):**
`sql
CREATE TABLE organizers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  org_name VARCHAR(255),
  address TEXT,
  state VARCHAR(100),
  city VARCHAR(100),
  zone VARCHAR(100),
  aadhaar_number VARCHAR(20),
  pan_number VARCHAR(20),
  documents JSON,
  role ENUM('organizer') DEFAULT 'organizer',
  approval_status TINYINT DEFAULT 0,
  is_active TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

**Approval Status Values:**
- `0` = Pending
- `1` = Approved
- `2` = Rejected

**Relationships:**
- One-to-Many: `teams` → `players`

**Indexes:**
- Primary keys implicitly indexed.
- Unique constraints on `users.email`, `teams.name`, `players.email`, `organizers.email`.

---

# API Audit

**Available endpoints:**

*Authentication:*
- `POST /api/auth/register` – Create a new user account.
- `POST /api/auth/login` – Authenticate and return JWT (with approval check for organizers).
- `GET /api/auth/me` – Return authenticated user profile.
- `POST /api/auth/signup-organizer` – Submit organizer signup with documents. *(New – Day 8)*

*Players:*
- `GET /api/players` – Retrieve paginated/filtered players.
- `POST /api/players` – Create a player (requires role=organizer + approved). *(Updated – Day 8)*
- `PUT /api/players/:id` – Update a player. *(Updated – Day 8)*
- `DELETE /api/players/:id` – Soft-delete a player.

*Teams:*
- `GET /api/teams` – Retrieve all teams.
- `POST /api/teams` – Create a team (requires role=organizer + approved). *(Updated – Day 8)*

*Admin:* *(New – Day 8)*
- `GET /api/admin/organizers?status=pending` – List organizers by status.
- `PATCH /api/admin/organizers/:id/approve` – Approve an organizer.
- `PATCH /api/admin/organizers/:id/reject` – Reject an organizer.

**Authentication requirements:**
- Public: `/api/auth/register`, `/api/auth/login`, `/api/auth/signup-organizer`, `GET /api/players`, `GET /api/teams`.
- Protected (any authenticated): `/api/auth/me`.
- Protected (organizer + approved): `POST/PUT/DELETE /api/players`, `POST /api/teams`.
- Protected (admin): `/api/admin/*`.

---

# Security Audit

**Authentication:**
Secure bcrypt password hashing and JWT stateless session management. JWT now encodes `role` and `approval_status`.

**Authorization:**
Endpoint-level protection via `authMiddleware`, `requireRole()`, and `requireApproved()` middleware chain.

**Validation:**
Prevents malformed data from reaching the database. File uploads enforce type and size constraints.

**Sensitive data:**
Passwords never returned in API responses. Aadhaar/PAN numbers stored but never returned unless explicitly requested by admin.

**Potential vulnerabilities:**
- Rate limiting: 100 requests / 15 mins (mitigates brute-force).
- SQL injection prevented via parameterized queries.
- Helmet secures HTTP headers.
- File uploads restricted by MIME type and size (prevents malicious file injection).

---

# Current Limitations

**Known issues:**
- No automated testing suites (Jest/Supertest).
- No refresh token rotation; JWTs are long-lived.
- Admin role must be seeded manually in the database (no admin signup endpoint).

**Incomplete features (to be addressed in future days):**
- Email notifications to organizer on approval/rejection.
- Pagination for `/api/admin/organizers`.
- Admin dashboard statistics.

---

# Suggested Future Improvements

**Architecture improvements:**
- Redis caching for `GET /api/teams` and `GET /api/admin/organizers`.
- Docker containerization for deployment.

**Performance improvements:**
- Database indexing on `organizers.approval_status` and `players.name`.

**Security improvements:**
- Implement JWT refresh tokens.
- Consider CSRF protection for cookie-based auth migration.

**Developer experience improvements:**
- Integrate ESLint and Prettier.
- Add Swagger/OpenAPI documentation.
- Implement a CI/CD pipeline via GitHub Actions.
