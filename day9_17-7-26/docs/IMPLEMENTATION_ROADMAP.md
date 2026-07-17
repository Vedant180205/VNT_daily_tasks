# Implementation Roadmap: Enrollments DataTable

This document breaks the Enrollments task into independently testable stages, ordered by dependency. Complete each stage fully before moving to the next.

---

## Stage 1: Database – Create `enrollments` Table

**Objective:** Create the migration SQL and run it against the database.

**Files:**
- `backend/migrations/[timestamp]_create_enrollments.sql` *(New)*

**SQL:**
```sql
CREATE TABLE enrollments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  phone       VARCHAR(20)  NOT NULL,
  team_id     INT          NOT NULL,
  status      TINYINT      NOT NULL DEFAULT 0,  -- 0=unpaid, 1=paid, 2=free
  invite_type TINYINT      NOT NULL DEFAULT 0,  -- 0=non-invited, 1=invited
  role        TINYINT      NOT NULL,             -- 1=batsman, 2=bowler, 3=wicketkeeper, 4=allrounder
  enrolled_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);
```

**Verify:** Run `DESCRIBE enrollments;` — confirm all columns and FK exist.

**Dependencies:** `teams` table must already exist.

**Complexity:** Low | **Status:** Completed

---

## Stage 2: Seed – Insert 1000 Dummy Records

**Objective:** Populate the table with realistic randomized data.

**Files:**
- `backend/scripts/seeders/seedEnrollments.js` *(New)*

**Logic:**
1. Fetch all existing team IDs from the `teams` table.
2. Loop 1000 times: pick a random `team_id`, generate a random name and phone number, assign random `status` (0–2), `invite_type` (0–1), and `role` (1–4).
3. Bulk insert using batched `VALUES` in a single `pool.query()` call for performance.

**Verify:** `SELECT COUNT(*) FROM enrollments;` → 1000.

**Dependencies:** Stage 1.

**Complexity:** Low | **Status:** Completed

---

## Stage 3: Backend API – `GET /api/enrollments`

**Objective:** Build a server-side paginated, multi-filter enrollment API.

**Files:**
- `backend/src/routes/enrollmentRoutes.js` *(New)*
- `backend/src/controllers/enrollmentController.js` *(New)*
- `backend/src/services/enrollmentService.js` *(New)*
- `backend/src/models/enrollmentModel.js` *(New)*
- `backend/src/app.js` *(Modify – mount `/api/enrollments`)*

**Supported Query Params:** `page`, `limit`, `search` (name/phone LIKE), `status`, `invite_type`, `role`, `team_id`

**Model Pattern:**
```javascript
// Build dynamic WHERE clause
const conditions = [], params = [];
if (search)                    { conditions.push('(e.name LIKE ? OR e.phone LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
if (status !== undefined)      { conditions.push('e.status = ?');      params.push(Number(status)); }
if (invite_type !== undefined) { conditions.push('e.invite_type = ?'); params.push(Number(invite_type)); }
if (role !== undefined)        { conditions.push('e.role = ?');        params.push(Number(role)); }
if (team_id)                   { conditions.push('e.team_id = ?');     params.push(team_id); }
const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

// Query 1: total count
const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM enrollments e ${whereClause}`, params);

// Query 2: paginated data
const offset = (page - 1) * limit;
const [rows] = await pool.query(
  `SELECT e.*, t.name AS team_name FROM enrollments e LEFT JOIN teams t ON e.team_id = t.id ${whereClause} ORDER BY e.enrolled_at DESC LIMIT ? OFFSET ?`,
  [...params, limit, offset]
);
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": { "page": 1, "limit": 50, "total": 1000, "totalPages": 20 }
}
```

**Verify:** Test all filter combinations in Postman (see Stage 6).

**Dependencies:** Stage 1.

**Complexity:** Medium | **Status:** Completed

---

## Stage 4: Frontend Hook + API Layer

**Objective:** Create the Axios API call, React Query hook, and flag constants.

**Files:**
- `frontend/src/api/enrollmentApi.ts` *(New)*
- `frontend/src/hooks/useEnrollments.ts` *(New)*
- `frontend/src/utils/enrollmentFlags.ts` *(New)*

**`enrollmentFlags.ts`:**
```typescript
export const STATUS_LABELS: Record<number, string> = { 0: 'Unpaid', 1: 'Paid', 2: 'Free' };
export const INVITE_LABELS: Record<number, string> = { 0: 'Non-Invited', 1: 'Invited' };
export const ROLE_LABELS:   Record<number, string> = { 1: 'Batsman', 2: 'Bowler', 3: 'Wicketkeeper', 4: 'All-rounder' };
```

**`useEnrollments` logic:**
- Reads all filter params from URL Search Params.
- Passes them as the React Query key — any change triggers a fresh fetch.
- Returns `{ data, pagination, isLoading, isError }`.
- Exposes an `exportCSV()` function that fetches the full filtered dataset (no pagination limit) and triggers a browser download.

**Dependencies:** Stage 3.

**Complexity:** Low | **Status:** Completed

---

## Stage 5: Frontend – `/enrollments` Page + DataTable

**Objective:** Build the complete Enrollments page with table, filters, pagination, CSV export, and action buttons.

**Files:**
- `frontend/src/pages/EnrollmentsPage.tsx` *(New)*
- `frontend/src/components/enrollments/EnrollmentsTable.tsx` *(New)*
- `frontend/src/components/enrollments/EnrollmentViewDialog.tsx` *(New)*
- `frontend/src/components/enrollments/EnrollmentEditDialog.tsx` *(New)*
- `frontend/src/components/enrollments/EnrollmentDeleteDialog.tsx` *(New)*
- `frontend/src/App.tsx` *(Modify – add `/enrollments` route)*

**Page Features:**
- Search bar (debounced 300ms, synced to URL `?search=`).
- Four dropdown filters: Status, Invite Type, Role, Team — all synced to URL params.
- All combinations of filters work together (AND logic).
- Table columns: Name, Phone, Team Name, Status (badge), Invite Type (badge), Role (badge), Date, Actions.
- Actions column: View, Edit, Delete buttons per row.
- Pagination: 50 rows/page, Prev/Next controls, current page + total pages display.
- Export CSV button: downloads full filtered dataset as `enrollments_export.csv`.

**Flag Display:**
Uses constants from `enrollmentFlags.ts` — never hardcoded in JSX.

**URL State:**
All state in URL: `?search=&status=&invite_type=&role=&team_id=&page=1`
Refreshing the page preserves all active filters.

**Dependencies:** Stage 4.

**Complexity:** High | **Status:** Completed

---

## Stage 6: Postman – API Verification

**Objective:** Verify all API scenarios before marking the task complete.

**Test Cases:**

| # | Request | Expected Result |
|---|---------|----------------|
| 1 | `GET /api/enrollments` | 50 rows, `total: 1000`, `totalPages: 20` |
| 2 | `GET /api/enrollments?page=2` | Rows 51–100 |
| 3 | `GET /api/enrollments?search=kumar` | Name/phone-matched subset |
| 4 | `GET /api/enrollments?status=1` | Only Paid rows |
| 5 | `GET /api/enrollments?invite_type=0` | Only Non-Invited rows |
| 6 | `GET /api/enrollments?role=1` | Only Batsman rows |
| 7 | `GET /api/enrollments?status=1&invite_type=1&role=1` | Paid + Invited + Batsman combined |
| 8 | `GET /api/enrollments?team_id=3` | Only team 3 enrollments |
| 9 | `GET /api/enrollments?limit=10&page=5` | Custom pagination |

**Dependencies:** Stage 3.

**Complexity:** Low | **Status:** Pending
