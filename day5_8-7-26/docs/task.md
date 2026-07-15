🚀 NEXT TASK – BASIC ROLE BASED ACCESS (RBAC INTRO)
🎯 Objective:
Understand roles + permissions in backend (basic level)
🔥 TASK 1 – ADD ROLE TO USER
Update your users table:
ALTER TABLE users ADD role VARCHAR(20) DEFAULT 'user';
Roles:
• admin
• user
🔥 TASK 2 – CREATE SIMPLE ROLE MIDDLEWARE
Create middleware:
👉 roleMiddleware
Logic:
if (user.role !== 'admin') {
return res.status(403).json({
success: false,
message: "Access denied"
});
}
🔥 TASK 3 – PROTECT APIs
Apply role check:
API Access
DELETE /players/:id admin only
POST /teams admin only
🔥 TASK 4 – TEST USING POSTMAN
Test scenarios:
• Login as normal user → try delete → ❌ 403
• Login as admin → delete → ✅ success
🔥 TASK 5 – UNDERSTAND CURRENT PROJECT RBAC
Read existing files:
• requirePermission.js
• rbacPermissions.js
• jwtAuth.js
🔥 TASK 6 – SIMPLE IMPROVEMENT
Instead of hardcoding:
if (user.role === 'admin')
Try:
const allowedRoles = ['admin'];