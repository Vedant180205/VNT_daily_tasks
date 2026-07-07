# Project Overview

**Purpose of the project:** 
The Player Management System is a full-stack application designed to handle the creation, reading, updating, and deletion (CRUD) of player records and their associated teams. It extends a foundational CRUD application by introducing secure authentication, authorization, relational database design, secure APIs, advanced filtering capabilities, and centralized error handling.

**Current implementation status:** 
Fully functional. Registration, Login, and Me endpoints are working. Protected routes are secured with JWT authentication. Relational queries mapping one-to-many entities (Teams to Players) are in place. Advanced filtering (search, team, date, and pagination) is implemented.

**Technology stack:**
- **Backend:** Node.js, Express.js
- **Frontend:** React, TypeScript, Vite, React Query, Axios
- **Database:** MySQL
- **Authentication:** JSON Web Tokens (JWT), bcrypt

**Dependencies:**
Verified via analysis of backend (`express`, `cors`, `helmet`, `express-rate-limit`, `dotenv`) and frontend (`axios`, `react-query`). 

**Folder structure:**
```text
Project Root
├── backend/
│   ├── migrations/         
│   ├── postman/            
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/    
│   │   ├── middleware/     
│   │   ├── models/         
│   │   ├── routes/         
│   │   ├── services/       
│   │   ├── utils/       
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
```

**Application architecture summary:**
- **Backend:** Layered (N-Tier) Architecture. Request flows from Routes -> Controllers -> Services -> Models (Database).
- **Frontend:** Component-based architecture. Pages orchestrate layouts, Components handle UI, Hooks manage state, and API layer handles network requests.

---

# Backend Audit

**Route structure:**
Modular route structure configured in `app.js`.
- `/api/players` -> `playerRoutes`
- `/api/auth` -> `authRoutes`
- `/api/teams` -> `teamRoutes`

**Controllers:**
Responsible for handling HTTP requests, extracting parameters, and delegating business logic to services.

**Services:**
Encapsulate core business logic, including validations (e.g., duplicate email checks) before passing data to models.

**Repositories (Models):**
`playerModel.js`, `teamModel.js`, `userModel.js` handle direct database interactions using parameterized SQL queries. Includes dynamic `WHERE` clause generation for advanced filtering.

**Middleware:**
- `helmet`: Security headers
- `cors`: Cross-Origin Resource Sharing
- `express-rate-limit`: Rate limiting for API requests
- `logger`: Request logging
- `authMiddleware`: JWT token validation
- `errorHandler`: Centralized error handler
- `notFound`: 404 handler

**Authentication:**
- Powered by JWT and bcrypt.
- `POST /api/auth/register` hashes passwords.
- `POST /api/auth/login` issues signed JWTs.
- `GET /api/auth/me` returns the authenticated user profile.

**Authorization:**
`authMiddleware` checks for `Authorization: Bearer <token>` on protected routes. Mutating routes (POST, PUT, DELETE for `/api/players`) are strictly protected.

**Validation:**
Validation errors return `400 Bad Request`. Service layer errors (e.g., conflicts) return `409 Conflict`.

**Error handling:**
Centralized error handling in `errorHandler.js`. Controllers use `try/catch` blocks and pass errors via `next(error)`. Fallback to `500 Internal Server Error` ensuring standard JSON format.

**Utilities:**
Utility functions handle auxiliary tasks.

**Database layer:**
`mysql2` package manages the connection pool (`config/db`).

**ORM/ODM usage:**
No ORM/ODM is used. Raw parameterized SQL queries are executed via a connection pool.

**File storage:**
No local or cloud file storage observed in the current implementation.

**Configuration:**
Application is configured using environment variables.

**Environment variables used:**
- Database configuration (Host, User, Password, Database Name)
- `JWT_SECRET` for token signing
- Base URL (in Postman)

**Logging:**
Custom `logger` middleware tracks incoming requests.

---

# Frontend Audit

**Framework:**
React 18 with TypeScript, bundled by Vite.

**Routing:**
Client-side routing is used (React Router assumed based on the existence of `pages/`). Includes a `<ProtectedRoute>` wrapper.

**State management:**
React Query (Server State Management) for fetching, caching, synchronizing, and updating server data. URL state is used for syncing filters (Team, Date).

**API communication:**
Handled via `axios` instances (`frontend/src/api/axios.ts`). Centralized API modules exist (e.g., `playerApi.ts`, `teamApi.ts`).

**Authentication flow:**
JWT is persisted in `localStorage`. Axios Interceptors automatically attach the Bearer token to outgoing requests. Unauthenticated requests (401) trigger a redirect to the login page.

**Components:**
Reusable UI elements are organized in `frontend/src/components`. Toolbar components manage filters.

**Reusable UI:**
Forms, Dialogs, and Tables are modularized.

**Hooks:**
Custom hooks leverage React Query for data fetching.

**Forms:**
Dedicated forms exist for Registration, Login, and Player Creation/Editing.

**Validation:**
Client-side validation is implemented, mapping backend errors inline.

**Assets:**
Static assets are stored in `frontend/src/assets`.

**Performance observations:**
- Efficient server state management via React Query reduces redundant API calls.
- Advanced SQL filtering offloads heavy operations to the database.

---

# Database Audit

**Schema overview:**
Relational schema using three normalized tables: `users`, `teams`, `players`.

**Relationships:**
- One-to-Many relationship between `teams` and `players`. One team can have many players.

**Indexes:**
Primary keys (`id`) are implicitly indexed. Unique constraints exist on `users.email`, `teams.name`, and `players.email`.

**Constraints:**
- Foreign Key: `players.team_id` references `teams.id` (Nullable for Free Agents).
- Data Types: INT, VARCHAR, BOOLEAN, DATE.

**Data flow:**
Queries utilize `LEFT JOIN` on `team_id` to retrieve relational data without redundancy, ensuring players without teams are still retrieved. 

---

# API Audit

**Available endpoints:**
- `POST /api/auth/register`: Create a new user account.
- `POST /api/auth/login`: Authenticate and return JWT.
- `GET /api/auth/me`: Return authenticated user profile.
- `GET /api/players`: Retrieve paginated/filtered players.
- `POST /api/players`: Create a player.
- `PUT /api/players/:id`: Update a player.
- `DELETE /api/players/:id`: Soft-delete a player.
- `GET /api/teams`: Retrieve all teams.
- `POST /api/teams`: Create a team.

**Request flow:**
Client -> Middleware (Rate Limiter, CORS, Helmet) -> Auth Middleware (if protected) -> Route -> Controller -> Service -> Model -> Database.

**Response format:**
Consistent JSON structure. Includes `success`, `message`, and `data`/`total` payloads.

**Validation strategy:**
Input validation occurs before service execution. Errors throw `400` status codes.

**Authentication requirements:**
- Public: `/api/auth/register`, `/api/auth/login`, `/api/players`, `/api/teams`.
- Protected: `/api/auth/me`, `POST/PUT/DELETE /api/players`, `POST /api/teams`.

---

# Security Audit

**Authentication:**
Secure implementation utilizing `bcrypt` for password hashing and JWT for stateless session management.

**Authorization:**
Endpoint-level protection successfully restricts unauthorized mutations.

**Validation:**
Prevents malformed data from reaching the database.

**Sensitive data:**
Passwords are not returned in API payloads. Environment variables conceal secrets.

**Potential vulnerabilities:**
- Rate limiting is configured (100 requests / 15 mins), which mitigates brute-force attacks.
- SQL injection is prevented via parameterized queries.
- Helmet secures HTTP headers.
- Could not verify if XSS protection is explicitly handled on the frontend (React handles this automatically via `{}` binding).

---

# Code Quality

**Folder organization:**
Highly structured, separating concerns cleanly across both backend and frontend layers.

**Naming conventions:**
Consistent camelCase for variables/functions, PascalCase for React components.

**Reusability:**
Services encapsulate business logic, allowing models and controllers to remain focused. React components are designed for reuse.

**Duplication:**
Minimal duplication observed. Database querying abstracts common patterns.

**Maintainability:**
The layered architecture ensures that changes to the database do not implicitly break controllers, ensuring high maintainability.

**Scalability:**
The application is structured to easily scale. Adding new entities requires mirroring the Route -> Controller -> Service -> Model flow.

**Technical debt:**
No immediate technical debt observed based on the architectural layout.

---

# Current Limitations

**Known issues discovered:**
No functional bugs observed. Could not verify exhaustive test coverage (unit/integration tests like Jest/Mocha).

**Incomplete features:**
- Missing automated testing suites (e.g., Jest) in the codebase.
- No user roles (e.g., Admin vs Standard User); all authenticated users have the same privileges.

**Potential improvements:**
- Implement Role-Based Access Control (RBAC).
- Add robust Unit and Integration Tests.
- Implement server-side data validation using libraries like `Joi` or `Zod`.

---

# Suggested Future Improvements

**Architecture improvements:**
- Consider implementing caching (e.g., Redis) for heavily requested routes like `GET /api/teams`.
- Containerization using Docker for seamless deployments.

**Performance improvements:**
- Introduce database indexing on frequently searched columns like `players.name` and `players.email` for faster read queries as the dataset grows.

**Security improvements:**
- Implement Refresh Tokens to enhance JWT security and UX.
- Consider CSRF protection if switching from localStorage JWT to HTTP-only Cookies.

**Developer experience improvements:**
- Integrate ESLint and Prettier for enforced code formatting.
- Add Swagger/OpenAPI documentation for interactive API exploration.
- Implement a robust CI/CD pipeline (e.g., GitHub Actions) to automate testing and deployments.
