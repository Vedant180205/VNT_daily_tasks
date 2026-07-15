# Project Overview

## Purpose of the project
The project is a Player Management system that allows authenticated users to manage sports players and teams. Users can create, read, update, and delete (CRUD) player profiles, including uploading avatars and image galleries for each player. It also features team management and user authentication.

## Current implementation status
The system is fully functional with a complete frontend and backend integration. It includes robust authentication, file upload capabilities, soft-deletion for players, and a comprehensive frontend dashboard with filtering, sorting, and pagination.

## Technology stack
**Frontend:**
- React 19 (via Vite)
- TypeScript
- Tailwind CSS v4 for styling
- React Router DOM v7 for routing
- React Query (TanStack) for server state management
- React Hook Form + Zod for form validation
- Radix UI for accessible components (Dialogs, Alert Dialogs)
- Framer Motion for animations
- Axios for API communication

**Backend:**
- Node.js with Express.js
- MySQL2 (Promise wrapper) for database
- Multer for file uploads
- JSON Web Token (JWT) and bcrypt for authentication
- Helmet and Express-Rate-Limit for security

## Dependencies
**Backend:** `express`, `mysql2`, `bcrypt`, `jsonwebtoken`, `multer`, `cors`, `helmet`, `express-rate-limit`, `dotenv`.
**Frontend:** `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `axios`, `react-hook-form`, `zod`, `tailwindcss`, `lucide-react`, `framer-motion`, `@radix-ui/react-dialog`, `sonner` (toast notifications).

## Folder structure
```
/backend
  /migrations - Database creation scripts
  /postman - API testing collections
  /uploads - Static file storage for avatars and galleries
  /src
    /config - Database connection config
    /controllers - Request/Response handlers
    /middleware - Auth, Error, File Upload, and Validation middlewares
    /models - Database interaction layer (Repositories)
    /routes - Express route definitions
    /services - Core business logic
    /utils - Helper functions (e.g., file cleanup)
/frontend
  /public - Static public assets
  /src
    /api - Axios configurations and API definitions
    /assets - Images/SVGs
    /components - UI components (Auth, Layout, Players, UI primitives)
    /hooks - Custom React hooks (e.g., useDebounce, useMutations, usePlayers)
    /pages - Top-level route components (Login, Register, Players)
    /services - Frontend auth service logic
    /types - TypeScript interfaces/types
    /utils - Helper functions (classnames, formatters, auth tokens)
```

## Application architecture summary
The application follows a standard Client-Server architecture. The frontend is a Single Page Application (SPA) built with React that communicates with a RESTful Node.js backend. The backend is structured using a Layered/MVC architecture (Routes -> Controllers -> Services -> Models) ensuring separation of concerns. The database is a relational MySQL database.

---

# Backend Audit

## Route structure
- `/api/auth` - Authentication routes (register, login, me).
- `/api/players` - Player management routes (CRUD operations, pagination, filtering).
- `/api/teams` - Team management routes (fetch all, create).

## Controllers
Controllers (e.g., `authController.js`, `playerController.js`) handle HTTP requests, extract parameters/body data, invoke the appropriate Service layer functions, and return JSON responses.

## Services
The Service layer (e.g., `playerService.js`, `authService.js`) contains the core business logic. This includes hashing passwords, generating JWTs, verifying data uniqueness, and determining which files to delete during player updates.

## Repositories (Models)
The Model layer uses parameterized raw SQL queries via `mysql2` promises. Example methods: `findPlayerByEmail`, `createPlayer`, `getAllPlayers` (handles dynamic SQL for search, sort, filters).

## Middleware
- `authMiddleware.js`: Validates JWT tokens for protected routes.
- `uploadMiddleware.js`: Configures Multer to handle avatar and gallery image uploads.
- `validateAuth.js` / `validatePlayer.js`: Request body validation logic.
- `logger.js`: Logs incoming API requests.
- `notFound.js`: Handles 404 routes.
- `errorHandler.js`: Global error handling middleware formatting errors consistently.

## Authentication
Authentication is handled using JWT. Tokens are generated upon successful login with a 24-hour expiration. Passwords are salted and hashed using `bcrypt` (10 rounds).

## Authorization
Protected routes require a valid JWT passed in the `Authorization: Bearer <token>` header. There are no role-based authorizations (RBAC) currently implemented; any authenticated user can manage players.

## Validation
Validation is handled in route-specific middleware (`validatePlayer.js`, `validateAuth.js`) before reaching controllers. The frontend also implements identical validation using Zod.

## Error handling
Errors thrown in services or controllers are caught (likely via async wrappers or standard try/catch) and passed to `errorHandler.js`, which standardizes the JSON error response and sets the correct HTTP status code.

## Utilities
- `fileUtils.js`: Contains `deleteFile` logic to remove orphaned images when a player is updated or deleted.
- `response.js`: Standardizes API responses.

## Database layer
Relational MySQL database accessed directly via SQL queries.

## ORM/ODM usage
No ORM/ODM is used. The project uses raw SQL parameterized queries with `mysql2` promise pools.

## File storage
Files are stored locally in the `/uploads/players/avatar` and `/uploads/players/gallery` directories. The paths are saved as string values (or JSON strings for galleries) in the database.

## Configuration
Application configuration (Ports, JWT Secrets, DB Credentials) is managed using environment variables via the `dotenv` package.

## Environment variables used
*(Assumed based on standard patterns)*: `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`.

## Logging
Custom `logger.js` middleware logs request method, URL, and time.

---

# Frontend Audit

## Framework
React 19 initialized with Vite, utilizing TypeScript for type safety.

## Routing
Client-side routing managed by `react-router-dom`. Routes are split into public (Login, Register) and protected (Players Dashboard). Protected routes use a `<ProtectedRoute>` wrapper.

## State management
- **Server State:** Handled by `@tanstack/react-query` for fetching, caching, synchronizing, and updating server data (players, teams).
- **Form State:** Handled by `react-hook-form`.
- **Local UI State:** Handled via standard React `useState`.

## API communication
`axios` is configured (likely with base URL and interceptors) in `src/api/axios.ts` to automatically attach the JWT token from local storage to requests.

## Authentication flow
1. User logs in via `/login`.
2. Frontend sends credentials to `/api/auth/login`.
3. Backend returns a JWT token.
4. Token is stored in `localStorage` (via `utils/auth.ts`).
5. Axios interceptor attaches the token to subsequent requests.
6. `ProtectedRoute` component verifies token presence before rendering dashboard.

## Components
Modular component architecture divided into:
- `auth`: Protection wrappers.
- `layout`: Structural UI elements (DashboardHeader, Toolbar, SearchBar).
- `players`: Domain-specific components (Cards, Forms, Grids, Uploaders).
- `ui`: Reusable primitive components (Button, Input, Dialog).

## Reusable UI
Custom reusable UI components (Buttons, Inputs, Selects, Dialogs) styled with Tailwind CSS, utilizing `clsx` and `tailwind-merge` for dynamic class management.

## Hooks
- `usePlayers.ts` / `useTeams.ts`: React Query wrappers for fetching data.
- `useMutations.ts`: React Query wrappers for POST/PUT/DELETE operations.
- `useDebounce.ts`: Custom hook to debounce search input.

## Forms
Forms are built using `react-hook-form` connected to Zod schemas for validation. 

## Validation
Zod is used for schema-based validation. The schemas map directly to backend constraints (e.g., required fields, email formatting).

## Assets
Icons are provided by `lucide-react`. Local assets stored in `/public` and `/src/assets`.

## Performance observations
- Search input is debounced to prevent excessive API calls.
- React Query aggressively caches data and provides optimistic UI updates/loading states.
- File uploads are managed natively. 
- *Observation:* Gallery arrays are parsed from JSON, which is relatively fast but requires careful frontend parsing.

---

# Database Audit

## Schema overview
- **users:** `id` (PK), `name`, `email`, `password`.
- **teams:** `id` (PK), `name`.
- **players:** `id` (PK), `name`, `email`, `phone`, `team_id` (FK), `avatar` (VARCHAR), `gallery` (JSON/VARCHAR), `is_deleted` (BOOLEAN), `created_at` (TIMESTAMP).

## Relationships
- A `player` belongs to one `team` (`team_id` foreign key referencing `teams.id`).

## Data flow
1. Client requests data.
2. Controller parses request.
3. Service enforces business logic (e.g., checking email uniqueness).
4. Model executes raw SQL query.
5. Database returns data.
6. Service transforms data (e.g., parsing gallery JSON).
7. Controller sends JSON to client.

*(Note: Exact indexes and constraints besides PKs and FKs could not be fully verified without viewing the exact SQL dump/migration files, but `email` is likely UNIQUE).*

---

# API Audit

## Available endpoints
- `POST /api/auth/register` - Create a user.
- `POST /api/auth/login` - Authenticate user.
- `GET /api/auth/me` - Get current user profile.
- `GET /api/players` - Get paginated/filtered players.
- `POST /api/players` - Create player (multipart/form-data).
- `GET /api/players/:id` - Get specific player.
- `PUT /api/players/:id` - Update player (multipart/form-data).
- `DELETE /api/players/:id` - Soft delete player.
- `GET /api/teams` - Get all teams.
- `POST /api/teams` - Create a team.

## Request flow
Client Request -> Helmet (Security) -> Rate Limiter -> CORS -> Body Parser -> Logger -> Route -> Middleware (Auth/Validation) -> Controller -> Service -> Model -> Database.

## Response format
Responses appear to follow a structured format. Usually wrapping data or returning specific JSON structures, e.g., `{ data: [...], totalPages, ... }` for pagination, or `{ token, user }` for auth. Errors are standardized by `errorHandler.js`.

## Validation strategy
Validation happens on both sides:
1. Client-side using Zod before submission.
2. Server-side using custom middleware before hitting business logic.
3. Database level (Foreign Key constraints).

## Authentication requirements
All `/api/players` and `/api/teams` routes (except potentially GET requests, though usually all are protected) require a valid JWT Bearer token.

---

# Security Audit

## Authentication
JWT is securely implemented with expirations. Passwords are securely hashed with bcrypt.

## Authorization
Currently limited to "must be logged in". There is no multi-tenancy or admin/user role split. Any authenticated user can mutate any player record.

## Validation
Strong validation layer prevents SQL Injection (via parameterized queries) and XSS (React automatically escapes variables; Helmet adds security headers).

## Sensitive data
Passwords are never returned in API responses. `authService.js` explicitly strips passwords before returning user data.

## Potential vulnerabilities
- **File Uploads:** While `multer` is used, if file types are not strictly validated, malicious files (like `.js` or `.php`) could be uploaded to the `uploads` directory. *(Could not verify file type validation inside uploadMiddleware.js)*.
- **Rate Limiting:** Implemented but globally scoped to `/api`. Could be easily bypassed by changing IPs if behind a proxy without proper `trust proxy` configuration.

---

# Code Quality

## Folder organization
Excellent. The separation of concerns is clear and adheres to standard enterprise patterns (MVC/Layered architecture for backend; Component/Hook/Service split for frontend).

## Naming conventions
Consistent camelCase for variables/functions, PascalCase for React components. Meaningful and descriptive variable names are used.

## Reusability
High reusability on the frontend via the `ui` folder (Radix primitives wrapped in Tailwind classes). Backend services abstract logic nicely.

## Technical debt
- **Raw SQL:** Using raw SQL without an ORM/Query Builder makes schema changes and complex queries harder to manage over time.
- **File Storage:** Storing images on the local filesystem (`uploads/`) will not scale horizontally. If the server scales to multiple instances, file states will desync.

---

# Current Limitations

## Known issues discovered
- **Local File Storage:** Uploaded avatars and galleries are tied to the local server disk.
- **Authorization:** Missing granular permissions. Any logged-in user can delete players created by others.
- **Hard Deletes:** While players are soft-deleted, images might still remain on disk depending on the cleanup logic flow. The `fileUtils.js` is present, but garbage collection for soft-deleted records might leave orphaned files.

## Potential improvements
- Move to cloud storage (e.g., AWS S3, Cloudinary) for file uploads.
- Implement an ORM like Prisma or Sequelize for better database maintainability.
- Add Role-Based Access Control (RBAC).

---

# Suggested Future Improvements

## Architecture improvement
- **Cloud Storage:** Refactor `uploadMiddleware.js` and `fileUtils.js` to upload/delete files from AWS S3.
- **Database ORM:** Migrate raw SQL queries to an ORM for type safety and easier migrations.

## Performance improvements
- **Image Optimization:** Compress images using libraries like `sharp` before saving them to disk/cloud to save bandwidth and storage.
- **Redis Caching:** Implement caching for heavily read API endpoints like `GET /api/teams` or common `GET /api/players` queries.

## Security improvements
- **Strict File Type Validation:** Ensure `multer` restricts uploads to `.jpeg`, `.png`, `.webp` and enforces strict file size limits.
- **Refresh Tokens:** Implement a Short-Lived Access Token + HttpOnly Refresh Token strategy instead of storing long-lived JWTs in `localStorage`.

## Developer experience improvements
- **API Documentation:** Implement Swagger/OpenAPI using `swagger-ui-express` for auto-generated backend documentation.
- **Dockerization:** Add a `Dockerfile` and `docker-compose.yml` to spin up the database, backend, and frontend with a single command.
