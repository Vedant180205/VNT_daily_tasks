# Redis Implementation Roadmap
## VNT Player Management System — Backend

---

# Overview

**Source File Analyzed:** `docs/task.md`

**Project Stack:** Node.js · Express.js · MySQL · JWT · BullMQ

**Redis Clients Already Present:**
| Client | Package | Config File | Purpose |
|--------|---------|-------------|---------|
| `redis` (v6) | `redis` npm | `src/config/redis.js` | General caching (`GET/SET/DEL`) |
| `ioredis` | `ioredis` npm | `src/config/redisBull.js` | BullMQ queue back-end |

**Key observation before planning:**
Tasks 3 (API Response Cache) and 4 (Cache Invalidation) are **already partially implemented** in `playerController.js`. The plan will formalize and harden what exists, then build the missing layers on top. All new stages must integrate with the existing layered architecture (Routes → Controllers → Services → Models).

---

# Redis Features Identified

| Task # | Feature | Priority | Status |
|--------|---------|----------|--------|
| Task 1 | Session Store — active sessions in Redis alongside JWT | Very High | ✅ Completed |
| Task 3 | API Response Cache — cache expensive `GET` queries | High | ✅ Completed |
| Task 4 | Cache Invalidation — purge stale cache on mutating ops | Very High | ✅ Completed |
| Task 6 | Search Autocomplete — lexicographic `ZADD/ZRANGEBYLEX` | Medium | ✅ Completed |
| Task 7 | Background Job Status Tracking — BullMQ job progress in Redis Hash | High | ✅ Completed |
| Task 8 | Request Deduplication — idempotency via `SET NX EX` | High | ✅ Completed |

---

# Architecture Impact

The following layers will be touched:

```
src/
├── config/
│   └── redis.js           ← Harden existing client (password, retry logic)
├── middleware/
│   ├── authMiddleware.js   ← Stage 1: Add session validation
│   ├── cacheMiddleware.js  ← Stage 3: NEW — reusable cache-check middleware
│   └── dedupMiddleware.js  ← Stage 6: NEW — request deduplication
├── services/
│   ├── sessionService.js   ← Stage 1: NEW
│   ├── cacheService.js     ← Stage 3: NEW — centralized cache logic
│   └── searchService.js    ← Stage 4: NEW — autocomplete
├── controllers/
│   ├── authController.js   ← Stage 1: login + logout
│   └── playerController.js ← Stage 3+4: refactor to use cacheService
├── routes/
│   └── authRoutes.js       ← Stage 1: add /logout route
└── utils/
    └── cacheKeyBuilder.js  ← Stage 3: NEW — deterministic key generation
```

No database schema changes are required. All Redis data is ephemeral.

---

# Stage-wise Roadmap

---

## Stage 1 — Redis Session Store
**Status: ✅ Completed**

---

## Stage 2 — Redis Client Hardening & Centralized Cache Service
**Status: ✅ Completed**

### 1. Stage Number
2

### 2. Stage Name
Redis Client Hardening & Centralized Cache Service

### 3. Goal
Consolidate all Redis caching concerns into a reusable `cacheService.js`. Remove the duplicated, ad-hoc `redisClient.get/setEx` calls scattered in controllers. Build a deterministic key-builder utility. This stage is a **prerequisite for Stage 3 and Stage 4**, and must be completed before any caching or invalidation work.

### 4. Why This Stage Exists
`playerController.js` currently contains raw `redisClient.get()` / `redisClient.setEx()` / `redisClient.keys()` / `redisClient.del()` calls inline. This pattern:
- Violates separation of concerns (controllers should not know about Redis).
- Makes cache logic impossible to test in isolation.
- Creates duplicated cache-key construction strings that can drift out of sync.
- Has no centralized TTL management.
Also, `src/config/redis.js` does not use `REDIS_PASSWORD` from `.env` — it must be fixed.

### 5. Features Covered
- Fix `redis.js` to use `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` from `.env`. (Done in Stage 1)
- `cacheService.get(key)` — wraps `redisClient.get()` with JSON parse.
- `cacheService.set(key, data, ttl)` — wraps `redisClient.setEx()` with JSON stringify.
- `cacheService.del(key)` — wraps `redisClient.del()`.
- `cacheService.delByPattern(pattern)` — scans for keys matching pattern and deletes them.
- `cacheKeyBuilder.buildPlayerKey(params)` — deterministic, canonical key construction.

### 6. Files Expected to Be Created
| File | Purpose |
|------|---------|
| `src/services/cacheService.js` | Single Redis caching abstraction |
| `src/utils/cacheKeyBuilder.js` | Pure function for building deterministic cache keys |

### 7. Files Expected to Be Modified
| File | Change |
|------|--------|
| `src/controllers/playerController.js` | Replace inline Redis calls with `cacheService.*` |

### 8. Redis Commands Involved
| Command | Via Service Method |
|---------|-------------------|
| `GET key` | `cacheService.get()` |
| `SETEX key ttl value` | `cacheService.set()` |
| `DEL key [key ...]` | `cacheService.del()` |
| `SCAN 0 MATCH pattern COUNT 100` | `cacheService.delByPattern()` — **use SCAN not KEYS in production** |

> **Important:** `KEYS players:*` blocks the Redis event loop. In production, replace with `SCAN` (cursor-based iteration). This stage introduces `delByPattern()` using SCAN.

### 9. Data Structures Involved
**String** — JSON-serialized API response payloads.
```
Key:   players:page=1:limit=10:search=:sort=created_at:order=desc:team=:status=
Value: {"success":true,"page":1,"limit":10,...}
TTL:   60 seconds
```

### 10. Flow Diagram
```
BEFORE (current, problematic):
playerController → redisClient.get(cacheKey)   [controller knows about Redis]
playerController → redisClient.setEx(...)       [controller knows about TTL]
playerController → redisClient.keys('players:*')  [BLOCKING in production]

AFTER (centralized):
playerController → cacheService.get(key)
                 → cacheService.set(key, data, ttl)
                 → cacheService.delByPattern('players:*')
                      → SCAN cursor MATCH players:* COUNT 100 → DEL batch
```

### 11. Request Flow
_(Refactor only — no new endpoints)_

### 12. Response Flow
_(Unchanged from user perspective)_

### 13. Dependencies
- None — this stage can be done independently of Stage 1.

### 14. Risks
| Risk | Mitigation |
|------|-----------|
| `KEYS` in production | Replace with `SCAN`-based iteration in `delByPattern()` |
| Redis client not authenticated | Fix `redis.js` to read `REDIS_PASSWORD` |

### 15. Edge Cases
- `cacheService.get()` on a missing key → return `null`, not throw.
- `cacheService.delByPattern()` with no matching keys → no-op, no error.
- `cacheKeyBuilder` must sort query params canonically to avoid `page=1&limit=10` vs `limit=10&page=1` producing different keys.

### 16. Validation Strategy
- Unit test: `cacheKeyBuilder.buildPlayerKey({ page: 1, limit: 10 })` returns consistent string regardless of param order.
- Integration test: `cacheService.set(key, data, 60)` → `cacheService.get(key)` → returns same data.

### 17. Postman Testing Required
| Test | Steps |
|------|-------|
| Cache is hit | Call `GET /api/players` twice; second call returns from Redis (check `CACHE HIT` log) |
| Cache invalidation | Create player → call `GET /api/players` → confirm `CACHE MISS` |

### 18. Expected Output After Successful Completion
- `redis.js` connects successfully with password.
- `cacheService` methods work for all CRUD operations.
- No raw `redisClient` calls remain in controller files.
- `SCAN` replaces `KEYS` in pattern-deletion.

---

## Stage 3 — API Response Cache (Formalized)
**Status: ✅ Completed**

### 1. Stage Number
3

### 2. Stage Name
API Response Cache — Reusable Cache Middleware

### 3. Goal
Extract the cache-check logic from `playerController.js` into a **reusable Express middleware** (`cacheMiddleware.js`) that can be dropped onto any `GET` route without touching the controller. The controller is cache-agnostic; the middleware intercepts the response and populates the cache transparently.

### 4. Why This Stage Exists
API response caching already works in `playerController.js`, but it is coupled to the controller. Adding caching to `GET /api/enrollments`, `GET /api/teams`, or `GET /api/mvp/leaderboard` requires duplicating the same 15-line cache block. A middleware approach centralizes this and makes it a zero-cost addition to any route.

### 5. Features Covered
- `cacheMiddleware(ttl)` — Express middleware factory.
- Reads `req.originalUrl` to derive a canonical cache key.
- On cache HIT → immediately returns cached JSON, bypassing controller.
- On cache MISS → lets request pass through; intercepts `res.json()` to populate cache.

### 6. Files Expected to Be Created
| File | Purpose |
|------|---------|
| `src/middleware/cacheMiddleware.js` | Express middleware factory `(ttl) => (req, res, next)` |

### 7. Files Expected to Be Modified
| File | Change |
|------|--------|
| `src/controllers/playerController.js` | Remove inline cache logic from `getPlayers` |
| `src/routes/playerRoutes.js` | Add `cacheMiddleware(60)` to `GET /` route |

### 8. Redis Commands Involved
| Command | When |
|---------|------|
| `GET cache:{url_hash}` | On every GET request — check for cached response |
| `SETEX cache:{url_hash} <ttl> <json>` | After controller generates response |

### 9. Data Structures Involved
**String** — serialized HTTP response body (JSON).

### 10. Flow Diagram
```
Client → GET /api/players?page=1&team=2
  → authMiddleware          [JWT + session check]
  → cacheMiddleware(60)
      → key = "players:" + hash(req.originalUrl)
      → cacheService.get(key)
          ┌── HIT  → res.json(cached)   [STOP — controller not called]
          └── MISS → next()
                → playerController.getPlayers
                    → playerService.getPlayers()
                    → DB query
                    → res.json(responseData)
                        [cacheMiddleware intercepts res.json]
                        → cacheService.set(key, responseData, 60)
                        → original res.json(responseData) sent to client
```

### 11. Request Flow
1. Request arrives at route.
2. `authMiddleware` validates JWT + session.
3. `cacheMiddleware(60)` calls `cacheService.get(key)`.
4. If HIT → respond immediately.
5. If MISS → pass to controller.
6. Controller calls service → DB → builds response.
7. `res.json()` is monkey-patched by middleware to also call `cacheService.set()`.
8. Response sent to client.

### 12. Response Flow
- **Cache HIT:** `X-Cache: HIT` header (optional), JSON returned instantly.
- **Cache MISS:** `X-Cache: MISS` header (optional), JSON returned after DB query.

### 13. Dependencies
- **Depends on Stage 2** (`cacheService.js` must exist).
- Stage 1 (sessions) should be complete for authenticated routes.

### 14. Risks
| Risk | Mitigation |
|------|-----------|
| Caching user-specific data incorrectly | Cache keys must include authenticated user context if responses differ per user |
| Stale cache after data mutation | Stage 4 (cache invalidation) is the paired solution |
| `res.json` monkey-patching brittleness | Use `res.send` interceptor carefully; test with various response shapes |

### 15. Edge Cases
- Errors (4xx/5xx) must **not** be cached.
- Only `2xx` responses should be written to cache.
- `req.originalUrl` includes query strings — must normalize (sort params) via `cacheKeyBuilder`.
- Routes with file downloads or streams must bypass the middleware.

### 16. Validation Strategy
- Test: Call `GET /api/players` → Redis CLI: `EXISTS cache:{key}` → `1`.
- Test: TTL: `TTL cache:{key}` → value between 1 and 60.
- Test: Verify no caching of a `400 Bad Request` response.

### 17. Postman Testing Required
| Test | Expected |
|------|---------|
| First call | `CACHE MISS` in logs, DB query runs |
| Second identical call | `CACHE HIT` in logs, response is identical |
| Call after mutation (Stage 4) | `CACHE MISS` again |

### 18. Expected Output After Successful Completion
- `GET /api/players` with identical params served from Redis on second call.
- Cache keys visible in Redis CLI: `KEYS players:*`.
- Response time drops significantly on cache hit.

---

## Stage 4 — Cache Invalidation
**Status: ✅ Completed**

### 1. Stage Number
4

### 2. Stage Name
Cache Invalidation — Write-Through Purge Strategy

### 3. Goal
Ensure that any mutating operation (CREATE, UPDATE, DELETE) on a resource **immediately invalidates all cached GET responses** for that resource, so clients never see stale data.

### 4. Why This Stage Exists
`playerController.js` already calls `invalidatePlayerCache()` on mutations. However, this function uses `KEYS players:*` (blocking in production) and the logic is embedded in the controller. This stage formalizes invalidation as a **service-layer concern**, moves it to `cacheService.delByPattern()` (SCAN-based, non-blocking), and documents the exact trigger points.

### 5. Features Covered
- `cacheService.delByPattern('players:*')` triggered on player create/update/delete.
- Extensible to other resources: `teams:*`, `enrollments:*`, etc.
- Logging when cache is cleared.

### 6. Files Expected to Be Created
_(None — uses `cacheService.delByPattern()` from Stage 2)_

### 7. Files Expected to Be Modified
| File | Change |
|------|--------|
| `src/controllers/playerController.js` | Replace `invalidatePlayerCache()` with `cacheService.delByPattern('players:*')` |
| `src/controllers/teamController.js` | Add `cacheService.delByPattern('teams:*')` on mutations |

### 8. Redis Commands Involved
| Command | When |
|---------|------|
| `SCAN cursor MATCH players:* COUNT 100` | To find all player cache keys |
| `DEL key [key ...]` | Batch delete all found keys |

### 9. Data Structures Involved
**String** keys matching pattern `players:*`.

### 10. Flow Diagram
```
Client → POST /api/players          (create)
       → PUT  /api/players/:id      (update)
       → DELETE /api/players/:id    (delete)
         → authMiddleware
         → controller (create/update/delete)
           → playerService.*()      [DB write]
           → cacheService.delByPattern('players:*')
               → SCAN 0 MATCH players:* COUNT 100
               → collect all matching keys
               → DEL key1 key2 key3...
               → log: "Cache invalidated: 5 keys deleted"
         ← res: { success: true, data: ... }
```

### 11. Request Flow
1. Mutating request authenticated and validated.
2. Controller calls service (DB write).
3. After successful DB write, call `cacheService.delByPattern('players:*')`.
4. Cache invalidation errors are **caught and logged, never re-thrown** (cache failure must not fail the API response).
5. Response returned to client.

### 12. Response Flow
- API response is unaffected by cache invalidation success or failure.
- Next `GET /api/players` will be a cache MISS → fresh DB data.

### 13. Dependencies
- **Depends on Stage 2** (`cacheService.delByPattern()` must be implemented).
- **Depends on Stage 3** (cache must exist before invalidation makes sense).

### 14. Risks
| Risk | Mitigation |
|------|-----------|
| Cache invalidation fails silently | Wrap in try/catch with `console.error()` logging |
| Invalidating too broadly (all player caches) | For now, broad invalidation is correct; can narrow to specific keys later |
| Race condition: read happens between DB write and cache clear | Acceptable — brief window. Atomic patterns not needed at this scale. |

### 15. Edge Cases
- No matching keys → `delByPattern` is a no-op, no error.
- Redis unavailable → log error, do not block API response.
- Bulk CSV import → invalidate cache once after all rows processed (in worker, not per-row).

### 16. Validation Strategy
1. Populate cache: `GET /api/players` → `CACHE HIT` on second call.
2. Create/update/delete a player.
3. Immediately: `KEYS players:*` in Redis CLI → should return empty.
4. `GET /api/players` again → `CACHE MISS`.

### 17. Postman Testing Required
| Test | Steps |
|------|-------|
| Cache after invalidation | `GET` → `GET` (HIT) → `POST` (create) → `GET` (MISS) |

### 18. Expected Output After Successful Completion
- No stale data ever returned after a mutation.
- Cache keys are fully cleared after create/update/delete.

---

## Stage 5 — Search Autocomplete (Sorted Set)
**Status: ✅ Completed**

### 1. Stage Number
5

### 2. Stage Name
Search Autocomplete — Redis Sorted Set Lexicographic Search

### 3. Goal
Implement a real-time player name autocomplete API backed entirely by Redis Sorted Sets. As players are added or their names change, the sorted set is kept in sync. The frontend can query `GET /api/players/autocomplete?q=Ro` to get instant suggestions without a DB query.

### 4. Why This Stage Exists
Database `LIKE '%Ro%'` queries are expensive and bypass indexes on the leading wildcard. Redis lexicographic range queries (`ZRANGEBYLEX`) operate in O(log N + M) time on a sorted set, returning sub-millisecond results. This feature is labeled **Advanced** in the task.

### 5. Features Covered
- Build initial sorted set from all existing players on server start.
- `ZADD players_search 0 "virat kohli:42"` — all scores are 0; Redis sorts lexicographically.
- On player create → `ZADD` new name.
- On player delete → `ZREM` name.
- `GET /api/players/autocomplete?q=ro` → `ZRANGEBYLEX players_search [ro [ro\xff` (case-insensitive prefix match).

### 6. Files Expected to Be Created
| File | Purpose |
|------|---------|
| `src/services/searchService.js` | `buildIndex()`, `addToIndex()`, `removeFromIndex()`, `autocomplete(prefix)` |
| `src/controllers/searchController.js` | Handles `GET /api/players/autocomplete` |
| `src/routes/searchRoutes.js` | Mounts autocomplete endpoint |

### 7. Files Expected to Be Modified
| File | Change |
|------|--------|
| `src/controllers/playerController.js` | On create → `searchService.addToIndex()`; on delete → `searchService.removeFromIndex()` |
| `src/server.js` | On startup, call `searchService.buildIndex()` once |
| `src/app.js` | Mount `searchRoutes` |

### 8. Redis Commands Involved
| Command | When |
|---------|------|
| `ZADD players_search 0 "virat kohli:42"` | On player create / index build |
| `ZREM players_search "virat kohli:42"` | On player delete |
| `ZRANGEBYLEX players_search [ro [ro\xff` | On autocomplete query (prefix search) |
| `DEL players_search` | On full index rebuild |
| `ZCARD players_search` | Health check — confirm index size |

### 9. Data Structures Involved
**Sorted Set** — `players_search`
```
Key:    players_search
Member: "virat kohli:42"   (name:id — all lowercase for case-insensitive match)
Score:  0                   (all scores = 0 → lexicographic ordering)
```
Format: `lowercase_name:player_id` — the `:id` suffix allows decoding the player ID from results without a DB lookup.

### 10. Flow Diagram
```
SERVER START:
  server.js → searchService.buildIndex()
    → SELECT id, name FROM players WHERE is_deleted = FALSE
    → for each player:
        ZADD players_search 0 "virat kohli:42"

AUTOCOMPLETE REQUEST:
Client → GET /api/players/autocomplete?q=ro
  → (optional: authMiddleware)
  → searchController.autocomplete
    → searchService.autocomplete("ro")
        → lowercase prefix: "ro"
        → ZRANGEBYLEX players_search [ro [ro\xff
        → returns ["rohit sharma:15", "romario silva:8"]
        → parse: [{ id: 15, name: "Rohit Sharma" }, { id: 8, name: "Romario Silva" }]
  ← res: { success: true, data: [{id, name}, ...] }

PLAYER CREATE:
  playerController.createPlayer()
    → playerService.createPlayer()      [DB insert]
    → searchService.addToIndex(player)  [ZADD]

PLAYER DELETE:
  playerController.deletePlayer()
    → playerService.deletePlayer()        [DB soft-delete]
    → searchService.removeFromIndex(id)   [ZREM]
```

### 11. Request Flow
1. `GET /api/players/autocomplete?q=ro`
2. `searchController` reads `q`, converts to lowercase.
3. `searchService.autocomplete("ro")` runs `ZRANGEBYLEX`.
4. Parse member strings → extract name and id.
5. Return top 10 results.

### 12. Response Flow
```json
{
  "success": true,
  "data": [
    { "id": 15, "name": "Rohit Sharma" },
    { "id": 8, "name": "Romario Silva" }
  ]
}
```

### 13. Dependencies
- **Depends on Stage 2** (Redis client must be stable and authenticated).
- Stage 1 optional for this route (can be public or protected).

### 14. Risks
| Risk | Mitigation |
|------|-----------|
| Index out of sync after soft-delete | Always call `ZREM` on delete/update-name |
| Server restart clears non-persistent Redis | `buildIndex()` runs on every server start |
| Player name changes (update) | `ZREM` old name + `ZADD` new name in `updatePlayer` |
| Large datasets → slow `buildIndex()` on startup | Acceptable; ZADD is O(log N). For 10k+ players, run in background via cron. |

### 15. Edge Cases
- Prefix query `""` (empty string) → should return top N players or return empty.
- Special characters in names → URL-encode in member string.
- Player with same name + different ID → both stored, both returned.
- Index rebuild needed when player is updated (name change).

### 16. Validation Strategy
- Redis CLI: `ZCARD players_search` → count matches DB player count.
- `ZRANGEBYLEX players_search [ro [ro\xff` → correct members returned.
- Test create → `ZADD` appears.
- Test delete → `ZREM` applied.

### 17. Postman Testing Required
| Test | Expected |
|------|---------|
| `GET /autocomplete?q=ro` | Returns players starting with "ro" |
| Add player "Ravi Shankar" → `GET /autocomplete?q=ra` | "Ravi Shankar" appears |
| Delete player → `GET /autocomplete?q=name` | Player no longer appears |

### 18. Expected Output After Successful Completion
- Autocomplete endpoint responds in < 5ms.
- `players_search` sorted set populated in Redis.
- Prefix search works correctly case-insensitively.

---

## Stage 6 — Background Job Status Tracking (Generalized)
**Status: ✅ Completed**

### 1. Stage Number
6

### 2. Stage Name
Background Job Status Tracking — Generalized Hash Store

### 3. Goal
The existing upload tracking (`upload:{uploadId}:status`) is hardcoded in `playerController.js` using raw `bullConnection.hset/hincrby/lrange` calls. This stage extracts that into a reusable `jobTracker` service, and extends it to expose a **standard polling endpoint** `GET /api/jobs/:jobId/status` so the frontend can track progress for any background job (CSV imports, MVP sync, future jobs).

### 4. Why This Stage Exists
The task specifies: "Frontend can poll job progress." Currently, the upload status endpoint only handles the `players` CSV import job, using raw `ioredis` calls in the controller. This stage:
1. Centralizes job tracking into `jobTrackerService.js`.
2. Exposes a generic status endpoint.
3. Makes it easy to add tracking for future job types (e.g., bulk email, data exports).

### 5. Features Covered
- `jobTrackerService.init(jobId, total)` → initialize job hash.
- `jobTrackerService.increment(jobId, field)` → `HINCRBY`.
- `jobTrackerService.getStatus(jobId)` → `HGETALL`.
- `jobTrackerService.getErrors(jobId)` → `LRANGE`.
- `jobTrackerService.addError(jobId, error)` → `RPUSH`.
- Standard `GET /api/jobs/:jobId/status` endpoint.

### 6. Files Expected to Be Created
| File | Purpose |
|------|---------|
| `src/services/jobTrackerService.js` | Encapsulates all job status Redis operations |
| `src/controllers/jobController.js` | Handles `GET /api/jobs/:jobId/status` |
| `src/routes/jobRoutes.js` | Route definition |

### 7. Files Expected to Be Modified
| File | Change |
|------|--------|
| `src/controllers/playerController.js` | Replace raw `bullConnection.hset/hincrby/lrange` with `jobTrackerService.*` |
| `src/workers/playerWorker.js` | Replace raw `bullConnection.hincrby/rpush` with `jobTrackerService.*` |
| `src/app.js` | Mount `jobRoutes` |

### 8. Redis Commands Involved
| Command | Via Service Method |
|---------|-------------------|
| `HSET job:{jobId} total N completed 0 failed 0` | `jobTrackerService.init()` |
| `HINCRBY job:{jobId} completed 1` | `jobTrackerService.increment()` |
| `HINCRBY job:{jobId} failed 1` | `jobTrackerService.increment('failed')` |
| `HGETALL job:{jobId}` | `jobTrackerService.getStatus()` |
| `RPUSH job:{jobId}:errors <json>` | `jobTrackerService.addError()` |
| `LRANGE job:{jobId}:errors 0 -1` | `jobTrackerService.getErrors()` |
| `EXPIRE job:{jobId} 86400` | Auto-cleanup after 24h |

### 9. Data Structures Involved
**Hash** — `job:{jobId}`
```
Key:   job:abc-123-xyz
Field: total      → 500
Field: completed  → 487
Field: failed     → 13
```
**List** — `job:{jobId}:errors`
```
Key:   job:abc-123-xyz:errors
Items: [{"name":"John","email":"x","reason":"Email exists"}, ...]
```

### 10. Flow Diagram
```
CSV UPLOAD:
Client → POST /api/players/upload
  → playerController.uploadCSV
    → jobId = crypto.randomUUID()
    → jobTrackerService.init(jobId, totalRows)
    → for each CSV row: playerQueue.add('create-player', { ...row, jobId })
  ← res: { uploadId: jobId, message: "Processing in background" }

WORKER PROCESSING:
  playerWorker.process(job)
    → success: jobTrackerService.increment(jobId, 'completed')
    → failure: jobTrackerService.increment(jobId, 'failed')
               jobTrackerService.addError(jobId, { name, reason })

STATUS POLLING:
Client → GET /api/jobs/abc-123-xyz/status
  → jobController.getStatus
    → jobTrackerService.getStatus(jobId)   [HGETALL]
    → if failed > 0: jobTrackerService.getErrors(jobId) [LRANGE]
  ← res: { total: 500, completed: 487, failed: 13, errors: [...] }
```

### 11. Request Flow
1. Client uploads CSV → receives `jobId`.
2. Client polls `GET /api/jobs/{jobId}/status` every 2 seconds.
3. `jobController` calls `jobTrackerService.getStatus(jobId)`.
4. Returns current counts.
5. Client stops polling when `completed + failed === total`.

### 12. Response Flow
```json
{
  "success": true,
  "data": {
    "total": 500,
    "completed": 487,
    "failed": 13,
    "errors": [
      { "name": "John Doe", "email": "john@x.com", "reason": "Email already exists" }
    ]
  }
}
```

### 13. Dependencies
- **Depends on Stage 2** (centralized Redis config must work).
- BullMQ (`playerQueue`, `playerWorker`) must already be operational.
- Stage 1 optional — status endpoint can be authenticated.

### 14. Risks
| Risk | Mitigation |
|------|-----------|
| Job key not found | Return `404 { message: "Job not found" }` |
| Redis key expires before client polls | Set TTL to 24h — sufficient for any realistic job duration |
| Worker crashes mid-job | `failed` count reflects partial progress; client sees incomplete totals |

### 15. Edge Cases
- `HGETALL` on non-existent key → empty object → return 404.
- `completed + failed` may briefly not equal `total` (async workers) → client should handle gracefully.
- Very large error lists → `LRANGE` with a sane limit (e.g., first 100 errors).

### 16. Validation Strategy
- Upload CSV → immediately `HGETALL job:{jobId}` in Redis CLI → fields present.
- After processing → `completed + failed === total`.
- `GET /api/jobs/:jobId/status` returns correct JSON.

### 17. Postman Testing Required
| Test | Expected |
|------|---------|
| Upload CSV → get `jobId` | `202` + jobId |
| Poll status immediately | `total` > 0, `completed` < `total` |
| Poll after processing | `completed + failed === total` |
| Poll with invalid jobId | `404 Job not found` |

### 18. Expected Output After Successful Completion
- Frontend can track any background job progress without WebSockets.
- Redis hash keys visible for all active jobs.
- `playerController` and `playerWorker` no longer contain raw Redis hash commands.

---

## Stage 7 — Request Deduplication (Idempotency)
**Status: ✅ Completed**

### 1. Stage Number
7

### 2. Stage Name
Request Deduplication — Idempotency via `SET NX`

### 3. Goal
Prevent the same expensive or mutating request from being processed twice within a short window. If a client double-submits a `POST /api/players` due to network retry or UI bug, the second request is rejected with `409 Conflict` before it hits the database. This is implemented as a reusable Express middleware using `SET key value NX EX ttl`.

### 4. Why This Stage Exists
Without idempotency protection, a network hiccup can cause the client to retry a `POST`, resulting in duplicate players in the database. The `SET NX` (Not eXists) Redis command is atomic — only one concurrent request can set the key. If the key already exists, the request is a duplicate and must be rejected.

### 5. Features Covered
- `dedupMiddleware` — Express middleware factory that accepts a TTL.
- Generates a request fingerprint (hash of: `method + url + userId + body_hash`).
- First request: `SET req:{hash} 1 NX EX 10` → success → proceed.
- Duplicate request: key exists → reject with `409 Conflict`.
- After 10 seconds, key expires and the request can be retried legitimately.

### 6. Files Expected to Be Created
| File | Purpose |
|------|---------|
| `src/middleware/dedupMiddleware.js` | Express middleware for request deduplication |

### 7. Files Expected to Be Modified
| File | Change |
|------|--------|
| `src/routes/playerRoutes.js` | Add `dedupMiddleware(10)` to `POST /`, `PUT /:id`, `DELETE /:id` |

### 8. Redis Commands Involved
| Command | When |
|---------|------|
| `SET req:{hash} 1 NX EX 10` | On every incoming mutable request |
| _(key auto-expires after TTL)_ | After TTL, key deleted automatically |

### 9. Data Structures Involved
**String** — ephemeral flag key.
```
Key:   req:a3f2b8c9d1e4...  (SHA-256 hash of fingerprint)
Value: 1
TTL:   10 seconds
```

### 10. Flow Diagram
```
REQUEST 1 (legitimate):
Client → POST /api/players { name: "Virat", email: "v@x.com" }
  → authMiddleware
  → dedupMiddleware(10)
      fingerprint = SHA256("POST:/api/players:userId:body_hash")
      SET req:{fingerprint} 1 NX EX 10
      → result: "OK"  (key was new)
      → next()
  → playerController.createPlayer
  ← 201 Created

REQUEST 2 (duplicate, within 10 seconds):
Client → POST /api/players { name: "Virat", email: "v@x.com" }  [retry]
  → authMiddleware
  → dedupMiddleware(10)
      fingerprint = SHA256("POST:/api/players:userId:body_hash")
      SET req:{fingerprint} 1 NX EX 10
      → result: null  (key already exists)
      ← 409 { success: false, message: "Duplicate request detected. Please wait 10 seconds." }
```

### 11. Request Flow
1. Authenticated request arrives.
2. `dedupMiddleware` computes SHA-256 fingerprint of `(method + url + userId + sha256(JSON.stringify(req.body)))`.
3. `SET req:{fingerprint} 1 NX EX 10`.
4. If result is `"OK"` → first request → proceed to controller.
5. If result is `null` → duplicate → return `409`.

### 12. Response Flow
- **First request:** Normal controller response.
- **Duplicate (within TTL):** `409 Conflict { success: false, message: "Duplicate request. Please retry after 10 seconds." }`
- **After TTL expires:** Next identical request treated as new.

### 13. Dependencies
- **Depends on Stage 1** (requires `req.user.id` from `authMiddleware` to scope fingerprint per user).
- **Depends on Stage 2** (Redis client must be working).
- Should be applied only to mutating routes: `POST`, `PUT`, `DELETE`.

### 14. Risks
| Risk | Mitigation |
|------|-----------|
| Hash collisions | SHA-256 collision probability is negligible |
| Legitimate retry blocked | TTL of 10s is short enough for user to retry manually |
| GET requests accidentally deduplicated | Middleware should be applied selectively to mutating routes only |
| Redis unavailable → cannot dedup | Decide policy: fail-open (skip dedup, allow request) or fail-closed (reject). **Recommend: fail-open with error log** |

### 15. Edge Cases
- Multipart form data (file uploads) → do not include file bytes in fingerprint; use metadata only (filename, size, mimetype).
- CSV upload endpoint → deduplication should use file hash, not body hash.
- Admin endpoints → same user making same admin action twice should be deduplicated.

### 16. Validation Strategy
- POST player → `200 OK`.
- Immediately POST same player again → `409`.
- Wait 10s → POST again → `200 OK`.
- Verify `KEYS req:*` in Redis CLI during 10s window → key present.

### 17. Postman Testing Required
| Test | Expected |
|------|---------|
| First `POST /api/players` | `201 Created` |
| Immediate second identical `POST` | `409 Conflict` |
| Wait 10s → repeat POST | `201 Created` (if no duplicate email) |

### 18. Expected Output After Successful Completion
- Duplicate submissions blocked at middleware layer.
- No duplicate DB records from network retries.
- `req:*` keys visible in Redis CLI with short TTLs.

---

# Dependency Graph

```
Stage 1: Session Store
    └── requires: redis.js (existing) to be authenticated

Stage 2: Client Hardening + Cache Service
    └── requires: redis.js fix
    └── enables: all subsequent stages

Stage 3: API Response Cache Middleware
    └── depends on: Stage 2 (cacheService)
    └── enables: Stage 4

Stage 4: Cache Invalidation
    └── depends on: Stage 2 (cacheService.delByPattern)
    └── depends on: Stage 3 (cache must exist to invalidate)

Stage 5: Search Autocomplete
    └── depends on: Stage 2 (Redis client stable)
    └── independent of: Stages 3, 4, 6, 7

Stage 6: Job Status Tracking (Generalized)
    └── depends on: Stage 2 (Redis client stable)
    └── independent of: Stages 3, 4, 5, 7

Stage 7: Request Deduplication
    └── depends on: Stage 1 (req.user.id available)
    └── depends on: Stage 2 (Redis client)
    └── independent of: Stages 3, 4, 5, 6
```

---

# Estimated Complexity of Each Stage

| Stage | Name | Complexity | Estimated Duration | Reason |
|-------|------|-----------|-------------------|--------|
| 1 | Session Store | Medium | 2-3 hours | Requires modifying `authMiddleware`, adding logout route |
| 2 | Client Hardening + Cache Service | Low | 1 hour | Refactoring existing config + creating utility service |
| 3 | API Response Cache Middleware | Low | 1 hour | Reusable middleware pattern, well-established |
| 4 | Cache Invalidation | Low | 30 min | Uses `cacheService` from Stage 2 — mostly refactoring |
| 5 | Search Autocomplete | Medium-High | 3-4 hours | New sorted set pattern, index management, new route |
| 6 | Job Status Generalization | Medium | 2 hours | Refactoring existing tracking + new generic endpoint |
| 7 | Request Deduplication | Low | 1 hour | Self-contained middleware, minimal integration points |

---

# Recommended Order of Implementation

```
1 → 2 → 3 → 4 → 6 → 5 → 7

Rationale:
• Stage 1 first: Most impactful security improvement. Validates Redis connection under real auth load.
• Stage 2 next: Infrastructure cleanup. Required by stages 3, 4, 5, 7.
• Stage 3 + 4 together: Cache creation and invalidation are two sides of the same coin.
• Stage 6: Generalize existing upload tracking — low risk, high value.
• Stage 5: Advanced feature, independent but benefits from stable Redis client.
• Stage 7: Last — adds a safety net but has no upstream dependencies.
```

---

# Final Execution Checklist

## Pre-Implementation
- [ ] Confirm Redis server running: `redis-cli ping` → `PONG`
- [ ] Confirm Redis password auth works: `redis-cli -a vedbhumi ping` → `PONG`
- [ ] Add `REDIS_URL` or fix `redis.js` to use `REDIS_HOST:REDIS_PORT` with password
- [ ] Add `SESSION_TTL_SECONDS=86400` to `.env` and `.env.example`

## Stage 1 — Session Store
- [ ] `sessionService.js` created with `createSession`, `validateSession`, `destroySession`
- [ ] `authMiddleware.js` updated to call `validateSession` after JWT verify
- [ ] `authController.js` calls `createSession` on login
- [ ] `POST /api/auth/logout` route added and working
- [ ] Postman: login → protected request works → logout → same request rejected with 401

## Stage 2 — Client Hardening + Cache Service
- [x] `redis.js` updated with `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- [x] `cacheService.js` created with `get`, `set`, `del`, `delByPattern` (SCAN-based)
- [x] `cacheKeyBuilder.js` created with deterministic key construction
- [x] `playerController.js` refactored — no raw `redisClient` calls remain

## Stage 3 — API Response Cache Middleware
- [x] `cacheMiddleware.js` created as middleware factory
- [x] Applied to `GET /api/players` in routes
- [x] Cache HIT/MISS logged on second/first call
- [x] Only `2xx` responses are cached (error responses not cached)

## Stage 4 — Cache Invalidation
- [x] `cacheService.delByPattern('players:*')` called in create/update/delete
- [x] `KEYS players:*` returns empty after any mutation
- [x] Cache invalidation failure does not affect API response

## Stage 5 — Search Autocomplete
- [x] `searchService.js` created with `buildIndex`, `addToIndex`, `removeFromIndex`, `autocomplete`
- [x] Index built on server start
- [x] `GET /api/players/autocomplete?q=ro` returns matching players
- [x] Create player → appears in autocomplete within same request cycle
- [x] Delete player → removed from autocomplete

## Stage 6 — Job Status Generalization
- [x] `jobTrackerService.js` created
- [x] Uses Hashes (`HSET`, `HGETALL`, `HINCRBY`) to track `total`, `completed`, `failed`
- [x] `playerController.uploadCSV` refactored to use `jobTrackerService`.increment()` and `addError()`
- [ ] `GET /api/jobs/:jobId/status` returns correct progress JSON
- [ ] 404 returned for unknown jobId

## Stage 7 — Request Deduplication
- [x] `idempotencyMiddleware.js` created using `SET NX EX`
- [x] Middleware applied to `POST /api/players` and `PUT /api/players/:id`
- [x] Tested double-click simulation (first succeeds, second returns `429 Duplicate request`) within 10 seconds returns `409`
- [ ] After 10 seconds, request is allowed through again
- [ ] Deduplication failure (Redis down) fails open — request proceeds

## Post-Implementation
- [ ] All Redis keys visible in Redis CLI with correct TTLs
- [ ] No `KEYS *` usage remains in any production code (replaced by SCAN)
- [ ] `.env.example` updated with all Redis-related variables
- [ ] `DECISION_LOG.md` updated with new Redis architectural decisions
- [ ] `PROJECT_ARCHITECTURE.md` updated to reflect Redis layer additions
