# Frontend: Enrollments DataTable 🖥️

This is the React/Vite frontend for the Player Management application.

## ⚡ Day 9 Updates: Enrollments & Advanced DataTable
The frontend has been updated to include a robust, high-performance datatable for managing 1,000+ player enrollments:

- **Server-Side Pagination:** Integrated `@tanstack/react-query` to fetch data in chunks of 50, ensuring snappy performance regardless of database size.
- **URL-Synced Filters:** The Search Bar, Status Dropdown, Invite Dropdown, Role Dropdown, and Team Dropdown all sync their state directly to the URL parameters using `useSearchParams`.
- **Dynamic Badge UI:** Raw database flags (e.g., `status = 1`) are automatically parsed into beautiful, colored UI pills (e.g., green "Paid" badge) via centralized dictionary mappings.
- **CSV Export:** Includes a direct "Export CSV" feature that honors the currently active filters and downloads a cleanly formatted `.csv` file.

## ⚙️ Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *(The app will launch on `http://localhost:5173`)*
