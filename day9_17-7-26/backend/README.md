# Backend: Player Management API 🛡️

This is the Node/Express backend for the Player Management application, upgraded for **Day 8** with enterprise RBAC and complex workflows.

## 🚀 Key Features
- **Dynamic RBAC Middleware**: The new `rbacMiddleware.js` intercepts requests and queries the MySQL `role_permissions` table. Routes are strictly protected using `requirePermission('create_players')` or `requireRole('Admin')`.
- **Multi-Stage Authentication**: The `authService.js` now handles an isolated `organizers` table, preventing login until an Admin patches their `approval_status`.
- **Document Management**: Utilizing `multer` to handle multiple file uploads (PAN, Aadhaar) specifically for the Organizer onboarding flow.
- **JWT Enhancements**: The JWT payload now seamlessly injects the user's resolved `role` to empower frontend visibility.

## ⚙️ Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Ensure your `.env` is configured with your MySQL and Redis credentials.

3. **Start the Server**
   ```bash
   npm run dev
   ```
