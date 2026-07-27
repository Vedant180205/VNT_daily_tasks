# Implementation Plan - MVP Ranking System (Production-Ready)

This document outlines the architectural analysis and step-by-step implementation plan for the **MVP Ranking System** feature for the VNT Player Management System, incorporating robust operational practices.

---

## 1. Executive Summary

The **MVP Ranking System** computes, stores, ranks, and caches player performance standings. Individual match performance logs are stored in a raw transactions table, aggregated, and synchronized into a compiled leaderboard table (`mvp_players`). 

To ensure architectural cleanliness and scalability:
* **Table Source**: The `players` table acts as the sole source of truth for player records. We use `player_id` (INT) and fetch `players.name` directly.
* **Separation of Concerns**: The synchronization logic is housed in a reusable service (`mvpRankingService.js`), which is invoked by a dedicated job runner (`mvpSyncJob.js`).
* **Cache Strategy**: Integrates a **Redis Cache-Aside Pattern** with explicit invalidation and proactive warming.

---

## 2. Current Project Architecture Analysis

The existing backend is a stateless, N-Tier Express.js application on Node.js:
* **Routes Layer** -> **Controllers Layer** -> **Services Layer** -> **Models Layer**.
* **Database Connection**: Connection pool (`/src/config/db.js`) using `mysql2/promise`.
* **Redis Caching**: Standard client (`/src/config/redis.js`) for general caching, and `ioredis` (`/src/config/redisBull.js`) for BullMQ.

We will integrate the ranking system into this layered architecture, establishing a new `mvp` domain vertical.

---

## 3. Database Schema Analysis

* **`players`**: `id` (PK), `name` (Full Name), `team_id` (FK). Acts as the foundational table for MVP records.
* **`users`**: Used strictly for auth and organizers. Remains untouched.

---

## 4. Recommended Database Changes

We recommend executing migration file `015_create_mvp_system_tables.sql`.

### 1. Create `mvp_performance_logs` Table
Stores match-wise performance. Includes a `match_reference` to trace logs back to specific games.
```sql
CREATE TABLE mvp_performance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    match_reference VARCHAR(100), -- To link to specific matches/fixtures
    batting_points INT DEFAULT 0,
    bowling_points INT DEFAULT 0,
    fielding_points INT DEFAULT 0,
    is_mft TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_player_mft (player_id, is_mft),
    INDEX idx_created_at (created_at) -- Supports time-based filtering (e.g., "Last 30 days")
);
```

### 2. Create `mvp_players` Table
Compiled leaderboard table. Includes `last_synced_at` to track data freshness.
```sql
CREATE TABLE mvp_players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL UNIQUE,
    player_full_name VARCHAR(255) NOT NULL,
    total_points INT DEFAULT 0,
    rank_position INT DEFAULT NULL,
    is_mft TINYINT DEFAULT 1,
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_total_points (total_points DESC),
    INDEX idx_created_at (created_at)
);
```

---

## 5. Recommended Architectural Changes

### File Structure Refactoring
Instead of a monolithic script, the sync logic will be decoupled:
* **`src/jobs/mvpSyncJob.js`**: The job runner (CLI wrapper) that invokes the service. Allows future triggering via BullMQ or Cron.
* **`src/services/mvpRankingService.js`**: Core business logic (aggregation, validation, ranking algorithms, Redis orchestration).
* **`src/models/mvpModel.js`**: Database transactions and raw SQL queries.
* **`src/controllers/mvpController.js` & `src/routes/mvpRoutes.js`**: API endpoints.

---

## 6. Ranking Algorithm & Data Flow

### Algorithm Logic
Standard Competition Ranking (1224 format) is used for ties.
```text
Sort players by total_points DESC
Initialize current_rank = 1, previous_points = -1, rank_step = 1

For each player:
  If player.total_points == previous_points:
      player.rank = current_rank
      rank_step++
  Else:
      current_rank = current_rank + rank_step
      player.rank = current_rank
      rank_step = 1
  previous_points = player.total_points
```

### Synchronization Pipeline (Inside Service)
1. **Load Logs**: Fetch un-aggregated or all logs based on `is_mft`.
2. **Aggregate**: Sum points per `player_id`.
3. **Validate**: Reject negative points, NULLs, missing players, or duplicates.
4. **Transaction Begin (`BEGIN`)**: Start DB transaction.
5. **Upsert**: Push aggregated totals to `mvp_players`.
6. **Generate Rank**: Apply ranking algorithm and update `rank_position`.
7. **Commit (`COMMIT`)**: Save DB changes atomically.
8. **Refresh Redis**: Invalidate and rebuild cache.
9. **Log Summary**: Emit detailed telemetry.

---

## 7. Redis Cache Strategy

* **Keyspace**:
  * `mvp:leaderboard` (Full list)
  * `mvp:leaderboard:top10` (Truncated high-performance list)
  * `mvp:leaderboard:player:{id}` (Optional future key for individual stats)
* **Explicit Invalidation & Regeneration** (Post-Commit):
  ```text
  DEL mvp:leaderboard
  DEL mvp:leaderboard:top10
  GENERATE JSON
  SET mvp:leaderboard (with TTL)
  SET mvp:leaderboard:top10 (with TTL)
  ```

---

## 8. API Contract

**`GET /api/mvp/leaderboard`**
```json
{
  "success": true,
  "lastSynced": "2026-07-27T10:00:00Z",
  "data": [
    {
      "rank": 1,
      "playerId": 15,
      "name": "Virat",
      "points": 520
    }
  ]
}
```

---

## 9. Stage-wise Implementation Plan

### Stage 1: DB Migration & Schema Update
* **Files**: `backend/migrations/015_create_mvp_system_tables.sql`
* **Objective**: Establish robust schema with appropriate indexing and `match_reference`.

### Stage 2: Seeding & Sample Data
* **Files**: `backend/scripts/seeders/seedMvpData.js`
* **Objective**: Insert 10 players, 5 logs/player with randomized batting/bowling/fielding points to thoroughly test aggregation and tie scenarios.

### Stage 3: Aggregation & DB Operations (Service & Model)
* **Files**: `src/models/mvpModel.js`, `src/services/mvpRankingService.js`
* **Objective**: Implement the `Load -> Aggregate -> Validate -> Transaction (Upsert)` pipeline.

### Stage 4: Ranking Generation
* **Files**: `src/services/mvpRankingService.js`
* **Objective**: Implement the Standard Competition Ranking algorithm and `Commit` the transaction. 

### Stage 5: Redis Integration & Invalidation
* **Files**: `src/services/mvpRankingService.js`
* **Objective**: Implement explicit cache invalidation (`DEL` -> `SET`) after successful DB commit. Setup TTLs.
* **Rollback Strategy**: If Redis fails post-DB commit, fall back to DB delete/re-generate pattern.

### Stage 6: Leaderboard REST API & CLI Job
* **Files**: `src/jobs/mvpSyncJob.js`, `src/controllers/mvpController.js`, `src/routes/mvpRoutes.js`, `src/app.js`
* **Objective**: Expose the API endpoint with the defined JSON contract, and create the CLI runner with detailed logging (Logs processed, Players updated, Execution time).

### Stage 7: System Testing
* **Objective**: Execute the comprehensive Testing Checklist (see below).

### Stage 8: Scheduler Integration (Future Enhancement)
* **Objective**: Hook `mvpSyncJob.js` into BullMQ or node-cron for automated periodic runs.

---

## 10. Comprehensive Testing Checklist

* [ ] **Migration successful**: Tables and indexes created correctly.
* [ ] **Seeder successful**: 10 players, 50 logs total inserted.
* [ ] **Totals correct**: Aggregated sums match raw log math perfectly.
* [ ] **Rankings correct**: Ordering by DESC is accurate.
* [ ] **Tie handled**: Identical points result in tied ranks (e.g., 1, 1, 3).
* [ ] **Redis hit**: API returns cache payload in <10ms.
* [ ] **Redis miss**: API fetches from DB, rebuilds cache successfully.
* [ ] **API contract works**: JSON response shape matches expectations.
* [ ] **Deleted player handled**: FK cascading and sync logic gracefully handles removed users.
* [ ] **Empty leaderboard handled**: Returns empty array `[]` instead of 500 error.

---

## 11. Final Recommendation

By separating business logic into `mvpRankingService.js`, wrapping bulk updates in database transactions, heavily optimizing indices, explicitly defining caching flows, and providing a rigorous testing checklist, this plan guarantees a highly resilient, production-ready MVP Ranking System.
