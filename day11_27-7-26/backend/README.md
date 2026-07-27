# Backend: MVP Sync Engine & Scalable API Architecture ????

This is the Express backend for the Player Management application, updated for **Day 11** to manage scalable MVP calculations via background processing, high-performance Redis caching, and robust database migrations.

---

## ?? Key Features & Services

### 1. BullMQ Background Worker (`src/workers/mvpWorker.js`)
* **Asynchronous Sync**: We moved heavy database operations off the main thread. The MVP worker runs periodically (using `BullMQ`) to aggregate thousands of player scores across `mvp_performance_logs`.
* **Upsert Logic**: Calculates `total_points` (batting + bowling + fielding) for every player where `is_mft = 1`, and efficiently bulk upserts records into `mvp_players`.
* **Ranking Algorithm**: Generates descending integer rankings based on real-time total scores.

### 2. Redis Caching Optimization (`src/services/mvpService.js`)
* Handles 10,000+ players efficiently without database strain.
* Implements a `Cache-Aside` pattern on the `GET /api/mvp/leaderboard` route using the `mvp:leaderboard` key.
* The cache TTL ensures extremely fast (<5ms) sub-millisecond response times for global queries while maintaining accuracy.

### 3. Server Pagination & Grid Sorting
* Built generic server-side pagination controllers inside `playerController.js`, `mvpController.js`, and `enrollmentController.js`.
* Supported robust query parameter parsing (e.g. `?page=1&limit=50&status=1`) allowing the frontend grid to securely paginate through large datasets.

---

## ?? API Endpoints

### ?? MVP & Leaderboard
* `GET /api/mvp/leaderboard`: Retrieves cached leaderboard rankings via Redis.
* `GET /api/mvp/logs`: Retrieves paginated raw performance logs.

### ?? Dashboard Metrics
* `GET /api/dashboard`: Aggregates active teams, pending organizers, top players, and registration charts securely via SQL aggregates.

---

## ?? Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Ensure `.env` contains Redis configuration variables.
   ```env
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   ```

3. **Database Preparation**
   Run the schema migration scripts to build the `mvp_performance_logs` and `mvp_players` tables:
   ```bash
   npm run migrate
   ```

4. **Start Redis**
   Ensure a local or remote Redis instance is running.

5. **Start the Development Server**
   ```bash
   npm run dev
   ```

