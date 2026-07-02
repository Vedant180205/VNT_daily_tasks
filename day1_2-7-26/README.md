# Day 1: Internal Diagnostics Page (Full-Stack Deep Dive)

## 🚀 Mission Overview

The goal of Day 1 was to build a robust, full-stack **Internal Diagnostics Page** to monitor application health (API, Database, and Environment status). 

More importantly, this project served as a deep dive into establishing a clean architectural foundation, setting up a React frontend with Vite, connecting a MySQL database, and writing automated tests in Node.js.

---

## 🧠 Architectural Philosophy (Backend)

We started with a single `server.js` file and refactored it into a structured **MVC (Model-View-Controller)** pattern. This structure ensures scalability. 

Here is the mental model (The "Car" Analogy) used to understand the flow:
* **`server.js`**: The ignition key. It takes the app and binds it to a port (e.g., 3000) to start listening for HTTP requests.
* **`app.js`**: The chassis/factory. Configures the Express app (adds JSON parsing, connects the routers).
* **`routes/status.routes.js`**: The GPS map. It dictates that requests starting with `/api/internal/status` should go to a specific controller.
* **`controllers/status.controller.js`**: The driver. It contains the business logic, handles the request, and orchestrates the response.
* **`services/db.service.js`**: The mechanic. Handles the heavy lifting of database communication.

### Request Lifecycle
When a user visits `http://localhost:3000/api/internal/status`:
1. **Server** receives the request.
2. **Express App (`app.js`)** checks the URL.
3. **Router** matches `/api/internal/status` and calls the controller.
4. **Controller** asks the **Service** (`db.service.js`) to check the database.
5. Controller reads environment variables (`NODE_ENV`) and an in-memory timestamp variable.
6. Controller packages this into a JSON object and sends it back (`res.json()`).

### Important Backend Concepts
* **Connection Pooling:** Instead of establishing a single database connection, we use `pool.getConnection()`. We execute a lightweight health check (`SELECT 1 + 1 AS result`), and critically, we call `connection.release()` to return the connection to the pool to prevent resource exhaustion.
* **In-Memory State:** We used a global variable `let lastSuccessfulApiResponseAt = null;` within the controller module. Since Node.js caches modules, this variable persists across requests, acting as a sticky note that remembers the time of the last successful ping.
* **Environment Injection:** We rely on `.env` files. Notably, when running our automated tests (Jest), Jest automatically injects `NODE_ENV=test` behind the scenes, allowing the app to be environment-aware.

---

## 🎨 Frontend Construction (Stage-by-Stage)

The frontend was built from scratch using Vite, React, and TypeScript. We followed a strict stage-by-stage progression:

### Stage 1: Routing & Proxying
* Installed `react-router-dom` to handle navigation.
* **Crucial Step:** Configured `vite.config.ts` to proxy `/api` requests to `http://localhost:3000`. This bypasses CORS issues and allows the frontend to speak seamlessly to the backend.

### Stage 2: Types & API Client
* Defined strict TypeScript interfaces (`StatusResponse`) to represent the exact JSON structure expected from the backend.
* Created a dedicated API client (`statusApi.ts`) utilizing the native `fetch` API, throwing specific errors if the HTTP response isn't `ok`.

### Stage 3 & 4: UI & State Management
* Built a static UI first using mock data.
* Introduced `useState` and `useEffect` to fetch real data on component mount.
* Implemented robust state handling for **Loading**, **Error**, and **Success** states, ensuring the UI never breaks unexpectedly.

### Stage 5 & 6: Polish
* Added an interactive **Refresh** button that disables itself during loading states.
* Refactored inline styles into **CSS Modules** (`InternalStatus.module.css`) to prevent style collisions and achieve a clean, professional, card-based UI with dynamic status badges (Green for `ok`, Red for `error`).

---

## 🛠️ Debugging & Troubleshooting

During development, we encountered and solved several critical errors. Here is a quick reference guide:

| Error Symptom | Technical Meaning | How to Fix It |
| :--- | :--- | :--- |
| **502 Bad Gateway** | The Vite frontend proxy tried to forward the request, but the backend at `localhost:3000` didn't respond. | Ensure the backend is actually running (`node server.js`). If it crashed, check the terminal logs. |
| **ECONNREFUSED** | The Node.js backend cannot reach the MySQL database on port 3306. | Start MySQL (via XAMPP/WAMP) and verify your `.env` credentials are correct. |
| **ER_ACCESS_DENIED** | MySQL rejected the connection. | Check your `DB_USER` and `DB_PASSWORD` in the backend `.env` file. |
| **404 Not Found** | The proxy might be pointing to the wrong port, or the route doesn't exist. | Verify `server.js` port matches the target in `vite.config.ts`. |

---

## 🚀 How to Run

1. **Database:** Ensure MySQL is running.
2. **Backend:** 
   ```bash
   cd backend
   npm install
   # Ensure .env is set up
   node server.js
   ```
3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. **Visit:** Open [http://localhost:5173/internal/status](http://localhost:5173/internal/status) in your browser.

> [!NOTE]
> For the complete, unedited step-by-step tutorial, raw code snippets, and in-depth concept comparisons (like Express vs FastAPI), please refer to the original [doc.md](./doc.md).
