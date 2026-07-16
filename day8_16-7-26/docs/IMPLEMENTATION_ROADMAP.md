# Implementation Roadmap: RBAC – Organizer Signup + Admin Approval Flow

This document breaks down the implementation of the Day 8 RBAC task into logical, independently testable stages. Each stage is ordered to minimize regression risk and ensure proper dependency management.

---

## Stage 1: Database Foundation (Roles, Permissions & Organizer Profile)

**Objective:**
Leverage the existing users, oles, permissions, and ole_permissions tables. Create the organizers profile table and seed the necessary role and permissions.

**Files Expected To Change:**
- ackend/migrations/[timestamp]_day8_rbac_setup.sql (New)

**Database Operations:**
1. **Create Organizers Table (Profile Pattern):**
`sql
CREATE TABLE organizers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  org_name VARCHAR(255),
  address TEXT,
  state VARCHAR(100),
  city VARCHAR(100),
  zone VARCHAR(100),
  aadhaar_number VARCHAR(20),
  pan_number VARCHAR(20),
  documents JSON,
  approval_status TINYINT DEFAULT 0,
  is_active TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`

2. **Seed Organizer Role & Permissions:**
`sql
-- Assuming roles table has id auto_increment
INSERT INTO roles (name) VALUES ('Organizer'); 
-- Assuming Organizer gets ID 4.
-- Give Organizer permissions: view_players(1), create_players(2), view_teams(5), create_teams(6)
INSERT INTO role_permissions (role_id, permission_id) VALUES 
(4, 1), (4, 2), (4, 5), (4, 6);
`

**Dependencies:** None.

**Estimated Complexity:** Low

**Status:** Pending

---

## Stage 2: Organizer Signup API (POST /api/auth/signup-organizer)

**Objective:**
Build the organizer signup backend endpoint implementing the User+Profile pattern, with document upload support.

**Files Expected To Change:**
- ackend/src/routes/authRoutes.js
- ackend/src/controllers/authController.js
- ackend/src/services/authService.js (Modify – add signupOrganizer)
- ackend/src/models/userModel.js (Modify – insert user with role_id)
- ackend/src/models/organizerModel.js (New)
- ackend/src/middleware/uploadMiddleware.js
- ackend/src/middleware/validateAuth.js

**Logic:**
1. Validate incoming multipart/form-data.
2. Hash password using bcrypt.
3. Get the Organizer role ID from the oles table.
4. **Transaction Start:**
   - Insert into users (name, email, password, role_id). Get insertId as user_id.
   - Insert into organizers (user_id, org_name, documents, ...).
5. **Transaction Commit.**

**Dependencies:** Stage 1.

**Estimated Complexity:** Medium

**Status:** Pending

---

## Stage 3: Unified Login & Approval Restriction

**Objective:**
Update the existing login API to block unapproved organizers while keeping auth unified.

**Files Expected To Change:**
- ackend/src/services/authService.js

**Logic:**
1. During login, fetch the user and their associated role name (via JOIN).
2. If role is 'Organizer', fetch their profile from the organizers table.
3. If pproval_status !== 1, throw 403 Forbidden ("Account not approved yet").
4. Embed ole and pproval_status (if applicable) into the signed JWT.

**Dependencies:** Stage 1, Stage 2.

**Estimated Complexity:** Low

**Status:** Pending

---

## Stage 4: Dynamic RBAC Middleware

**Objective:**
Build middleware to dynamically check permissions against the ole_permissions table (or JWT payload).

**Files Expected To Change:**
- ackend/src/middleware/requirePermission.js (New)
- ackend/src/middleware/requireApproved.js (New)

**requirePermission Logic:**
Rather than hardcoding equireRole('organizer'), we should check if the user's role has the specific permission (e.g., create_players). This is more scalable.

**Dependencies:** Stage 3.

**Estimated Complexity:** Medium

**Status:** Pending

---

## Stage 5: Admin Panel APIs

**Objective:**
Build admin-only endpoints for listing, approving, and rejecting organizers.

**Files Expected To Change:**
- ackend/src/routes/adminRoutes.js (New)
- ackend/src/controllers/adminController.js (New)
- ackend/src/services/adminService.js (New)
- ackend/src/app.js (Mount routes)

**Endpoints:**
- GET /api/admin/organizers?status=pending
- PATCH /api/admin/organizers/:id/approve
- PATCH /api/admin/organizers/:id/reject

**Dependencies:** Stage 4.

**Estimated Complexity:** Medium

**Status:** Pending

---

## Stage 6: Route Restriction Enforcement

**Objective:**
Apply permission and approval middlewares to player and team creation routes.

**Files Expected To Change:**
- ackend/src/routes/playerRoutes.js
- ackend/src/routes/teamRoutes.js

**Example:**
`javascript
router.post('/', authMiddleware, requirePermission('create_players'), requireApproved, upload, validatePlayer, playerController.createPlayer);
`

**Dependencies:** Stage 4.

**Estimated Complexity:** Low

**Status:** Pending

---

## Stage 7: Frontend – Organizer Signup Page (/signup-organizer)

*(UI Implementation remains unchanged from previous plan)*

---

## Stage 8: Frontend – Admin Organizers Panel (/admin/organizers)

*(UI Implementation remains unchanged from previous plan)*
