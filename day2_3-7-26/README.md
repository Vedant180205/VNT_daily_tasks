# Player Management Platform

A full-stack Player Management system complete with a RESTful backend API and a modern, responsive React dashboard.

This project was built to satisfy the complete assignment requirements for a Node.js + Express backend and a React + TypeScript frontend, fully adhering to the specified architecture and security standards.

---

## 🚀 Setup & Installation

### 1. Database Setup
The system uses **MySQL**.
1. Create a MySQL database (e.g. `players_db`) in your local MySQL instance.
2. Initialize the `players` table by running the provided SQL migration:
   - **Path:** `backend/migrations/001_create_players.sql`
   - You can execute this file manually in your SQL client or run `npm run migrate` inside the `backend/` directory.

### 2. Backend Setup
The backend API uses Node.js, Express, and `mysql2`.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables by copying `.env.example` to `.env`. Your `.env` file must include:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=password
   DB_NAME=players_db
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
The frontend uses React, TypeScript, Vite, TailwindCSS (v4), and React Query.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🛠 Features & Requirements Fulfilled

### Backend Rules & Architecture
- **Validation:** Name, Email, and Phone validation is strictly enforced in the *middleware* layer (`validatePlayer.js`).
- **Conflict Handling:** Duplicate emails are gracefully caught by the service layer, returning a `409 Conflict`.
- **404 Handling:** Requests for non-existent players correctly return a `404 Not Found`.
- **Standardized Errors:** Every API error (including 404s and 409s) strictly returns the exact requested JSON format: `{ "success": false, "message": "..." }`.
- **Custom Logging:** The `logger.js` middleware effectively prints `Method | URL | Status | Response time ms` for every single request.
- **Environment config:** Handled entirely via the `.env` file.
- **SQL Migration:** Present in `migrations/001_create_players.sql`.

### Frontend Requirements
The `/players` dashboard includes:
- ✅ **Player List**: Displays all players cleanly as a list view.
- ✅ **Search & Filter**: Real-time debounce search, limit controls, and sorting functionality.
- ✅ **Pagination**: Advanced pagination synced perfectly with the URL search parameters.
- ✅ **Create/Edit/Delete**: Accessible modal dialogues powered by Radix UI for all CRUD actions.
- ✅ **States**: Handled loading (skeletons), empty, and error states gracefully.

### Security & Bonus Features
- **Rate Limiting:** Integrated `express-rate-limit` to prevent brute force and API spam (100 reqs / 15 min).
- **Helmet:** Protects the application by securing standard HTTP headers.
- **CORS:** Fully configured to whitelist Cross-Origin Resource Sharing.

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/players` | Creates a new player (validates fields + email uniqueness). |
| `GET` | `/api/players` | Retrieves all players. Supports query params: `?page=1&limit=10&search=vedant&sort=name&order=asc`. |
| `GET` | `/api/players/:id` | Retrieves a single player by their ID. |
| `PUT` | `/api/players/:id` | Updates an existing player's details. |
| `DELETE`| `/api/players/:id` | Performs a **soft delete** by updating the `is_deleted` boolean flag in the database without destroying the record. |

---

## 🧪 Postman Collection

For easy testing, two files are included in the `postman/` directory at the root of the project:
1. **`Collection.json`**: Contains all 5 configured API requests (GET, POST, PUT, DELETE).
2. **`Environment.json`**: Pre-configured environment variable setting `base_url` to `http://localhost:3000`.

*Simply import both files into your Postman client, select the `Player Management API Env` environment in the top right corner, and click Send!*
