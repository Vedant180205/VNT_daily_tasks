Concept	FastAPI (Python)	Express (Node.js)
The App	app = FastAPI()	const app = express();
Route definition	@app.get("/path")	app.get("/path", handlerFunction)
The handler	def handler(): return dict	(req, res) => { res.json({}) }
JSON response	return {"key": "value"}	res.json({ key: "value" })
Error handling	raise HTTPException	res.status(500).json({ error: "..." })
Path params	@app.get("/{id}")	app.get("/:id")
Request body	body: Model	req.body (needs middleware express.json())
Async	async def	async (req, res) => { ... } (works the same)
Now, let’s break down exactly what we are building on the backend, why we need each file, and what it does.

🧠 The Big Picture (Backend)
When you visit http://localhost:3000/api/internal/status in your browser, here is the journey the request takes:

Server (listening on port 3000) receives the request.

Express App (app.js) looks at the URL and says: "Does this match any route?"

Router (routes/status.routes.js) says: "Yes! /api/internal/status matches. Call the controller."

Controller (controllers/status.controller.js) runs:

It asks the Service (services/db.service.js) to check the database.

It looks at the environment variable (NODE_ENV).

It reads the in-memory variable storing the last successful call time.

It puts all this into a JavaScript object.

Controller sends the object back as JSON using res.json().

📁 Understanding the Backend Files (Why each exists)
Let's look at the files we created and understand their purpose:

File	Role (in plain English)	FastAPI Equivalent
server.js	The ignition key. Starts the engine (server) and makes it listen for network traffic.	uvicorn.run(app)
src/app.js	The factory/blueprint. Configures the app (adds JSON parsing, connects routes, etc.).	app = FastAPI() + middleware setup
src/routes/status.routes.js	The map. Says "If URL is /status, use this function".	@app.get("/status")
src/controllers/status.controller.js	The brain. Contains the actual logic for what to do when the route is hit.	The def function under the decorator
src/services/db.service.js	The worker. Handles all database communication. Controller asks it "Is DB alive?" and it does the heavy lifting.	A separate helper function you import
src/config/db.config.js	The settings. Stores database connection strings.	DATABASE_URL in .env (FastAPI does this too)
src/tests/status.test.js	The inspector. Automatically checks if the route works.	client.get("/status") in pytest
🔨 Stage-by-Stage Backend Build (Explained)
Stage 1: The Entry Point (server.js)
Purpose: Without this, your code is just a script. This is what actually runs.

What it does:

Imports your app from app.js.

Takes the app and binds it to a port (e.g., 3000).

Tells Node.js to start listening for HTTP requests.

Why we separate server.js and app.js:

When we write tests, we want to import app to test the routes, but we do NOT want to automatically start listening on a port (because tests run in memory). By keeping app.js separate from server.js, tests can import app safely without opening a network port.

Stage 2: The App Factory (app.js)
Purpose: This is your main Express application.

What it does:

Creates the Express app: const app = express();

Adds middleware. Middleware is just a function that runs before your routes. We add express.json() so that if the frontend sends JSON data, Express knows how to parse it (like pydantic in FastAPI, but manual).

Imports the router (status.routes.js) and tells the app: "Any request starting with /api/internal should go to this router."

Stage 3: The Router (routes/status.routes.js)
Purpose: To organize URLs.

What it does:

Creates a Router object (like APIRouter() in FastAPI).

Defines router.get('/status', statusController.getStatus).

This maps GET /api/internal/status to the getStatus function inside the controller.

Why use a Router?
If you have 10 endpoints for "Users" (/users, /users/:id), you put them in one router file. If you have 10 for "Products", you put them in another. This keeps app.js clean.

Stage 4: The Controller (controllers/status.controller.js)
Purpose: This is where your business logic for this specific endpoint lives.

What it does:

Defines a variable outside the function:

javascript
let lastSuccessfulApiResponseAt = null;
In Node.js, require() caches the module. So this variable persists across requests. It acts like a global variable that stays in memory as long as the server is running. When the server restarts, it resets to null.

The getStatus function:

It is async, so we can await the database check.

It tries to check the DB: const dbOk = await dbService.checkConnection();

It builds a response object:

javascript
const status = {
  api: 'ok',                              // We reached this code, so API is running.
  database: dbOk ? 'ok' : 'error',        // Result from DB service.
  environment: process.env.NODE_ENV || 'local', // Read from environment.
  timestamp: new Date().toISOString(),    // Current time.
  lastSuccessfulApiResponseAt: lastSuccessfulApiResponseAt // The tracked value.
};
Crucially, after building the object but before sending, it updates the tracked variable:

javascript
lastSuccessfulApiResponseAt = new Date().toISOString();
Wait. If we update it before sending, the current request's lastSuccessful... will show the time of the previous request (which is what we want, as per spec: null on first call, then timestamp of previous call).
Actually, think about it:

Request 1: Variable is null. Build response with null. Then update variable to Time 1.

Request 2: Variable is Time 1. Build response with Time 1. Then update variable to Time 2.

Finally, it sends the response: res.json(status);

If anything fails (DB throws error), it catches it, sends a 500 status, but still tries to return a meaningful JSON.

Stage 5: The Service (services/db.service.js)
Purpose: To abstract away the database logic.

What it does:

Contains a function checkConnection().

Inside, it would try to connect to the database and run a simple SELECT 1.

It returns true if successful, or throws an error if not.

Why abstract this?

If you change databases (e.g., from PostgreSQL to MySQL), you only change this file. The Controller doesn't care how it checks, just if it works.

Stage 6: The Test (tests/status.test.js)
Purpose: To automatically verify our endpoint does what we expect.

What it does:

Imports app from app.js (not server.js, so it doesn't listen on a port).

Uses a library called supertest to simulate HTTP requests in memory.

It makes a GET request to /api/internal/status.

It checks:

Did we get a 200 status?

Does the body have api, database, environment, etc.?

Is timestamp a valid-looking date?

🔄 What happens when you run this?
You type npm start (or node server.js).

server.js runs, loads app.js, and starts listening on port 3000.

You open browser to http://localhost:3000/api/internal/status.

Request hits app.js → goes to routes/status.routes.js → calls controller.getStatus.

Controller asks Service to check DB.

Controller builds the JSON.

Controller updates the in-memory timer.

Controller sends JSON to your browser.

🧩 Summary for Your Brain
server.js: Ignites the engine.

app.js: Builds the chassis and connects the GPS (routes).

routes/*.js: The GPS map.

controllers/*.js: The driver (executes the plan).

services/*.js: The mechanic (handles the heavy machinery like DB).

Global variable in controller: A sticky note on the dashboard that remembers the time of the last successful trip.


now what i did is, removed the package.json files from the folder and run the command npm init -y in frontend and the backend and it created a structured package.json file.

i deleted the entire folder of the  frontend and ran a command "npm create vite@latest . -- --template react-ts" in frontend which automatically does the setup for us with the vite

Perfect! You’re in a great spot. You installed Express successfully, and node server.js ran with zero errors – but also zero output.

That happened because your server.js file is completely empty (created by the Python script). Node.js executed an empty file and immediately exited back to the terminal. No error, no logs, nothing.

written simple server.js ka code to test server, like creating server app, asigning port, created a route to root page, display message, at the end make the server to listen to port 3000

then created the json response structure and the specific route.
then added a variable to get the latest time stamp, by default value null, on every successfull response the value of the variable is updated with the current timestamp. and the response is sent to the frontend.

downloaded my sql driver for connection
npm install mysql2 dotenv
updated the server.js

🔬 Let's understand what's happening
The checkDatabase() function
pool.getConnection() – asks the pool for a connection. If no connections are available, it waits.

connection.query('SELECT 1 + 1 AS result') – the simplest possible query. If this succeeds, the database is alive.

connection.release() – very important! Returns the connection to the pool so it can be reused.

If anything fails (wrong password, DB down, table missing), it catches the error, logs it, and returns false.

The route handler
It's now async because we await checkDatabase().

If dbOk is true, we set database: 'ok'; otherwise 'error'.

We still update lastSuccessfulApiResponseAt after sending the response.

If something unexpected breaks, we send a 500 with a fallback JSON.

Environment variables
process.env.DB_HOST etc. come from your .env file.

If a variable isn't set, we provide a default (e.g., 'localhost', 'root'). This makes the app resilient.



did the restructuring
Currently, everything is crammed into a single server.js file. In production, this becomes unmaintainable. We'll split it into separate files based on responsibility:

text
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
🔍 Why this structure?
File	Responsibility	Why separate?
server.js	Starts the server.	Only one line of code – just app.listen(). Keeps it simple.
app.js	Configures the Express app (middleware, routes).	Tests can import app without starting a server.
config/db.config.js	Creates the database pool.	Centralizes DB config – if we change DB, only this file changes.
services/db.service.js	Contains the checkDatabase() function.	Separates business logic from routing. Easy to test independently.
controllers/status.controller.js	Handles the request/response for /status.	Keeps route files clean; easier to add more endpoints later.
routes/status.routes.js	Defines GET /status and maps it to the controller.	If we add 10 endpoints, each route file stays focused.

moved to frontend

installed npm install react-router-dom
Here’s the **complete frontend build** from scratch, with **copy‑paste‑ready code blocks** for every stage.  

We’ll start at **Stage 1** and go all the way to a polished page.

---

## 🛠️ Prerequisite (One‑Time Setup)

Make sure your **backend** is running in a separate terminal:

```bash
cd backend
node server.js
```

Keep it running – the frontend will call it.

---

## 🚀 Stage 1: Routing & Basic Page

### Step 1.1: Install React Router

In your `frontend/` folder:

```bash
npm install react-router-dom
```

### Step 1.2: Configure Vite Proxy (so frontend can call backend)

Update `frontend/vite.config.ts`:

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

**Why**: This forwards any frontend request starting with `/api` to your backend on port 3000. You won’t need CORS or absolute URLs.

### Step 1.3: Set Up the Router

Replace `frontend/src/App.tsx` with:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InternalStatusPage from './pages/InternalStatus/InternalStatusPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/internal/status" element={<InternalStatusPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Step 1.4: Create a Minimal Page Component

Replace `frontend/src/pages/InternalStatus/InternalStatusPage.tsx` with:

```tsx
const InternalStatusPage = () => {
  return <h1>Hello from Status Page!</h1>;
};

export default InternalStatusPage;
```

### Step 1.5: Run and Test

```bash
cd frontend
npm run dev
```

Visit: `http://localhost:5173/internal/status`

**Expected**: You see “Hello from Status Page!”.

✅ **Stage 1 complete.**  

---

## 🚀 Stage 2: API Client + TypeScript Types

### Step 2.1: Define the Response Type

Create `frontend/src/types/status.types.ts`:

```typescript
export interface StatusResponse {
  api: string;
  database: string;
  environment: string;
  timestamp: string;        // ISO date string, e.g., "2026-07-02T10:00:00Z"
  lastSuccessfulApiResponseAt: string | null;
}
```

### Step 2.2: Create the API Client

Create `frontend/src/api/statusApi.ts`:

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

**What this does**:  
- Calls the proxied backend endpoint.  
- Throws if the response is not OK (e.g., 500).  
- Returns typed JSON.

✅ **Stage 2 complete.**  

---

## 🎨 Stage 3: Static UI Structure (with Mock Data)

We’ll build the layout using **hardcoded** data – so we can see the design before connecting to the backend.

Replace `frontend/src/pages/InternalStatus/InternalStatusPage.tsx` with:

```tsx
import { StatusResponse } from '../../types/status.types';

// TEMPORARY: hardcoded data to design the UI
const mockData: StatusResponse = {
  api: 'ok',
  database: 'ok',
  environment: 'local',
  timestamp: new Date().toISOString(),
  lastSuccessfulApiResponseAt: null,
};

const InternalStatusPage = () => {
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🔍 Internal Status</h1>
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <p><strong>API:</strong> {mockData.api}</p>
        <p><strong>Database:</strong> {mockData.database}</p>
        <p><strong>Environment:</strong> {mockData.environment}</p>
        <p><strong>Timestamp:</strong> {mockData.timestamp}</p>
        <p><strong>Last Successful API Response:</strong> {mockData.lastSuccessfulApiResponseAt || 'Never'}</p>
      </div>
    </div>
  );
};

export default InternalStatusPage;
```

Refresh `http://localhost:5173/internal/status` – you’ll see the layout with mock data.

✅ **Stage 3 complete.**  

---

## 🔄 Stage 4: Fetch Real Data + Loading / Error States

Now we replace the mock with a real fetch, and handle loading and error.

Replace `frontend/src/pages/InternalStatus/InternalStatusPage.tsx` with:

```tsx
import { useEffect, useState } from 'react';
import { getStatus } from '../../api/statusApi';
import { StatusResponse } from '../../types/status.types';

const InternalStatusPage = () => {
  // State
  const [data, setData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch function
  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStatus();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  // ---- RENDER ----
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <h2>⏳ Loading status...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '40px', color: 'red' }}>
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button onClick={fetchStatus}>Retry</button>
      </div>
    );
  }

  if (!data) {
    return <div>No data available.</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🔍 Internal Status</h1>
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <p><strong>API:</strong> {data.api}</p>
        <p><strong>Database:</strong> {data.database}</p>
        <p><strong>Environment:</strong> {data.environment}</p>
        <p><strong>Timestamp:</strong> {data.timestamp}</p>
        <p><strong>Last Successful API Response:</strong> {data.lastSuccessfulApiResponseAt || 'Never'}</p>
      </div>
    </div>
  );
};

export default InternalStatusPage;
```

**Test it**:  
- With backend **running** → you see real data.  
- Stop the backend (`Ctrl+C`) and refresh → you see the error state.  
- Start the backend again and click “Retry” → data reappears.

✅ **Stage 4 complete.**  

---

## 🔁 Stage 5: Add Refresh Button

We add a refresh button that calls the same `fetchStatus` function.

Replace **only the return block** (the JSX) with this updated version:

```tsx
  // ... keep all state and fetch logic the same ...

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🔍 Internal Status</h1>
        <button 
          onClick={fetchStatus} 
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <p><strong>API:</strong> {data.api}</p>
        <p><strong>Database:</strong> {data.database}</p>
        <p><strong>Environment:</strong> {data.environment}</p>
        <p><strong>Timestamp:</strong> {data.timestamp}</p>
        <p><strong>Last Successful API Response:</strong> {data.lastSuccessfulApiResponseAt || 'Never'}</p>
      </div>
    </div>
  );
```

Now you have a refresh button that shows “Refreshing…” while loading, and updates the data.

✅ **Stage 5 complete.**  

---

## 🎨 Stage 6: Polish & Styling (with CSS Modules)

We’ll move inline styles to a separate CSS module and add professional touches (badge colours, formatted timestamps).

### Step 6.1: Create the CSS Module

Replace `frontend/src/pages/InternalStatus/InternalStatus.module.css` with:

```css
.container {
  max-width: 700px;
  margin: 40px auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
}

.refreshBtn {
  padding: 8px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refreshBtn:hover:not(:disabled) {
  background-color: #0056b3;
}

.refreshBtn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.statusItem {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.statusItem:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #555;
}

.value {
  font-weight: 500;
  color: #1a1a1a;
}

.badgeOk {
  background: #d4edda;
  color: #155724;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 14px;
}

.badgeError {
  background: #f8d7da;
  color: #721c24;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 14px;
}

.loadingContainer {
  text-align: center;
  margin-top: 60px;
  font-size: 18px;
  color: #555;
}

.errorContainer {
  text-align: center;
  margin-top: 60px;
  color: #d32f2f;
}

.errorContainer button {
  margin-top: 12px;
  padding: 8px 20px;
  background: #d32f2f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.timestamp {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #555;
}
```

### Step 6.2: Update the Page Component to Use CSS Modules

Replace `frontend/src/pages/InternalStatus/InternalStatusPage.tsx` with:

```tsx
import { useEffect, useState } from 'react';
import { getStatus } from '../../api/statusApi';
import { StatusResponse } from '../../types/status.types';
import styles from './InternalStatus.module.css';

const InternalStatusPage = () => {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStatus();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Helper to format timestamp
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // ---- LOADING ----
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <h2>⏳ Loading status...</h2>
      </div>
    );
  }

  // ---- ERROR ----
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button onClick={fetchStatus}>Retry</button>
      </div>
    );
  }

  // ---- NO DATA ----
  if (!data) {
    return <div>No data available.</div>;
  }

  // ---- SUCCESS ----
  const getBadgeClass = (value: string) => {
    return value === 'ok' || value === 'ok' ? styles.badgeOk : styles.badgeError;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🔍 Internal Status</h1>
        <button
          className={styles.refreshBtn}
          onClick={fetchStatus}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.statusItem}>
          <span className={styles.label}>API</span>
          <span className={`${styles.value} ${getBadgeClass(data.api)}`}>
            {data.api}
          </span>
        </div>

        <div className={styles.statusItem}>
          <span className={styles.label}>Database</span>
          <span className={`${styles.value} ${getBadgeClass(data.database)}`}>
            {data.database}
          </span>
        </div>

        <div className={styles.statusItem}>
          <span className={styles.label}>Environment</span>
          <span className={styles.value}>{data.environment}</span>
        </div>

        <div className={styles.statusItem}>
          <span className={styles.label}>Timestamp</span>
          <span className={styles.timestamp}>{formatDate(data.timestamp)}</span>
        </div>

        <div className={styles.statusItem}>
          <span className={styles.label}>Last Successful API Response</span>
          <span className={styles.timestamp}>
            {data.lastSuccessfulApiResponseAt
              ? formatDate(data.lastSuccessfulApiResponseAt)
              : 'Never'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InternalStatusPage;
```

### Step 6.3: Add a Global Reset (Optional)

You can add `frontend/src/styles/global.css` with basic resets:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
```

And import it in `frontend/src/main.tsx`:

```tsx
import './styles/global.css';
```

---

## ✅ Stage 6 Complete – You’re Done!

Now you have a **fully functional, styled, and interactive internal status page**.

### Summary of what you built:

- ✅ Routing to `/internal/status`
- ✅ Clean folder structure
- ✅ API client with TypeScript
- ✅ Real backend integration
- ✅ Loading / Error / Success states
- ✅ Refresh button with disabled state
- ✅ Professional styling with badges and formatted timestamps

---

## 🧪 Final Test Flow

1. **Start backend**: `cd backend && node server.js`
2. **Start frontend**: `cd frontend && npm run dev`
3. **Visit**: `http://localhost:5173/internal/status`
4. **First load** – shows loading, then data.
5. **Click Refresh** – shows “Refreshing…”, then updates.
6. **Stop backend** – click Refresh – error shows.
7. **Start backend** – click Retry – data returns.

---

## 🎉 You’ve built a production‑ready full‑stack feature!

Now you can apply the same pattern to any other page or feature. Let me know if you want to go back to the **backend tests** or add anything else – I’m happy to guide you through.

first test results :
PS C:\Users\vedant\Desktop\VNT_tasks\day1_2-7-26\backend> npm test

> backend@1.0.0 test
> jest

 PASS  src/tests/status.test.js
  GET /api/internal/status
    √ should return 200 and the correct structure when DB is healthy (138 ms)          
    √ should track the last successful response time across multiple calls (74 ms)     
    √ should return database: "error" when DB connection fails (75 ms)                 
                                                                                       
Test Suites: 1 passed, 1 total                                                         
Tests:       3 passed, 3 total                                                         
Snapshots:   0 total
Time:        0.725 s, estimated 2 s
Ran all test suites.
C:\Users\vedant\Desktop\VNT_tasks\day1_2-7-26\backend\src\tests\status.test.js:40
      expect(response.body.environment).toBe('local'); // Default
                                        ^

[JestAssertionError: expect(received).toBe(expected) // Object.is equality

Expected: "local"
Received: "test"] {
  matcherResult: {
    actual: 'test',
    expected: 'local',
    message: '\x1B[2mexpect(\x1B[22m\x1B[31mreceived\x1B[39m\x1B[2m).\x1B[22mtoBe\x1B[2m(\x1B[22m\x1B[32mexpected\x1B[39m\x1B[2m) // Object.is equality\x1B[22m\n' +
      '\n' +
      'Expected: \x1B[32m"local"\x1B[39m\n' +
      'Received: \x1B[31m"test"\x1B[39m',
    name: 'toBe',
    pass: false
  }
}

Node.js v24.12.0
PS C:\Users\vedant\Desktop\VNT_tasks\day1_2-7-26\backend> 
 Where is NODE_ENV coming from if not in .env?
Jest automatically sets NODE_ENV=test when you run tests. It does this to ensure:

Your app can behave differently in a test environment (e.g., use a test database).

It's a standard practice in the Node.js ecosystem.

So even though you didn't explicitly set NODE_ENV in .env, Jest injects it behind the scenes. That's why your endpoint returned "test" instead of "local".

This is actually a good thing! It means your app is environment-aware.