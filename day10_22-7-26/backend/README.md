# Backend: Organizer Onboarding & Email Notification Engine 🛡️📧

This is the Express backend for the Player Management application, updated for **Day 10** to manage secure multi-stage organizer registration, database-driven transactional emails, and dynamic RBAC checks.

---

## 🚀 Key Features & Services

### 1. The Email Service (`emailService.js` & `emailTemplateModel.js`)
* **Nodemailer SMTP Transporter**: Connects to SMTP servers using standard TLS settings configured in `.env`.
* **Zero-Setup Simulation Mode**: If SMTP variables are missing from `.env`, email dispatch logs are printed directly to the terminal, and nodemailer defaults to Ethereal mock configurations. This makes starting the application simple for local developers.
* **Database-Driven HTML Rendering**: Email subjects and HTML bodies are fetched from the `email_templates` database table at runtime. Variable interpolation (e.g. replacing `{{name}}` or `{{inviteLink}}` inside the HTML) is compiled dynamically on-the-fly.

### 2. Cryptographic Invitation Service (`invitationService.js`)
* Generates secure tokens: `crypto.randomBytes(32).toString('hex')`.
* Database security: Stores a SHA-256 hash of the token (`token_hash`) inside the `organizer_invitations` table. The raw token is only sent in the email, securing invitations against DB read breaches.
* Expiration enforcement: Restricts invitation lifespans (default: 72 hours).

### 3. Database Migrations (008 to 014)
* **`008`**: Creates the `organizer_invitations` table storing hashed tokens, expiry dates, and usage timestamps.
* **`009` to `013`**: Alters the `organizers` table, makes password fields nullable, consolidates status columns, and updates status values (`0` to `6`).
* **`014`**: Creates the `email_templates` table and seeds default HTML templates for:
  - `REGISTRATION_LINK` (Phase 2 secure invitation)
  - `REJECTION` (Application feedback)
  - `ACTIVATION` (Onboarding complete notification)

---

## ⚙️ API Endpoints

### 🔑 Authentication & Public Registration
* `POST /api/auth/organizers/apply`: Phase 1 lead form submission (creates organizer profile in `PENDING_REVIEW` status).
* `GET /api/auth/organizer-registration/validate`: Validates invite token, returns pre-fill user info if valid.
* `POST /api/auth/organizer-registration/submit`: Consumes token, creates `users` credentials, updates organizer status, and saves documents.

### 👑 Admin Workflows (Protected)
* `POST /api/admin/organizers/:id/approve`: Approves lead, generates cryptographic token, inserts invitation, and sends the registration email.
* `POST /api/admin/organizers/:id/reject`: Rejects lead, updates status to `REJECTED`, and dispatches rejection email with feedback.
* `POST /api/admin/organizers/:id/verify-docs`: Approves or rejects uploaded KYC documents.
* `POST /api/admin/organizers/:id/activate`: Toggles organizer's active state (`is_active = 1` or `0`) and dispatches account activation email.

### ✉️ Email Template Manager (Protected)
* `GET /api/admin/email-templates`: Fetches all seeded templates.
* `PUT /api/admin/email-templates/:id`: Saves modifications to subject lines and HTML layouts.

---

## ⚙️ Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Rename `.env.example` to `.env` and fill in the SMTP mailer details to send real emails:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password
   EMAIL_FROM="VNT Tournament Admin <your-email@gmail.com>"
   FRONTEND_URL=http://localhost:5173
   ```
   *Note: If these fields are omitted, the backend will print email dispatch simulation logs to the console.*

3. **Database Preparation**
   Run the schema migration scripts to build the invitations, templates, and updated status columns:
   ```bash
   npm run migrate
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

5. **Start the Background Worker (Optional for Queue processing)**
   ```bash
   npm run worker
   ```
