# PlayerHub Backend

The Express.js/Node.js backend for the PlayerHub application.

## Technologies Used
- Node.js & Express.js
- MySQL (Database)
- Redis (Caching & Sorted Sets)
- BullMQ (Background Jobs)
- Multer (File Uploads)
- JWT (Authentication)

## Day 13: Redis Integration & API Hardening
During Day 13, major architectural upgrades were made leveraging Redis to drastically scale performance and data integrity:
- **Redis Response Caching (Stage 3)**: Implemented `cacheMiddleware.js` and `cacheKeyBuilder.js` to intelligently cache the `GET /api/players` and `GET /api/teams` JSON payloads for 60 seconds. This avoids hitting MySQL completely on hot routes.
- **Sorted Set Autocomplete (Stage 5)**: Created an advanced `searchService.js` that pulls player names from MySQL on startup and indexes them into a Redis Sorted Set (`players_autocomplete`). Created the `GET /api/players/autocomplete` endpoint for sub-millisecond prefix searching.
- **Idempotency Locks (Stage 7)**: Built `idempotencyMiddleware.js` to use Redis `SET NX` locks. This automatically prevents duplicate database inserts when the frontend `POST /api/players` endpoint is spammed by rapidly double-clicking.
- **Validation Improvements**: Tightened `validatePlayer.js` to strictly enforce Avatar presence and unique Gallery array uploads before hitting standard controllers.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server (runs on port 3000):
   ```bash
   npm run dev
   ```

3. Start the BullMQ background worker:
   ```bash
   npm run worker
   ```

*Note: Ensure your MySQL and Redis servers are running locally before starting the backend.*
