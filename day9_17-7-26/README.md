# Day 9: Enrollments Management & Advanced DataTable 🚀

This documentation provides an overview of the **Day 9** implementation, which focused on creating a full-stack, paginated, and heavily filtered data table for tracking player enrollments.

---

## 🏗️ 1. Architecture & The Objective

**The Problem:** The application needed a way to manage thousands of player "enrollments" with highly specific attributes (payment status, invite type, and game role). Fetching all this data at once would cripple the frontend, and filtering it client-side would be inaccurate and slow.

**The Solution:** We implemented a server-side paginated architecture with a complex dynamic SQL `WHERE` clause builder on the backend, paired with a React Query-driven DataTable on the frontend that synchronizes its state directly with the URL parameters.

### Key Achievements:
1. **Schema Design:** Created the `enrollments` table utilizing `TINYINT` columns for `status`, `invite_type`, and `role` to optimize storage and indexing.
2. **Data Seeding:** Created a Node.js seeder script that reliably generated 1,000 randomized dummy records with valid foreign keys to existing teams.
3. **Advanced Filtering:** Built a `GET /api/enrollments` endpoint supporting combined `AND` filters across multiple columns, alongside a wildcard `LIKE` search for names and phone numbers.

---

## 🖥️ 2. Frontend Implementation

The frontend received a brand new `/enrollments` page featuring:
- **URL-Driven State:** Using `react-router-dom`'s `useSearchParams`, all filters (Status, Invite, Role, Team, Search Query) are bound to the URL. This ensures deep-linking works flawlessly and the back button behaves as expected.
- **Server-Side Pagination:** The `useEnrollments` React Query hook passes the `page` and `limit` to the API, displaying exactly 50 rows per page out of the 1,000+ total records.
- **Dynamic Badge Formatting:** Raw `TINYINT` values are beautifully mapped to colored UI badges (e.g., `0 -> Unpaid (Red)`, `1 -> Paid (Green)`) using a centralized dictionary mapping.
- **CSV Export:** Implemented a direct-to-CSV download feature that respects the currently applied filters.

---

## 🔒 3. Backend Implementation

The backend safely handles large datasets through the `enrollmentModel`:
- **Dual Query Execution:** The model executes a `COUNT(*)` query to determine total pagination pages, followed by a `SELECT ... LIMIT X OFFSET Y` to fetch the specific slice of data.
- **Input Sanitization:** The `enrollmentService` strictly casts and validates all query parameters before they reach the model, ensuring SQL injection vectors are neutralized.

---

## ⚙️ 4. Setup & Local Configuration

Follow these steps to run the complete stack locally:

### 1. Backend Configuration
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Run the migrations to create the table: `npm run migrate`
4. Seed the database with 1000 dummy records: `node scripts/seeders/seedEnrollments.js`
5. Start the backend server: `npm run dev`

### 2. Frontend Configuration
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`
