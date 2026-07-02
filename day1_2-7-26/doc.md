# Internal Diagnostics Page - Full Development Log

## 1. The Goal and The Concept

For my first daily mission, my objective was to build a full-stack **Internal Diagnostics Page**. This application needed to monitor its own API, verify database connectivity, and report the current environment status. 

Before diving into the code, I took a moment to map the concepts I was already familiar with in Python (FastAPI) to the Node.js (Express) ecosystem. Translating these core principles helped me structure the backend efficiently:

| Concept | FastAPI (Python) | Express (Node.js) |
| :--- | :--- | :--- |
| **The App** | `app = FastAPI()` | `const app = express();` |
| **Route definition** | `@app.get("/path")` | `app.get("/path", handlerFunction)` |
| **The handler** | `def handler(): return dict` | `(req, res) => { res.json({}) }` |
| **JSON response** | `return {"key": "value"}` | `res.json({ key: "value" })` |
| **Error handling** | `raise HTTPException` | `res.status(500).json({ error: "..." })` |
| **Path params** | `@app.get("/{id}")` | `app.get("/:id")` |
| **Request body** | `body: Model` | `req.body` *(needs middleware `express.json()`)* |
| **Async** | `async def` | `async (req, res) => { ... }` |

### 🧠 The Big Picture (Backend Architecture)
To keep things scalable, I decided to use the MVC (Model-View-Controller) pattern. I used a "Car Analogy" to help me understand how a request flows through the server:

1. **`server.js` (The Ignition Key):** It takes the app and binds it to a port (e.g., 3000). It just starts the engine and listens for traffic.
2. **`app.js` (The Chassis):** Configures the Express app, adds JSON parsing middleware, and connects the routers.
3. **`routes/*.js` (The GPS Map):** Dictates that requests starting with `/api/internal/status` should go to a specific controller.
4. **`controllers/*.js` (The Driver):** Contains the business logic. It handles the request, orchestrates checking the database, and sends the response.
5. **`services/*.js` (The Mechanic):** Handles the heavy lifting of communicating with the database.

When a user visits `http://localhost:3000/api/internal/status`, the request hits `server.js` → `app.js` → matches the route in `status.routes.js` → triggers the `status.controller.js` → which asks `db.service.js` to check the database → and finally returns the JSON object.

---

## 2. Backend Construction

### Step 1: Starting Fresh
I started by cleaning up the existing directory. I removed the old `package.json` files and ran `npm init -y` in the backend folder to create a clean, structured initialization.

Then, I installed the core packages:
```bash
npm install express mysql2 dotenv
```

### Step 2: The Initial Server
I wrote a simple `server.js` code to test the server, instantiate the Express app, assign port 3000, create a root route to display a message, and tell the server to listen. 

At first, I made a mistake where my `server.js` file was completely empty. I ran `node server.js` and Node.js executed the empty file and immediately exited back to the terminal with zero errors and zero output. Once I realized this, I populated it with the basic listening logic.

### Step 3: Database Integration
Next, I created the JSON response structure and the specific status route. I wanted to actively ping the MySQL database to ensure it was alive. 

Here is how the `checkDatabase()` function in my service works:
1. `pool.getConnection()`: Asks the database pool for a connection.
2. `connection.query('SELECT 1 + 1 AS result')`: The simplest possible query. If this succeeds, the database is healthy.
3. `connection.release()`: **Very important!** This returns the connection to the pool so it can be reused.

### Step 4: State Management
I needed to track the last time the API was successfully called. I added a global variable in my controller:
```javascript
let lastSuccessfulApiResponseAt = null;
```
Because Node.js caches modules via `require()`, this variable acts like a sticky note on the dashboard. It persists in memory across requests as long as the server is running, updating to the current timestamp on every successful response.

### Step 5: MVC Refactoring
Initially, everything was crammed into a single `server.js` file, which is unmaintainable. I split the logic into the folder structure we designed in the concept phase:

```text
backend/
├── .env
├── server.js                (entry point)
├── src/
│   ├── app.js               (Express app configuration)
│   ├── config/
│   │   └── db.config.js     (database pool setup)
│   ├── services/
│   │   └── db.service.js    (database health check logic)
│   ├── controllers/
│   │   └── status.controller.js (request handler logic)
│   └── routes/
│       └── status.routes.js (route definitions)
└── package.json
```

---

## 3. Frontend Construction (Vite + React)

With the backend running safely on port 3000, I moved to the frontend folder.

I deleted the entire old frontend folder and bootstrapped a fresh React TypeScript app using Vite:
```bash
npm create vite@latest . -- --template react-ts
```

### Stage 1: Routing & Proxy Configuration
I installed the router:
```bash
npm install react-router-dom
```
To ensure the frontend could talk to my backend without CORS issues, I updated `vite.config.ts` to proxy requests:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```
Then, I set up `BrowserRouter` in `App.tsx` pointing `/internal/status` to a minimal `InternalStatusPage` component.

### Stage 2: API Client & TypeScript Types
I defined a strict TypeScript interface `StatusResponse` to match my backend JSON exactly. Then, I created `src/api/statusApi.ts`:
```typescript
import { StatusResponse } from '../types/status.types';

export const getStatus = async (): Promise<StatusResponse> => {
  const response = await fetch('/api/internal/status');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};
```

### Stage 3: Static UI with Mock Data
Before wiring up the real data, I built the layout using hardcoded mock data to perfect the design visually.

### Stage 4: Fetching Real Data (Loading & Error States)
I replaced the mock data with a `useEffect` hook that called my `fetchStatus` function. I implemented robust state management:
- `loading`: Shows an hourglass "Loading status..." spinner.
- `error`: Catches any network failures and provides a "Retry" button.
- `data`: Renders the final UI.

### Stage 5: The Refresh Button
I added an interactive button to manually refetch data. It disables itself while `loading` is true and changes its text to "Refreshing...".

### Stage 6: Polish & CSS Modules
To make it look professional, I extracted all inline styles into `InternalStatus.module.css`. I added dynamic CSS classes for the status badges (`badgeOk` for green, `badgeError` for red) and created a helper function to cleanly format the ISO timestamps into readable strings (e.g., `Oct 24, 2026, 10:00 AM`).

---

## 4. Testing & Environment Variables

I wrote automated integration tests using Jest and Supertest. Here were my first test results:
```text
PS C:\Users\vedant\Desktop\VNT_tasks\day1_2-7-26\backend> npm test

> backend@1.0.0 test
> jest

  PASS  src/tests/status.test.js
  GET /api/internal/status
    √ should return 200 and the correct structure when DB is healthy (138 ms)
    √ should track the last successful response time across multiple calls (74 ms)
    √ should return database: "error" when DB connection fails (75 ms)

Test Suites: 1 passed, 1 total
```

However, I noticed a discrepancy. My endpoint was returning `environment: "test"` instead of `"local"`, even though my `.env` file had `NODE_ENV=development`. 

I learned that **Jest automatically injects `NODE_ENV=test` behind the scenes**. This is actually a great feature because it proves the app is environment-aware and can dynamically switch configurations (like connecting to a test database instead of production) based on the environment variables.

---

## 5. Troubleshooting & The Debugging Journey

During development, things didn't always go perfectly. Learning to debug these issues was a major part of the task.

### The 502 Bad Gateway Error
At one point, my frontend threw a **502 Bad Gateway** error in the browser network tab. At first, I panicked, but I realized this is actually a *good sign*. 
It meant the frontend proxy was working, but Vite's proxy **could not reach** the backend at `localhost:3000`.

**My Diagnostic Steps to fix 502:**
1. **Check if Backend is Running:** I realized I had closed the backend terminal! I simply navigated back and ran `node server.js`.
2. **Test Backend Directly:** I visited `http://localhost:3000/api/internal/status` directly to isolate if the issue was the backend server or the frontend proxy.
3. **Restart Both Servers:** Sometimes Vite's proxy gets stuck, so stopping both and restarting them cleanly fixes the linkage.

### Database Connection Errors
I also ran into backend terminal crashes:
- `Error: ER_ACCESS_DENIED_ERROR`: This meant my MySQL credentials in `.env` were wrong.
- `Error: connect ECONNREFUSED 127.0.0.1:3306`: This meant my MySQL server wasn't running at all. I had to open XAMPP and start the MySQL module.

### Final Summary of Errors
| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| **502 Bad Gateway** | Backend not running | Start backend: `node server.js` |
| **502 Bad Gateway** | Backend crashed | Check backend terminal for errors |
| **ECONNREFUSED** | MySQL not running | Start MySQL in XAMPP/WAMP |
| **404 Not Found** | Wrong port | Ensure `server.js` port matches Vite proxy |

By methodically checking these layers, debugging became second nature. The task was finally complete, resulting in a robust, tested, and beautifully styled full-stack feature!
