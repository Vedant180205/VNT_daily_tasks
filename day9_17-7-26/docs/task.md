🚀 TASK – ENROLLMENTS DATATABLE

🎯 Objective:
Build a full Enrollments management system with:
👉 Database table with flag-based columns
👉 1000 dummy records
👉 Paginated REST API with filters
👉 Frontend DataTable with server-side pagination

---

🔥 TASK 1 – CREATE TABLE (DB)
Create:
enrollments
Columns:
• id
• name
• phone
• team_id (FK → teams)
• status (TINYINT)
• invite_type (TINYINT)
• role (TINYINT)
• enrolled_at

⚠️ IMPORTANT (USE FLAGS)
Instead of strings, use:
status:
  0 = unpaid
  1 = paid
  2 = free
invite_type:
  0 = non-invited
  1 = invited
role:
  1 = batsman
  2 = bowler
  3 = wicketkeeper
  4 = allrounder

---

🔥 TASK 2 – ADD DUMMY DATA
Insert:
👉 1000 records
Use random:
• names
• teams
• roles
• statuses

---

🔥 TASK 3 – API
Create:
• GET /api/enrollments
Must Support:
• Pagination (limit = 50 per page)
• Search (name, phone)
• Filters:
  ● status
  ● invite_type
  ● role
  ● team

---

🔥 TASK 4 – DATATABLE (FRONTEND)
Create page:
👉 /enrollments

Features (MANDATORY)
• Table with columns:
  ● Name
  ● Phone
  ● Team Name
  ● Status
  ● Invite Type
  ● Role
  ● Date

Pagination
👉 50 rows per page

Filters (VERY IMPORTANT)
Add dropdown filters:
• Status (Paid / Unpaid / Free)
• Invite Type
• Role
• Team

---

🔥 TASK 5 – BUTTONS (DATATABLES)
Add:
• Export CSV

---

🔥 TASK 6 – ACTION BUTTONS
Add column:
👉 Actions
Buttons:
• View
• Edit
• Delete

---

🔥 TASK 7 – FORMAT FLAGS (UI)
Convert flags to readable:
Example:
  1 → Paid
  0 → Unpaid

---

🔥 TASK 8 – ADVANCED FILTERING (IMPORTANT)
Combine filters:
👉 Example:
• Paid + Invited + Batsman

---

🔥 TASK 9 – PERFORMANCE (IMPORTANT)
• Use server-side pagination
• Do NOT fetch all 1000 rows at once

---

🔥 TASK 10 – POSTMAN
Test:
• Pagination
• Filters
• Search

📤 SUBMIT
• Table working
• Filters working
• Export working
• Pagination working
