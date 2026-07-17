# Day 8: Role-Based Access Control (RBAC) & Admin Approval Workflows 🚀

This documentation provides a comprehensive overview of the **Day 8** implementation, which focused on enterprise-level authentication, authorization, and complex multi-role workflows.

---

## 🏗️ 1. Architecture & The RBAC Strategy

**The Problem:** The application needed to support multiple types of users (Admins, Sub Admins, Organizers, Users) with strict restrictions on what they can view, create, edit, or delete. Additionally, we needed a dedicated onboarding flow for "Organizers" that requires manual Admin approval before they are granted system access.

**The Solution:** We implemented a robust **Role-Based Access Control (RBAC)** engine tied to the MySQL database, along with a multi-step approval workflow.

### The Flow:
1. **Organizer Signup:** Organizers submit a comprehensive application (including PAN, Aadhaar, and document uploads) via `/signup-organizer`. They are stored in an isolated `organizers` table with an `approval_status = 0 (pending)`.
2. **Login Gatekeeping:** If a pending organizer attempts to log in, the API gracefully intercepts the request and returns a `403 Forbidden: Account not approved yet`.
3. **Admin Dashboard:** Admins have a dedicated UI to review pending applications and their uploaded documents.
4. **Approval Execution:** When an Admin approves the organizer, the backend automatically provisions them into the primary `users` table with the `Organizer` role assigned.

---

## 🔒 2. Backend RBAC Middleware

We built a highly dynamic `rbacMiddleware.js` that completely secures the API.

- **`requireRole(role)`**: Strictly checks if the user's role matches (e.g., locking the approval endpoints to `Admin` only).
- **`requirePermission(permission)`**: Dynamically queries the `role_permissions` join table in the database to verify if the user's assigned role has the specific permission (e.g., `delete_players`, `create_teams`).

If a user lacks permission, the middleware blocks the execution and returns a `403 Forbidden` response.

---

## 🖥️ 3. Frontend Integration

The frontend was upgraded to seamlessly handle these new multi-role capabilities:
- **Smart Login Routing:** The login page now offers a sleek dialog allowing users to choose whether to sign in/register as a standard Player or apply as an Organizer.
- **Global Error Interception:** API Mutations (Create, Update, Delete) are wired to catch `403` responses globally, displaying clean Toast notifications (`"Permission denied"`) whenever a user attempts an unauthorized action.
- **Role Visibility:** The `DashboardHeader` dynamically fetches and displays the user's current role badge, providing clear contextual awareness of their permissions.

---

## ⚙️ 4. Setup & Local Configuration

Follow these steps to run the complete stack locally:

### 1. Backend Configuration
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Ensure your MySQL database is seeded with the latest `roles`, `permissions`, and `role_permissions` schema.
4. Start the backend server: `npm run dev`

### 2. Frontend Configuration
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`

---

## 📮 5. Testing the RBAC Flow

1. Navigate to `http://localhost:5173/login` and click **Sign up**.
2. Select **Organizer** and fill out the application (including documents).
3. Attempt to log in with the new credentials -> You will be blocked (`Account not approved yet`).
4. Log in as an **Admin**.
5. Click the **Pending Organizers** button in the dashboard toolbar, review the application, and click **Approve**.
6. Log back in as the Organizer -> You now have access, but restricted permissions!
