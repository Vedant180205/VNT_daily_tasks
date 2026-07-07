# Coding Standards & Architectural Guidelines

As a Senior Engineering Manager, this document outlines the strict coding standards, architectural conventions, and general best practices derived from our existing codebase. It serves as mandatory instruction for all developers and future AI implementations contributing to the Player Management System.

## General Principles
- **Strict Layering**: Maintain a strict N-Tier architecture on the backend (Routes → Controllers → Services → Models) and a Component-Based architecture on the frontend. Logic must not bleed across layers.
- **Statelessness**: The backend must remain completely stateless. All session data must be managed via JWTs.
- **Readability Over Cleverness**: Code should be explicit and easy to read. Avoid overly clever one-liners if they sacrifice readability.
- **Fail Fast**: Catch errors, validate data, and throw exceptions as early in the request lifecycle as possible.

## Folder Organization
### Backend
- `src/config/`: Configuration files (e.g., database connection pool).
- `src/controllers/`: HTTP request/response handlers.
- `src/middleware/`: Express middlewares (Auth, Validation, Error Handling).
- `src/models/`: Database query execution (Repositories).
- `src/routes/`: Route definitions connecting HTTP verbs to controllers.
- `src/services/`: Core business logic and validation.

### Frontend
- `src/api/`: Axios instances and network request definitions.
- `src/components/`: Reusable UI components grouped by feature/domain (e.g., `players`, `auth`, `ui`).
- `src/hooks/`: React Query and custom data-fetching hooks.
- `src/pages/`: Top-level routing views.
- `src/types/`: TypeScript interfaces and type definitions.
- `src/utils/`: Pure helper functions.

## Naming Conventions
- **Files/Directories**: 
  - Backend files: `camelCase` (e.g., `playerController.js`, `authRoutes.js`).
  - Frontend components/pages: `PascalCase` (e.g., `PlayerCard.tsx`, `App.tsx`).
  - Frontend hooks/utils: `camelCase` (e.g., `usePlayers.ts`, `formatDate.ts`).
- **Variables & Functions**: `camelCase` (e.g., `createPlayer`, `isEditDialogOpen`).
- **Interfaces/Types (Frontend)**: `PascalCase` (e.g., `PlayerCardProps`, `Player`).
- **Booleans**: Prefix with `is`, `has`, or `should` (e.g., `isDeleted`, `hasAccess`).
- **Database Tables**: `snake_case`, plural (e.g., `players`, `teams`).
- **Database Columns**: `snake_case` (e.g., `team_id`, `created_at`).

## File Organization
- **Imports**: Group imports logically. Built-in modules first, third-party libraries second, internal relative paths last.
- **Exports**: 
  - Backend: Use `module.exports = { functionName }` at the bottom of the file.
  - Frontend: Use named exports (`export const ComponentName = ...`) over default exports for consistent intellisense and refactoring.

## Component Structure (Frontend)
- Use functional components exclusively with React Hooks.
- Define Props using TypeScript `interface` right above the component.
- Explicitly type components using `React.FC<PropsName>`.
- Destructure props directly in the function signature.
- Keep components small. If a component exceeds 150 lines, evaluate if it can be broken down.
- **Styling**: Tailwind CSS utility classes are standard. Group utilities logically (layout, spacing, typography, colors, interactions).

## Controller Guidelines
- Controllers must ONLY handle HTTP concerns: extracting `req.body`, `req.params`, `req.query`, passing them to a service, and sending the `res.json()`.
- Controllers must NOT contain business logic or database queries.
- Controllers must wrap execution in a `try/catch` block and pass errors to `next(error)`.
- Enforce standard JSON response structures: `{ success: boolean, data: any, message?: string }`.

## Service Guidelines
- Services hold the core business logic of the application.
- Validate business rules here (e.g., "Does this email already exist?").
- If a business rule fails, throw a custom Error object with an attached HTTP status code (e.g., `const err = new Error('Conflict'); err.status = 409; throw err;`).
- Services must NOT interact with `req` or `res` objects directly.

## Repository (Model) Guidelines
- Models are the only files allowed to execute SQL queries.
- All queries must be parameterized to prevent SQL Injection.
- Models should return raw data or null. They should not throw HTTP errors.
- Use `pool.query()` exclusively for database connections.

## Database Guidelines
- **No ORM**: Continue using raw SQL via `mysql2` for maximum control and performance unless an architectural shift is explicitly planned.
- **Soft Deletes**: Use `is_deleted = TRUE` instead of hard `DELETE` statements for records like players.
- **Relationships**: Use `LEFT JOIN` when retrieving related optional data to prevent filtering out parent records.

## Validation Rules
- **Server-Side**: Use route-level middleware for schema/shape validation (rejecting with 400 Bad Request) before it hits the controller. 
  - *(Recommendation)*: Adopt a schema validation library like `Joi` or `Zod`.
- **Client-Side**: Forms must have HTML5 validation or manual state-based validation before triggering API calls.

## Authentication Rules
- **Passwords**: Must ALWAYS be hashed using `bcrypt` before storage. Never log or return passwords in API responses.
- **Tokens**: Use JSON Web Tokens (JWT). Verify JWTs exclusively in `authMiddleware`.
- **Protected Routes**: Wrap protected API endpoints with `authMiddleware`.
- **Frontend Storage**: Persist JWTs securely. Use Axios interceptors to inject the Bearer token into all requests.

## Error Handling
- **Backend**: Never send raw stack traces to the client. The Global Error Handler middleware MUST intercept all downstream errors, parsing the `.status` property or falling back to 500, and sending a uniform `{ success: false, message: ... }` response.
- **Frontend**: Catch Axios errors and map them to user-friendly UI notifications (e.g., Toast notifications or inline form errors).

## Logging
- Use a dedicated logger middleware to track incoming HTTP requests (Method, URL, Status, Response Time).
- *(Recommendation)*: Integrate a robust logging library like `Winston` or `Pino` to handle different log levels (info, warn, error) and log persistence.

## API Design
- Adhere strictly to RESTful resource naming (e.g., `GET /api/players`, `POST /api/players`, `PUT /api/players/:id`).
- Use plural nouns for endpoints.
- Paginated endpoints must return metadata alongside the data: `page`, `limit`, `total`, `totalPages`.

## State Management
- **Server State**: Use React Query (`@tanstack/react-query`) for all data fetching, caching, and background syncing. Do not use `useEffect` + `useState` for API data.
- **Local State**: Use `useState` for simple component-level states (e.g., modal visibility, form inputs).
- **URL State**: Crucial filter states (e.g., search queries, pagination, selected teams) should be synced to URL Search Parameters to enable deep-linking and browser history navigation.

## Performance Guidelines
- **Database**: When paginating with complex filters, perform a separate `COUNT(*)` query first to get total records before applying `LIMIT` and `OFFSET`.
- **Frontend**: Use memoization (`useMemo`, `useCallback`) only when necessary for expensive calculations or preventing unnecessary re-renders of heavy child components.

## Security Practices
- Rate limiting must remain active on `/api` routes to prevent DDoS and brute-force attacks.
- Ensure `Helmet` is active to secure HTTP headers.
- Never expose environment variables (`.env`) in version control.

## Code Reusability
- Extract common logic into helper functions inside the `utils/` folder (e.g., `formatDate`, `getInitials`).
- Build reusable UI components (e.g., custom Modals, Inputs, Buttons) rather than duplicating HTML/Tailwind classes.

## Testing Expectations
- *(Recommendation)*: Adopt Jest and Supertest for backend integration/unit testing of Services and Controllers.
- *(Recommendation)*: Adopt React Testing Library for frontend component testing.
- Test edge cases, specifically validation rejections and business rule conflicts (e.g., duplicate emails).

## Refactoring Rules
- Do not introduce breaking changes to the REST API without versioning (e.g., moving to `/api/v2/`).
- When modifying shared components or models, verify that the changes do not break other dependent modules.

## Things That Must Never Be Done
- **NEVER** write raw SQL without `?` parameterization. String concatenation in SQL is strictly forbidden.
- **NEVER** place database queries directly inside Controllers.
- **NEVER** access `localStorage` directly inside JSX renders; use a hook or utility function safely.
- **NEVER** commit secrets, passwords, or `.env` files to the repository.
- **NEVER** use `any` in TypeScript unless absolutely necessary for an external library workaround. Always define precise types or interfaces.
