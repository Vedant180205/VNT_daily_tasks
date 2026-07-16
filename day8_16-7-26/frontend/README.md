# Frontend: Player Management Dashboard 🖥️

This is the React/Vite frontend for the Player Management application.

## ⚡ Day 8 Updates: RBAC & Complex Workflows
The frontend has been massively expanded to support Role-Based Access Control and multi-step forms:

- **Organizer Registration Flow**: A comprehensive form with regex validation for PAN and Aadhaar, integrated with a custom `DocumentUploader` that accurately enforces file limits.
- **Admin Dashboards**: A dedicated `PendingOrganizersDialog` allows Admins to view applications, inspect uploaded documents, and Approve/Reject users.
- **Global Permission Handling**: `react-query` mutations (`useMutations.ts`) have been upgraded to gracefully intercept `403 Forbidden` responses from the backend, instantly translating them into beautiful Toast error alerts.
- **Dynamic UI States**: The `DashboardHeader` now fetches and renders the user's specific role badge directly from the backend profile.

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
