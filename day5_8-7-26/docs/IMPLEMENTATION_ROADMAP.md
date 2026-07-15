# RBAC Implementation Roadmap

Given the current architecture outlined in `PROJECT_ARCHITECTURE.md` and the objectives in `task.md`, this roadmap outlines the process of implementing a normalized Role-Based Access Control (RBAC) system.

## Stage 1: Database Schema Modification (RBAC Foundation)
**Objective**: Transition from hardcoded authorization (or no authorization) to a normalized schema using `users`, `roles`, `permissions`, and `role_permissions` tables.
**Files Expected To Change**:
- `/backend/migrations/migrations.js` (or similar database setup script)
- `/backend/src/models/userModel.js`
**Reason Those Files Need Modification**: The database needs new tables to support normalized RBAC. The `users` table needs to drop the plain-text role (if any) and add a `role_id` foreign key.
**Dependencies**: None.
**Potential Risks**: Modifying the `users` table could break existing login/registration flows if not carefully handled.
**Validation Needed**: Run migration scripts and verify tables are created correctly via a MySQL client. Ensure the foreign keys constrain properly.
**Estimated Complexity**: Medium
**Status**: Pending

## Stage 2: Seed Initial RBAC Data
**Objective**: Populate the database with default roles (Admin, Sub Admin, User) and base permissions (view_players, create_players, edit_players, etc.), and map them via `role_permissions`.
**Files Expected To Change**:
- `/backend/migrations/seed.js` (or appended to `migrations.js`)
**Reason Those Files Need Modification**: To programmatically insert required seed data so the application is usable immediately upon startup.
**Dependencies**: Stage 1 (Schema must exist).
**Potential Risks**: Incorrect mapping of `role_permissions` could accidentally grant administrative rights to read-only roles.
**Validation Needed**: Query the database to ensure the `Admin` role is linked to all permissions, and the `User` role is read-only.
**Estimated Complexity**: Low
**Status**: Pending

## Stage 3: Authentication Enhancement (JWT Update)
**Objective**: Update the login process to fetch the user's `role_id` and include it in the signed JWT payload.
**Files Expected To Change**:
- `/backend/src/models/userModel.js`
- `/backend/src/services/authService.js`
- `/backend/src/middleware/authMiddleware.js`
**Reason Those Files Need Modification**: `userModel.js` must join the `roles` table on login. `authService.js` must inject `role_id` into the JWT. `authMiddleware.js` must attach the decoded role data to `req.user`.
**Dependencies**: Stage 1 & 2.
**Potential Risks**: If the JWT signature changes or breaks, existing logged-in users will be abruptly signed out or experience 401 Unauthorized errors.
**Validation Needed**: Log in via Postman and decode the JWT to verify the `role_id` is present.
**Estimated Complexity**: Medium
**Status**: Pending

## Stage 4: Authorization Middleware
**Objective**: Create a robust `requirePermission(permissionName)` middleware that checks if the authenticated user's role owns the requested permission.
**Files Expected To Change**:
- `/backend/src/middleware/requirePermission.js` (NEW)
- `/backend/src/models/roleModel.js` (NEW - to query role permissions)
**Reason Those Files Need Modification**: To decouple authorization logic from controllers. A dedicated middleware will intercept requests and query the database (or a cache) to verify access rights.
**Dependencies**: Stage 3.
**Potential Risks**: Querying the database on every protected route could introduce a performance bottleneck.
**Validation Needed**: Unit test the middleware directly, ensuring it correctly passes `next()` for valid permissions and returns `403 Forbidden` for invalid ones.
**Estimated Complexity**: High
**Status**: Pending

## Stage 5: Route Protection integration
**Objective**: Apply the `requirePermission` middleware to all relevant API endpoints.
**Files Expected To Change**:
- `/backend/src/routes/playerRoutes.js`
- `/backend/src/routes/teamRoutes.js`
**Reason Those Files Need Modification**: To replace any existing basic auth checks or open routes with explicit permission constraints (e.g., mapping `DELETE /api/players/:id` to `requirePermission('delete_players')`).
**Dependencies**: Stage 4.
**Potential Risks**: Accidentally locking out valid users by applying the wrong permission string to a route.
**Validation Needed**: Manual API testing. Ensure the routes require the correct explicit permissions.
**Estimated Complexity**: Low
**Status**: Pending

---

## Implementation Order
1. **Stage 1**: Database Schema Modification (Foundation)
2. **Stage 2**: Seed Initial RBAC Data (Configuration)
3. **Stage 3**: Authentication Enhancement (JWT Update)
4. **Stage 4**: Authorization Middleware (Core Logic)
5. **Stage 5**: Route Protection integration (Routing)

## Final Verification Plan
Once all stages are complete, the following end-to-end verification must be executed:
1. **Database Reset**: Start from a fresh database state and run the new migrations and seeds.
2. **User Creation**: Register or manually seed three accounts (Admin, Sub Admin, User).
3. **Admin Verification**: Authenticate as Admin. Attempt to Create, Read, Update, and Delete players and teams. **Expected: All succeed.**
4. **Sub Admin Verification**: Authenticate as Sub Admin. Attempt to Create/Update players. **Expected: Succeed.** Attempt to Delete a player or team. **Expected: 403 Forbidden.**
5. **User Verification**: Authenticate as User. Attempt to View players. **Expected: Succeed.** Attempt to Create/Update/Delete anything. **Expected: 403 Forbidden.**
6. **Error Format Check**: Ensure all 403 responses strictly adhere to the standard format:
   ```json
   {
     "success": false,
     "message": "Access denied"
   }
   ```
