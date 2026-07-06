# Project Overview

This repository contains the Player Management System, a full-stack application engineered to handle the creation, reading, updating, and deletion (CRUD) of player records and their associated teams. 

This project extends a foundational CRUD application by introducing secure authentication, authorization, relational database design, secure APIs, advanced filtering capabilities, centralized error handling, automated API testing environments, and seamless frontend integration. It serves as a technical implementation report fulfilling all assignment requirements.

---

# Assignment Objectives

The primary objectives of this assignment were to successfully implement and demonstrate:

1. Secure Authentication utilizing JSON Web Tokens (JWT) and bcrypt password hashing.
2. Robust Authorization guarding sensitive API endpoints.
3. API Security best practices.
4. Relational Database Design mapping One-to-Many entity relationships.
5. Advanced SQL Querying including dynamic filtering, pagination, and JOIN operations.
6. Centralized Error Handling architecture.
7. Frontend Integration of authentication and complex URL-state filtering.

---

# Technology Stack

**Backend**
- Node.js (Runtime Environment)
- Express.js (Web Framework)

**Frontend**
- React (Component Architecture)
- TypeScript (Static Typing)
- Vite (Build Tooling)
- React Query (Server State Management)
- Axios (HTTP Client)

**Database**
- MySQL (Relational Database Management System)

**Authentication**
- JSON Web Tokens (JWT)
- bcrypt (Cryptographic Hashing)

**API Testing**
- Postman (Automated Environment Variables & Collections)

---

# Project Architecture

## Backend Architecture

The backend strictly adheres to a Layered (N-Tier) Architecture, ensuring high cohesion and low coupling.

```text
HTTP Request
     ↓
[ Routes ]          -> Maps HTTP verbs and endpoints to specific controllers.
     ↓
[ Controllers ]     -> Handles HTTP requests, extracts parameters, and delegates to services.
     ↓
[ Services ]        -> Encapsulates core business logic and validation rules.
     ↓
[ Models ]          -> Executes parameterized SQL queries against the database.
     ↓
   MySQL
```

## Frontend Architecture

The frontend utilizes a component-based architecture with separated state and API layers.

```text
[ Pages ]           -> Top-level views orchestrating layouts and URL state.
     ↓
[ Components ]      -> Reusable UI elements (Forms, Dialogs, Tables).
     ↓
[ Hooks ]           -> React Query data fetching and caching logic.
     ↓
[ API Layer ]       -> Axios interceptors attaching authorization headers.
```

---

# Database Design

The relational schema consists of three normalized tables.

### `users`
Handles authentication credentials.
- `id` (Primary Key, INT, Auto Increment)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)

### `teams`
Represents the sports teams.
- `id` (Primary Key, INT, Auto Increment)
- `name` (VARCHAR, Unique)

### `players`
Represents individual players and their team association.
- `id` (Primary Key, INT, Auto Increment)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `phone` (VARCHAR)
- `team_id` (Foreign Key referencing `teams.id`, Nullable)

### Relational Mapping
- **One-to-Many**: One Team can have many Players.
- **Normalization**: Ensures `team_name` is strictly maintained in the `teams` table, utilizing a `LEFT JOIN` on `team_id` to retrieve relational data without redundancy.

---

# Assignment Requirement Mapping

## Task 1: Authentication

**Requirement:** Implement Registration, Login, and Me endpoints using JWT and bcrypt.
**Implementation:** 
- `POST /api/auth/register` accepts user credentials, hashes the password via `bcrypt`, and persists the user.
- `POST /api/auth/login` verifies the password via `bcrypt.compare`. Upon success, it issues a signed JWT.
- Responses strip the password payload completely.
- Implemented HTTP 409 for duplicate emails and HTTP 401 for invalid credentials.
- `authMiddleware` validates incoming JWTs and attaches the decoded payload to `req.user`.

## Task 2: Protect APIs

**Requirement:** Secure mutating player routes.
**Implementation:** The `authMiddleware` was bound to `POST /api/players`, `PUT /api/players/:id`, and `DELETE /api/players/:id`. Any request lacking a valid `Authorization: Bearer <token>` header is rejected at the route level before reaching the controller.

## Task 3: Database Relationship

**Requirement:** Implement `teams` table and associate players.
**Implementation:** 
- Created the `teams` table and modified `players` to include a `team_id` Foreign Key.
- Created `GET` and `POST` endpoints for `/api/teams`.
- Updated the `getAllPlayers` model to execute a `LEFT JOIN teams ON players.team_id = teams.id`. `LEFT JOIN` was explicitly chosen to ensure players without an assigned team (Free Agents) are not excluded from the dataset.

## Task 4: Advanced Filtering

**Requirement:** Implement Search, Pagination, Total Count, Team, and Date filters.
**Implementation:** 
- The `playerService` extracts query parameters and safely maps them to a dynamic `WHERE` clause generator.
- Search queries check both `name` and `email` using `LIKE`.
- Date filters apply an exact match to `DATE(players.created_at)`.
- A separate `COUNT(*)` query executes utilizing the exact same dynamic `WHERE` parameters to accurately return the `total` records before `LIMIT` and `OFFSET` pagination rules are applied.

## Task 5: Global Error Handler

**Requirement:** Centralize error responses.
**Implementation:** Created an Express error-handling middleware (`errorHandler.js`). Every controller wraps logic in a `try/catch` block, passing caught errors to `next(error)`. The Global Error Handler parses `error.statusCode` and guarantees a uniform JSON response structure.

## Task 6: Advanced Postman

**Requirement:** Automate testing environment.
**Implementation:** The Postman Collection leverages environment variables (`{{base_url}}`, `{{jwt_token}}`). A post-response script on the Login endpoint automatically captures the returned JWT and stores it in the environment variable. The Collection folder is configured to inject the Bearer token into all protected routes automatically.

## Task 7: Frontend Integration

**Requirement:** Build UI for authentication and filtering.
**Implementation:** 
- Created `LoginPage` and `RegisterPage`.
- Implemented a `<ProtectedRoute>` wrapper that verifies authentication state.
- Configured global Axios Interceptors to attach the JWT from `localStorage` to all outgoing requests.
- Added Team and Date filters to the `Toolbar`, syncing their state directly to URL Search Parameters for deep-linking.

---

# API Documentation

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| POST | `/api/auth/register` | Creates a new user account. | No |
| POST | `/api/auth/login` | Authenticates user and returns JWT. | No |
| GET | `/api/auth/me` | Returns current authenticated user profile. | Yes |
| GET | `/api/players` | Retrieves paginated and filtered players. | No |
| POST | `/api/players` | Creates a new player record. | Yes |
| PUT | `/api/players/:id` | Updates an existing player record. | Yes |
| DELETE | `/api/players/:id` | Soft-deletes a player record. | Yes |
| GET | `/api/teams` | Retrieves all available teams. | No |
| POST | `/api/teams` | Creates a new team record. | Yes |

---

# Authentication Flow

```text
[ Client ]                        [ Server ]
    |                                 |
    |------- POST /api/auth/login --->| (Validates credentials via bcrypt)
    |                                 |
    |<------- Returns signed JWT -----|
    |                                 |
[ Stores JWT in localStorage ]        |
    |                                 |
    |--- Request + Bearer Token ----->|
    |                                 |
    |                           [ authMiddleware ] (Verifies Token)
    |                                 |
    |                           [ Controller ]
    |                                 |
    |<------- 200 OK + Data ----------|
```

---

# Database Relationship Flow

```text
[ teams table ]                 [ players table ]
+----+-----------+              +----+--------+---------+
| id | name      |              | id | name   | team_id |
+----+-----------+              +----+--------+---------+
| 1  | India     | <----------- | 1  | Vedant | 1       |
| 2  | Australia |              | 2  | Aarav  | NULL    |
+----+-----------+              +----+--------+---------+
                            (LEFT JOIN ensures Aarav is retrieved)
```

---

# Filtering System

The filtering system dynamically constructs parameterized SQL queries based on active HTTP Request properties.

- **Search**: `(players.name LIKE ? OR players.email LIKE ?)`
- **Team**: `players.team_id = ?`
- **Date**: `DATE(players.created_at) = ?`
- **Sorting**: `ORDER BY {whitelisted_column} {ASC|DESC}`
- **Pagination**: `LIMIT ? OFFSET ?`

The `COUNT(*)` query executes prior to pagination constraints to determine absolute dataset size.

---

# Error Handling

Errors are managed systematically across layers:
1. **Validation Errors**: Rejected gracefully with `400 Bad Request`.
2. **Service Errors**: Business rules (e.g., duplicate email) throw specific errors with attached status codes (`409 Conflict`).
3. **Controller Catch**: `catch (error) { next(error); }`
4. **Global Handler**: The final middleware intercepts the error, applying fallback status codes (`500`) if undefined, and formats a consistent JSON payload preventing server crashes or stack trace leaks.

---

# Frontend Features

- **Authentication UI**: Dedicated forms for Registration and Login featuring loading states and inline error mapping.
- **Session Persistence**: React hooks interact with `localStorage` to survive browser refreshes.
- **Protected Routing**: Unauthorized attempts to access `/players` forcibly redirect to `/login`.
- **Axios Interceptors**: Completely abstracts token management away from component logic.
- **Relational UI**: Player creation/editing forms feature dynamic `<select>` dropdowns hydrated by `GET /api/teams`.
- **Advanced Toolbar**: Team dropdown and Date picker sync continuously with the URL query parameters.

---

# Postman Features

- Organizes endpoints hierarchically.
- Abstracts `http://localhost:3000` into `{{base_url}}`.
- Automates JWT assignment via the Tests tab:
  `pm.environment.set("jwt_token", pm.response.json().token);`
- Injects JWT universally across the Collection via the Authorization configuration tab.

---

# Security Measures

- **bcrypt**: Ensures database breaches do not expose plain-text passwords.
- **JWT**: Stateless, cryptographically signed tokens prevent session tampering.
- **Parameterized SQL**: Prevents SQL Injection attacks globally.
- **Environment Variables**: Keeps secrets (`JWT_SECRET`, database credentials) entirely out of source control.
- **Protected Routes**: Enforces strict endpoint authorization.
- **Centralized Error Handling**: Prevents arbitrary stack traces from exposing backend paths to the client.

---

# Folder Structure

```text
Project Root
├── backend/
│   ├── migrations/         # SQL Schema modifications
│   ├── postman/            # Exported API Collections
│   ├── src/
│   │   ├── controllers/    # Request handling
│   │   ├── middleware/     # Global and Route middlewares
│   │   ├── models/         # Database execution
│   │   ├── routes/         # Endpoint definitions
│   │   ├── services/       # Business logic
│   │   └── app.js          # Express initialization
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/            # Axios instance and API definitions
    │   ├── components/     # React UI components
    │   ├── hooks/          # React Query state management
    │   ├── pages/          # Top-level route views
    │   ├── types/          # TypeScript interfaces
    │   ├── utils/          # Helper logic (localStorage)
    │   ├── App.tsx         # Route orchestrator
    │   └── main.tsx
    └── package.json
```

---

# Installation

### 1. Database Setup
Create a MySQL database and execute the `.sql` files located in `backend/migrations/` in sequential order to build the schema.

### 2. Environment Variables
Navigate to the `backend/` directory. Copy `.env.example` to `.env` and configure your database credentials and `JWT_SECRET`.

### 3. Backend Execution
```bash
cd backend
npm install
npm run dev
```

### 4. Frontend Execution
```bash
cd frontend
npm install
npm run dev
```

---

# Testing

Manual Quality Assurance (QA) verifies the integrity of the implementation.

- **Authentication**: Register with an existing email to verify HTTP 409. Login with invalid credentials to verify HTTP 401.
- **Authorization**: Attempt to execute `DELETE /api/players/1` via Postman without a token to verify HTTP 401.
- **Filtering**: Apply Search, Team, Date, and Pagination simultaneously to ensure WHERE clauses stack correctly without SQL syntax errors.
- **Frontend Interceptors**: Interact with the frontend, clear the token from `localStorage` manually, and click a button. Ensure the application intercepts the 401 and forcibly redirects to the login view.

---

# Assignment Completion Summary

- [x] Task 1: Authentication Endpoints & Logic
- [x] Task 2: Protected API Routes
- [x] Task 3: Database Relationships & JOINs
- [x] Task 4: Advanced Filtering & Total Counts
- [x] Task 5: Global Error Handler Middleware
- [x] Task 6: Advanced Postman Collection Automation
- [x] Task 7: Complete Frontend Integration

---

# Key Learnings

This implementation significantly reinforced core Backend and Full-Stack Engineering principles:
- **Layered Architecture**: Demonstrates the absolute necessity of separating HTTP logic from Business Logic and Database Execution for maintainability.
- **Relational Databases**: Solidified understanding of Foreign Keys and the critical distinction between `INNER JOIN` and `LEFT JOIN`.
- **API Security**: Illustrated how stateless JWTs secure per-request architecture securely.
- **SQL Optimization**: Highlighted the efficiency of parameterized queries and separate `COUNT` executions for complex pagination.
- **Error Handling**: Proven the value of centralized `next(error)` propagation over scattered `res.status().send()` calls.
