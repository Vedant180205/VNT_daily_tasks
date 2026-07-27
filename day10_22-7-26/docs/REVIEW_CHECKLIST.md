# Code Review Checklist

This checklist must be completed after every implementation stage before the code is finalized. It covers the full current system.

---

## 🏗️ Architecture
- [ ] Does the change respect the N-Tier (Backend) and Component-Based (Frontend) architectures?
- [ ] Is business logic kept completely out of the controller layer?
- [ ] Are all database queries isolated strictly within the Model layer?
- [ ] Does the implementation avoid circular dependencies?

---

## 🔄 Regression & API Compatibility
- [ ] Have existing API endpoints remained backward-compatible?
- [ ] Do older frontend clients still function correctly?
- [ ] Are existing features (filtering, pagination, uploads) unaffected?
- [ ] Does the existing login flow still work for regular users (non-organizers)?

---

## 🛡️ Authentication & Authorization
- [ ] Are all new mutating endpoints secured with `authMiddleware`?
- [ ] Are admin routes protected with `requireRole('admin')`?
- [ ] Are organizer routes protected with both `requireRole('organizer')` AND `requireApproved`?
- [ ] Does the JWT payload correctly include `role` and `approval_status`?
- [ ] Does the backend correctly reject unapproved organizers at login with `403`?
- [ ] Are passwords and sensitive tokens excluded from all API responses?
- [ ] Are Aadhaar/PAN numbers excluded from general listing responses?

---

## ✅ Validation & Error Handling
- [ ] Is server-side validation rejecting malformed data with `400 Bad Request`?
- [ ] Are duplicate email registrations throwing `409 Conflict`?
- [ ] Are all controllers wrapping execution in `try/catch` and passing errors to `next(error)`?
- [ ] Is the Global Error Handler formatting all errors into standard JSON?
- [ ] Is client-side validation preventing invalid form submissions?

---

## 💾 Database Integrity
- [ ] Are ALL SQL queries parameterized to prevent SQL Injection?
- [ ] Do all new migrations have correct column types and FK constraints?
- [ ] Are TINYINT flag columns documented with their value meanings in inline SQL comments?
- [ ] Do status flags default to correct values?

---

## 📁 File Handling
- [ ] Are player uploads in `/uploads/players/avatar/` and `/uploads/players/gallery/`?
- [ ] Are organizer documents in `/uploads/organizers/documents/`?
- [ ] Are file type and size constraints applied?
- [ ] Is the `/uploads` directory served as static files?
- [ ] Are only relative paths stored in DB (no binary/base64)?

---

## 🔑 RBAC Middleware
- [ ] Does `requireRole(role)` correctly check `req.user.role`?
- [ ] Does `requireApproved()` correctly check `req.user.approval_status === 1`?
- [ ] Are middleware applied in order: `authMiddleware` → `requireRole` → `requireApproved`?
- [ ] Are middleware error responses formatted as `{ success: false, message: "..." }`?

---

## 📋 Enrollments DataTable

### Database & Seed
- [ ] Has the `enrollments` migration been executed?
- [ ] Does the table have a valid FK to `teams(id)`?
- [ ] Are all flag columns defined as `TINYINT NOT NULL`?
- [ ] Has `seedEnrollments.js` inserted 1000 rows?
- [ ] Do all seeded flag values fall within valid ranges?

### API
- [ ] Does `GET /api/enrollments` return 50 rows by default?
- [ ] Does the response include `pagination: { page, limit, total, totalPages }`?
- [ ] Does `?search=` filter on both `name` AND `phone` with LIKE?
- [ ] Does `?status=1` return only Paid rows?
- [ ] Do combined filters (e.g., `?status=1&invite_type=1&role=1`) work correctly?
- [ ] Does the response include `team_name` from a LEFT JOIN?
- [ ] Are all SQL queries parameterized?
- [ ] Is the route mounted in `app.js` under `/api/enrollments`?

### Performance
- [ ] Does the model use two separate queries (COUNT then paginated SELECT)?
- [ ] Does `LIMIT ? OFFSET ?` pagination work correctly?
- [ ] Does the frontend never fetch more than 50 rows at once (except CSV export)?

### Frontend Table
- [ ] Are all 7 columns rendered: Name, Phone, Team Name, Status, Invite Type, Role, Date?
- [ ] Are flags displayed as readable labels (not raw numbers)?
- [ ] Are Status/Invite Type/Role rendered as styled badges?
- [ ] Are all 4 filter dropdowns working: Status, Invite Type, Role, Team?
- [ ] Do combined filter selections narrow data correctly?
- [ ] Is the search bar debounced?
- [ ] Are all filter states synced to URL search params?
- [ ] Does page refresh preserve active filters?

### CSV Export
- [ ] Does the Export CSV button trigger a download?
- [ ] Does the exported CSV respect current active filters?
- [ ] Is the file named meaningfully (e.g., `enrollments_export.csv`)?

### Action Buttons
- [ ] Is there an Actions column with View, Edit, and Delete per row?
- [ ] Does the View button open a read-only details dialog?
- [ ] Does Delete ask for confirmation before proceeding?

### Flag Consistency
- [ ] Are flag constants defined only in `enrollmentFlags.ts`?
- [ ] Is the same mapping used for both table display and filter dropdown options?
- [ ] Are filter dropdown values passed as integers to the API (not label strings)?

---

## ⚡ Performance
- [ ] Are expensive frontend renders memoized where needed?
- [ ] Is React Query effectively caching repeated param combinations?
- [ ] Are DB filters applied at the SQL level (not post-fetch)?

---

## 🔒 Security
- [ ] Are Helmet and CORS active?
- [ ] Is rate-limiting active on auth routes?
- [ ] Are no secrets or `.env` files committed?
- [ ] Are upload file paths generated with unique names (prevent enumeration)?

---

## ♿ Accessibility & UX
- [ ] Can forms be navigated via keyboard?
- [ ] Are form fields properly associated with `<label>` tags?
- [ ] Is there sufficient color contrast for status badges?
- [ ] Do action buttons communicate outcomes via toast notifications?

---

## 📱 Responsive Design
- [ ] Do tables have horizontal scroll on mobile?
- [ ] Do forms render correctly on mobile/tablet/desktop?

---

## ⏳ Loading States
- [ ] Do submit buttons show loading state during requests?
- [ ] Does the table show a loading skeleton while fetching?
- [ ] Do Approve/Reject/Delete buttons show loading state?

---

## 💥 Edge Cases

### Enrollments
- [ ] Empty filter result → "No results" empty state shown?
- [ ] `?page=999` beyond totalPages → empty data, no error?
- [ ] Invalid flag value (e.g., `?status=5`) → validation error or empty result?
- [ ] No teams in DB → seeder fails gracefully with a clear error message?

### Auth / RBAC
- [ ] Organizer signs up twice with same email → `409 Conflict`?
- [ ] Admin approves an already-approved organizer → idempotent?
- [ ] Organizer logs in while still pending → `403`?
- [ ] Regular user accesses `/api/admin/organizers` → `403`?

---

## 🧹 Code Quality
- [ ] No duplicate logic across controllers/services?
- [ ] No commented-out code blocks?
- [ ] No unused imports?
- [ ] TypeScript interfaces defined for all response and entity types?
- [ ] No `console.log()` in production code?
- [ ] Flag maps imported from `enrollmentFlags.ts`, not hardcoded in JSX?

---

## 🚀 Build & Postman Verification

### Postman – Enrollments API
- [ ] `GET /api/enrollments` → 50 rows, total=1000
- [ ] `GET /api/enrollments?page=2` → rows 51–100
- [ ] `GET /api/enrollments?search=kumar` → name/phone match
- [ ] `GET /api/enrollments?status=1` → only Paid
- [ ] `GET /api/enrollments?status=1&invite_type=1&role=1` → combined filter
- [ ] `GET /api/enrollments?team_id=3` → only team 3
- [ ] `GET /api/enrollments?limit=10&page=5` → custom pagination

### Build
- [ ] Frontend builds without TypeScript errors?
- [ ] All migrations executed on target database?
- [ ] All environment variables documented in `.env.example`?
