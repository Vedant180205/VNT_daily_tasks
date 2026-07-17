# Backend: Enrollments API 🛡️

This is the Node/Express backend for the Player Management application, updated for **Day 9** to handle large-scale enrollment data.

## 🚀 Key Features
- **Dynamic SQL Query Builder:** The `enrollmentModel.js` intelligently constructs `WHERE` clauses on the fly based on which filters (status, invite_type, role, team_id, search query) are provided.
- **Dual Query Pagination:** Safely handles large datasets by firing a `COUNT(*)` query for pagination logic, followed immediately by a `LIMIT / OFFSET` data query.
- **Seeding System:** Added a dedicated `seedEnrollments.js` script capable of rapidly generating 1,000 randomized dummy records with relational integrity to existing teams.
- **Strict Data Sanitization:** The `enrollmentService.js` actively casts and validates all query strings into integers to prevent SQL injection in the dynamic query builder.

## ⚙️ Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Preparation**
   Run the migration to create the `enrollments` table:
   ```bash
   npm run migrate
   ```
   Seed the table with 1,000 records:
   ```bash
   node scripts/seeders/seedEnrollments.js
   ```

3. **Start the Server**
   ```bash
   npm run dev
   ```
