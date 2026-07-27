# Frontend: Organizer Onboarding & Email Templates Editor 🖥️✨

This is the React/Vite/Tailwind frontend for the Player Management application, updated for **Day 10** to provide rich administrative controls and secure onboarding workflows.

---

## ⚡ Day 10 Highlights & Key Components

### 1. Email Templates Manager (`EmailTemplatesPage.tsx`)
A dedicated admin view (`/admin/email-templates`) linked from the sidebar:
* **Interactive List**: Displays all email templates seeded in the database.
* **Inline Editor**: Allows admins to modify the email subject and HTML content directly.
* **Variable Reference Cards**: Lists compile-time parameters (like `{{name}}`, `{{inviteLink}}`, `{{reason}}`) that are supported by the backend compiler.

### 2. Secure Registration Completion (`CompleteRegistrationPage.tsx`)
The user landing page for email invitation links (`/organizer/register`):
* **Security Validation**: Validates the query parameter `?token=...` automatically on page load.
* **Phase 1 Profile Pre-fill**: Feeds existing application data into the UI once the token is verified.
* **Secure Document Submissions**: Multi-file uploader collecting Aadhaar, PAN, and Address Proof files to submit for admin auditing.

### 3. Redesigned Admin Panel (`OrganizersPage.tsx` & `OrganizerDocsDialog.tsx`)
An overhauled administrative console managing the seven-stage organizer status lifecycle:
* **Dynamic Action Rows**: Action buttons adapt based on status (e.g. "Send Invite Link" for `PENDING_REVIEW`, or "Audit Documents" for `DOCUMENTS_UNDER_REVIEW`).
* **Side-by-Side KYC Viewer**: The new `OrganizerDocsDialog` displays high-resolution thumbnails of Aadhaar, PAN, and address documents side-by-side.
* **Manual Verification Dialogs**: Allows admins to accept documents or reject them with custom reasons (which are compiled and sent directly to the organizer's email).

---

## ⚙️ Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *(The dashboard will be active on `http://localhost:5173`)*
