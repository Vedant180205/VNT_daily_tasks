# Project Architecture

## Project Architecture Overview

The VNT Player Management System follows a strict **N-Tier (Layered) Architecture** on the backend and a **Component-Based Architecture** on the frontend. The system is designed to cleanly separate HTTP concerns from core business logic and database execution, ensuring high maintainability and testability. The application is completely stateless, relying on JSON Web Tokens (JWT) for session management and standard REST principles for client-server communication.

As of Day 8, the system has expanded to include a full **Role-Based Access Control (RBAC)** layer, introducing the Organizer role, an Admin approval workflow, and role-scoped middleware enforcement.

## Layer Responsibilities

### Backend Layers
1. **Routes (`/src/routes`)**: Maps incoming HTTP requests (verbs and endpoints) to specific controller functions. Also applies route-level middleware (e.g., authentication, validation, role checks).
2. **Controllers (`/src/controllers`)**: Acts as the entry point for the HTTP request lifecycle. Extracts parameters (body, query, params), delegates work to the Service layer, and formats the standard JSON HTTP response.
3. **Services (`/src/services`)**: The core of the application. Contains all business logic, validation rules, and error throwing. It calls the Model layer to persist or retrieve data.
4. **Models (`/src/models`)**: The data access layer. Executes raw parameterized SQL queries against the MySQL database. Returns formatted dataset results back to the Service layer.
5. **Middleware (`/src/middleware`)**: Intercepts requests before they reach controllers. Includes:
   - `authMiddleware` – JWT token verification
   - `requireRole(role)` – Checks `req.user.role` against the required role
   - `requireApproved()` – Checks that the organizer's `approval_status === 1`
   - `uploadMiddleware` – Multer-based file handling for player/organizer document uploads
   - `errorHandler` – Centralized error handler
   - `validatePlayer`, `validateAuth`, `validateTeam` – Schema-level input validation

### Frontend Layers
1. **Pages (`/src/pages`)**: Top-level views orchestrating layouts and integrating URL state.
2. **Hooks (`/src/hooks`)**: Custom React Query hooks managing server state, fetching, caching, and background synchronization.
3. **Components (`/src/components`)**: Reusable UI elements (forms, tables, dialogs) receiving data via props or internal state.
4. **API Layer (`/src/api`)**: Axios instances and route definitions handling network requests and token injection via interceptors.

## Request Lifecycle

1. **Client Initiation**: The frontend triggers an HTTP request via Axios.
2. **Security & Rate Limiting**: The backend receives the request. Global middleware (`helmet`, `cors`, `rateLimit`) processes it first.
3. **Authentication Check**: If the route is protected, `authMiddleware` validates the JWT in the `Authorization` header.
4. **Role Check**: If the route requires a role (e.g., organizer or admin), `requireRole()` validates `req.user.role`.
5. **Approval Check**: For organizer-scoped routes, `requireApproved()` checks `approval_status === 1`.
6. **Payload Validation**: Route-level middleware (e.g., `validatePlayer`) verifies the request body structure.
7. **Controller Processing**: The controller extracts the validated data and calls the appropriate service method.
8. **Business Logic Execution**: The service processes business rules and throws custom errors if rules fail.
9. **Database Interaction**: The model executes parameterized SQL and returns the raw rows.
10. **Response Formatting**: The controller receives the data and sends a structured JSON response.
11. **Error Interception**: If any layer throws an error, the Global Error Handler formats it into a safe JSON response.

## RBAC Architecture

The Role-Based Access Control system is built on top of the existing authentication layer.

### Roles Defined
| Role | Description |
|------|-------------|
| `admin` | Full system access. Can approve/reject organizers. |
| `organizer` | Can manage players/teams. Must be approved by admin first. |
| `user` | Default role. Basic read access. |

### Approval Status Enum
| Value | Meaning |
|-------|---------|
| `0` | Pending – awaiting admin review |
| `1` | Approved – can login and access organizer features |
| `2` | Rejected – cannot login |

### RBAC Middleware Chain (Organizer Routes)
`
Request → authMiddleware → requireRole('organizer') → requireApproved() → Controller
`

### Admin Routes
Admin routes are protected via:
`
Request → authMiddleware → requireRole('admin') → Controller
`

## Authentication & Authorization Flow

### Login Restriction (Updated for Day 8)
1. Client submits credentials to `POST /api/auth/login`.
2. `authService` retrieves the user by email.
3. `bcrypt.compare()` verifies the password.
4. **NEW**: If `role === 'organizer'` and `approval_status !== 1`, return `{ success: false, message: "Account not approved yet" }`.
5. If fully valid, sign and return JWT containing `{ id, role, approval_status }`.

### Organizer Signup Flow
1. Organizer submits form to `POST /api/auth/signup-organizer` (multipart/form-data with documents).
2. `organizerService` saves record with `role='organizer'`, `approval_status=0`, `is_active=0`.
3. Documents are stored in `/uploads/organizers/documents/`.
4. Organizer cannot login until admin approves.

### Admin Approval Flow
1. Admin calls `GET /api/admin/organizers?status=pending` to see pending list.
2. Admin reviews details and calls `PATCH /api/admin/organizers/:id/approve` or `PATCH /api/admin/organizers/:id/reject`.
3. Approved: `approval_status=1`, `is_active=1`. Rejected: `approval_status=2`, `is_active=0`.

## File Upload Flow

### Player Uploads (Day 7 – Implemented)
- **Avatar**: Single image → `/uploads/players/avatar/`
- **Gallery**: Up to 5 images → `/uploads/players/gallery/`
- Constraints: Max 2MB per file, .jpg/.png only.
- Storage: Relative file path stored in DB (NOT binary/base64).

### Organizer Document Uploads (Day 8 – New)
- **Documents**: Multiple files → `/uploads/organizers/documents/`
- Constraints: .jpg, .png, .pdf accepted; max 5MB per file.
- Storage: Relative file paths stored in `organizers.documents` (JSON column).

## Frontend → Backend Flow

The frontend communicates with the backend exclusively via RESTful JSON APIs using `Axios`.
- **Interceptors**: An Axios request interceptor attaches the JWT from `localStorage` to the `Authorization` header for every outgoing request. An Axios response interceptor acts globally to catch `401 Unauthorized` responses and forcibly logs the user out.
- **Server State Management**: React Query handles the fetching flow.

## Backend → Database Flow

The backend communicates with a MySQL database via the `mysql2` connection pool (`config/db.js`).
- No ORM/ODM is used. Queries are written in raw SQL.
- **Query Parameterization**: Every dynamic value is injected using `?` placeholders.
- **Relational Joins**: Players joined with teams via `LEFT JOIN`.
- **Pagination Strategy**: Separate `COUNT(*)` query followed by `LIMIT`/`OFFSET`.

## Error Handling Flow

The system employs a strictly centralized error handling paradigm.
1. Controllers wrap all execution inside `try/catch` blocks.
2. If a Service throws a custom error, or a Model encounters a database error, it falls to the `catch`.
3. The controller passes the error downstream using `next(error)`.
4. The Global Error Handler middleware (`errorHandler.js`) intercepts it and formats a secure, consistent JSON response.

## Dependency Graph

`	ext
[Frontend (React/Vite/TypeScript)]
  ├── React Router (Navigation + Protected Routes)
  ├── React Query (Server State Cache)
  └── Axios (HTTP Client)
       └── Interceptors (Auth Injection / 401 Redirect)

[Backend (Express)]
  ├── Helmet & CORS (Security)
  ├── Express Rate Limit (DDoS Protection)
  ├── jsonwebtoken (Auth + Role Payload)
  ├── bcrypt (Password Hashing)
  ├── multer (File Upload Handling)
  ├── bull + ioredis (Background Job Queue – Day 7)
  └── mysql2 (Database Pool)
`

## Folder Responsibilities

- **`backend/src/config/`**: External connection setups (Database pool, Redis).
- **`backend/src/controllers/`**: HTTP request/response orchestration.
- **`backend/src/middleware/`**: Request interceptors (Auth, Role, Approval, Upload, Validation, Error Handling).
- **`backend/src/models/`**: SQL execution and data persistence.
- **`backend/src/routes/`**: Endpoint definitions and middleware binding.
- **`backend/src/services/`**: Application business logic and rule enforcement.
- **`backend/src/queues/`**: Bull queue definitions for background jobs.
- **`backend/src/workers/`**: Background job processors.
- **`backend/src/utils/`**: Utility functions (file deletion, formatting).
- **`frontend/src/api/`**: Network request definitions and Axios config.
- **`frontend/src/components/`**: Dumb/Reusable UI elements.
- **`frontend/src/hooks/`**: Smart/Stateful data fetching logic.
- **`frontend/src/pages/`**: View orchestration and URL syncing.

## Module Interaction Diagram

`mermaid
graph TD
    Client[Client UI / React] -->|HTTP Request| Router[Express Router]
    Router -->|Middleware Checks| Auth[authMiddleware]
    Router -->|Middleware Checks| Role[requireRole]
    Router -->|Middleware Checks| Approved[requireApproved]
    Router -->|Middleware Checks| Val[validatePlayer / validateAuth]
    Auth --> Controller[Controller]
    Role --> Controller
    Approved --> Controller
    Val --> Controller
    Controller -->|Extracted Params| Service[Service Layer]
    Service -->|Business Logic / Checks| Model[Model Layer]
    Model -->|Parameterized SQL| DB[(MySQL Database)]
    DB -->|Raw Rows| Model
    Model -->|Formatted Data| Service
    Service -->|Result or Error| Controller
    Controller -->|JSON Response| Client
    Service -..->|Throws Error| ErrorHandler[Global Error Handler]
    ErrorHandler -..->|Formatted Error| Client
`

---

## Architectural Observations

### Reusable Utilities
The architecture makes excellent use of reusable abstractions. The Global Error Handler is a prime example of reusing error formatting logic across the entire application. On the frontend, custom React Query hooks abstract away the complexity of data fetching.

### Design Patterns Being Used
1. **Dependency Injection (Light)**: Passing connection pools and request objects downwards.
2. **Singleton**: The `mysql2` connection pool acts as a singleton.
3. **Decorator (Middleware)**: Express middleware acts as the decorator pattern, dynamically adding validation, authentication, and role enforcement to specific routes.
4. **Strategy Pattern**: `requireRole()` accepts a role string, making it a reusable strategy for any role-based check.

### Architectural Strengths
- **Separation of Concerns**: HTTP logic is entirely decoupled from business logic.
- **Statelessness**: JWT usage ensures backend memory is not consumed by active sessions.
- **Security**: Centralized error handling prevents stack trace leaks, parameterized queries prevent SQL injection, and role middleware prevents privilege escalation.
- **Extensibility**: RBAC middleware can be composed freely (`requireRole` + `requireApproved`) without coupling.

### Architectural Weaknesses
- **No Refresh Tokens**: JWTs are long-lived with no rotation mechanism.
- **Lacking Data Transfer Objects (DTOs)**: The service layer receives raw `req.body` objects.
- **Model Bloat Risk**: As filtering becomes more complex, dynamic SQL generation could become difficult to maintain.
- **No Test Architecture**: No Unit or Integration testing infrastructure exists.

### Potential Future Refactoring Opportunities
1. **Schema Validation Library**: Refactor custom validators to use `Joi` or `Zod`.
2. **Query Builder Integration**: Use `Knex.js` to improve dynamic `WHERE` clause management.
3. **Refresh Token System**: Add JWT refresh token rotation for improved security.
4. **TypeScript (Backend)**: Migrate backend to TypeScript to enforce interfaces across layers.
