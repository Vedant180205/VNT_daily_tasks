# Architectural Decision Log

This document tracks all significant architectural decisions made during the implementation of the project.
For every future decision, append a new entry using the template below.

---

## Decision: Dynamic RBAC (Role-Permissions) vs Hardcoded Role Checks

**Date:** 2026-07-16

**Stage:** Day 8 – RBAC Implementation

**Problem:**
The initial plan called for hardcoding role checks in middleware (e.g., equireRole('organizer')). However, the existing database already implements a more advanced RBAC structure with oles, permissions, and ole_permissions tables. We needed to decide whether to ignore these tables and stick to simple string matching or integrate fully with the existing dynamic permission system.

**Possible Options:**
- Option A: Hardcode role names in middleware (equireRole('organizer')).
- Option B: Use the existing database tables and implement dynamic permission checking (equirePermission('create_players')).

**Chosen Option:**
Option B – Dynamic permission checking.

**Reason:**
Using the existing ole_permissions table is significantly more scalable and secure. Instead of tying a route explicitly to an 'organizer' role, we tie the route to a specific capability (e.g., create_players). This allows future flexibility; if an 'Admin' also needs to create players, we simply add the permission to the Admin role in the database, without ever touching the source code.

**Trade-offs:**
- Slightly more complex middleware implementation (requires fetching permissions).
- To avoid DB hits on every request, permissions may need to be cached in Redis or embedded in the JWT.

**Affected Files:**
- ackend/src/middleware/requirePermission.js (Replaces equireRole.js)
- ackend/src/routes/playerRoutes.js
- ackend/src/routes/teamRoutes.js

---

## Decision: User + Profile Pattern for Organizers

**Date:** 2026-07-16

**Stage:** Day 8 – RBAC Implementation

**Problem:**
Organizers require significantly more data fields (Aadhaar, PAN, organization name, documents) than standard users, and undergo an approval workflow.

**Possible Options:**
- Option A: Add all organizer fields as NULL-able columns to the users table.
- Option B: Create a separate organizers table with its own authentication.
- Option C: User + Profile Pattern. users table handles auth, organizers table holds profile data linked via user_id.

**Chosen Option:**
Option C – User + Profile Pattern.

**Reason:**
This keeps the core authentication logic (login, JWT generation) completely unified and clean. The users table stays lightweight. The organizers table acts strictly as extended profile data, which is queried only when necessary (e.g., during the approval check or admin panel view).

**Affected Files:**
- ackend/migrations/[timestamp]_day8_rbac_setup.sql
- ackend/src/services/authService.js
- ackend/src/models/userModel.js
- ackend/src/models/organizerModel.js

---
