🚀 NEXT TASK – RBAC (ORGANIZER SIGNUP + APPROVAL FLOW)

🎯 Objective:
Build a real-world RBAC flow with:
👉 Organizer signup
👉 Admin approval
👉 Role-based access

---

🔥 TASK 1 – ORGANIZER SIGNUP PAGE
Create page:
👉 /signup-organizer

Fields:
• Full Name
• Email
• Phone
• Password / Confirm Password
• Organization Name
• Address
• State / City / Zone
• Aadhaar Number
• PAN Number
• Documents upload (multiple files)

---

🔥 TASK 2 – BACKEND API
Create:
• POST /api/auth/signup-organizer

When organizer signs up:
Save in DB:
  role = "organizer"
  approval_status = 0  // pending
  is_active = 0

IMPORTANT:
👉 Organizer CANNOT login until approved

---

🔥 TASK 3 – ADMIN PANEL API (VERY IMPORTANT)
Create API:
• GET /api/admin/organizers?status=pending

Admin should see:
• Organizer details
• Documents
• Organization info

---

🔥 TASK 4 – APPROVE / REJECT API
Create:
• PATCH /api/admin/organizers/:id/approve
• PATCH /api/admin/organizers/:id/reject

Logic:
If approved:
  approval_status = 1
  is_active = 1

If rejected:
  approval_status = 2
  is_active = 0

---

🔥 TASK 5 – LOGIN RESTRICTION
Update login API:
👉 If approval_status !== 1, return:
{
  "success": false,
  "message": "Account not approved yet"
}

---

🔥 TASK 6 – ROLE BASED ACCESS
Only approved organizers can:
• Create players
• Create teams

Middleware:
  requireRole('organizer')
  requireApproved()

---

🔥 TASK 7 – FRONTEND (ADMIN PANEL)
Create page:
👉 /admin/organizers

Features:
• List pending organizers
• View details
• Approve / Reject buttons
