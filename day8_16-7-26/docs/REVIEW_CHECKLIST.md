# Code Review Checklist

This comprehensive checklist must be completed by a Senior Code Reviewer (or AI Agent) after the completion of *every* implementation stage before merging or finalizing the code.

---

## 🏗️ Architecture
- [ ] Does this change respect the strict N-Tier (Backend) and Component-Based (Frontend) architectures?
- [ ] Is business logic kept completely out of the controller layer?
- [ ] Are all database queries isolated strictly within the Model layer?
- [ ] Does the implementation avoid creating circular dependencies?

---

## 🔄 Regression & API Compatibility
- [ ] Have existing API endpoints remained backward-compatible?
- [ ] Do older frontend clients still function correctly without breaking?
- [ ] Are existing features (like filtering or pagination) unaffected by these new changes?
- [ ] Does the existing login flow still work for regular users (non-organizers)?

---

## 🛡️ Authentication & Authorization
- [ ] Are all new mutating endpoints properly secured with `authMiddleware`?
- [ ] Are admin routes protected with `requireRole('admin')`?
- [ ] Are organizer routes protected with both `requireRole('organizer')` AND `requireApproved`?
- [ ] Is the JWT payload correctly including `role` and `approval_status`?
- [ ] Does the backend correctly reject unapproved organizers at login with `403`?
- [ ] Does the backend correctly reject wrong-role access with `403`?
- [ ] Are passwords or sensitive tokens excluded from all API responses?
- [ ] Are Aadhaar/PAN numbers excluded from general listing responses?

---

## ✅ Validation & Error Handling
- [ ] Is server-side validation rejecting malformed signup-organizer data with `400 Bad Request`?
- [ ] Are duplicate email registrations throwing `409 Conflict`?
- [ ] Are all new controllers wrapping their execution in `try/catch` and passing errors to `next(error)`?
- [ ] Is the Global Error Handler successfully formatting all thrown errors into a standard JSON payload?
- [ ] Is client-side validation correctly preventing submission of invalid organizer signup forms?

---

## 💾 Database Integrity
- [ ] Are ALL SQL queries strictly parameterized to prevent SQL Injection?
- [ ] Has the organizers table migration been created and tested?
- [ ] Does the `approval_status` column correctly default to `0` (pending)?
- [ ] Does the `is_active` column correctly default to `0`?
- [ ] Is the `email` column on `organizers` enforced as UNIQUE?
- [ ] Does the approve/reject logic correctly SET both `approval_status` AND `is_active` together?

---

## 📁 File Handling
- [ ] Are organizer document uploads stored in `/uploads/organizers/documents/`?
- [ ] Are documents stored as a JSON array of relative paths in the `documents` column?
- [ ] Are file type and size constraints applied to document uploads?
- [ ] Are player avatar/gallery uploads unaffected by Day 8 changes?
- [ ] Is the `/uploads` directory still properly served as static files?

---

## 🔑 RBAC Middleware
- [ ] Does `requireRole(role)` correctly check `req.user.role`?
- [ ] Does `requireApproved()` correctly check `req.user.approval_status === 1`?
- [ ] Are both middlewares applied in the correct order (role check BEFORE approval check)?
- [ ] Are middleware error responses consistently formatted as `{ success: false, message: "..." }`?
- [ ] Is the middleware composable and reusable across multiple route files?

---

## ⚡ Performance
- [ ] Are expensive frontend calculations or heavy component renders appropriately memoized?
- [ ] Does the admin organizer listing support status filtering efficiently at the SQL level?
- [ ] Is React Query effectively caching the organizer list and invalidating on approve/reject?

---

## 🔒 Security
- [ ] Are Helmet and CORS middlewares still functioning correctly?
- [ ] Is rate-limiting active on the `/api/auth/signup-organizer` route?
- [ ] Have you ensured no secrets or `.env` files are hardcoded or committed?
- [ ] Are document file paths generated with unique names (e.g., UUID prefix) to prevent path enumeration?

---

## ♿ Accessibility & Frontend UX
- [ ] Can the organizer signup form be navigated using a keyboard?
- [ ] Are all form fields properly associated with `<label>` tags?
- [ ] Is there sufficient color contrast for status badges (Pending/Approved/Rejected)?
- [ ] Does the admin panel clearly communicate action outcomes (e.g., success toast on approve)?

---

## 📱 Responsive Design
- [ ] Does the organizer signup form render correctly on mobile, tablet, and desktop viewports?
- [ ] Does the admin organizer table have horizontal scroll or card layout on mobile?

---

## ⏳ Loading States
- [ ] Is the organizer signup submit button disabled while the form is submitting?
- [ ] Do Approve/Reject buttons show loading state during the PATCH request?
- [ ] Does the admin panel show a loading skeleton while fetching organizer list?

---

## 💥 Edge Cases
- [ ] What happens if an organizer submits the signup form twice with the same email? (Expect 409)
- [ ] What happens if an admin tries to approve an already-approved organizer? (Should be idempotent)
- [ ] What happens if an admin tries to reject an already-rejected organizer? (Should be idempotent)
- [ ] What happens if an organizer tries to login while still pending? (Expect 403)
- [ ] What happens if the documents array is empty on signup? (Should fail validation)
- [ ] What happens if a regular user tries to access `/api/admin/organizers`? (Expect 403)

---

## 🧹 Code Quality (Clean Code)
- [ ] **Duplicate Logic:** Is approval/rejection logic centralized in the service, not duplicated across controller methods?
- [ ] **Dead Code:** Are commented-out blocks removed?
- [ ] **Unused Imports:** Are all unused `import` statements cleaned up?
- [ ] **Type Safety:** Are TypeScript interfaces defined for Organizer and AdminApi response types?
- [ ] **Logging:** Are `console.log()` statements removed from production code?

---

## 💅 Linting & Formatting
- [ ] Does the code pass all ESLint rules without warnings?
- [ ] Is the code formatted consistently?
- [ ] Are naming conventions strictly followed (`camelCase` for backend, `PascalCase` for React components)?

---

## 🚀 Build, Test, & Deployment Readiness
- [ ] **Postman Tests:** Do all RBAC flow scenarios pass? (Signup → Login-Blocked → Admin Approve → Login-Success → Create Player)
- [ ] **Build Success:** Does the frontend build successfully without TypeScript compilation errors?
- [ ] **Migration Run:** Has the organizers table migration been executed on the target database?
- [ ] **Environment Variables:** Are all new env vars documented in `.env.example`?
