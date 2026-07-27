# Organizer Onboarding Redesign — Implementation Task

> **Feature Branch:** `feature/organizer-onboarding-redesign`
> **Reference Docs:** `docs/ORGANIZER_ONBOARDING_ROADMAP.md` · `docs/DECISION_LOG.md` · `docs/PROJECT_ARCHITECTURE.md`
> **Status:** 🟡 In Progress (Stages 1–3 Complete)

---

## Objective

Implement a secure, multi-stage onboarding pipeline separating lead enquiry applications from formal registration and KYC document verification:

```
Application Submitted (Public Phase 1 Lead Form)
        │
        ▼
   PENDING_REVIEW (0)
        │
 ┌──────┴────────┐
 │               │
REJECTED (1)  Approved by Admin
                 │
                 ▼
      REGISTRATION_PENDING (2)  [Email Link Sent]
                 │
                 ▼
     REGISTRATION_COMPLETED (3) [Password + KYC Form Submitted]
                 │
                 ▼
     DOCUMENTS_UNDER_REVIEW (4) [Admin KYC Review]
       │                   │
       │                   │
DOCUMENTS_REJECTED (5)  Verify Docs
       │                   │
       ▼                   ▼
Re-submit Docs        ACTIVE (6) [Account Activated]
```

---

## Form Specifications By Phase

### Phase 1 — Public Application Lead Form (`/signup-organizer`)
- [x] `full_name` * (Full Name)
- [x] `org_name` * (Organization Name)
- [x] `email` * (Email - checked for duplicates against `users` and `organizers`)
- [x] `phone` * (Phone Number)
- [x] `state` * (State)
- [x] `city` * (City)
- [ ] `description` (Brief Description - Optional)
- [ ] `website` (Website - Optional)
- [ ] `referral_code` (Referral Code - Optional)

*(Excluded from Phase 1: Password, Aadhaar, PAN, Address, Documents)*

### Phase 2 — Secure Registration Form (`/organizer/register?token=<raw_token>`)
- [ ] Prefilled & Locked: `full_name`, `email`, `phone`, `state`, `city`
- [ ] Editable: `org_name`
- [ ] `password` * (Password, min 8 chars)
- [ ] `confirm_password` * (Confirm Password)
- [ ] `street_address` * (Street Address)
- [ ] `zone` * (Zone)
- [ ] `pan_number` * (PAN Number)
- [ ] `aadhaar_number` * (Aadhaar Number)
- [ ] `documents` * (KYC Verification Documents)

---

## Business Status Contract Table

| Status | Code | Meaning |
|--------|------|---------|
| `PENDING_REVIEW` | `0` | Initial application lead awaiting admin review |
| `REJECTED` | `1` | Lead application rejected by admin |
| `REGISTRATION_PENDING` | `2` | Approved; registration invite link sent via email |
| `REGISTRATION_COMPLETED` | `3` | Full registration & KYC submitted by organizer |
| `DOCUMENTS_UNDER_REVIEW` | `4` | Admin is reviewing uploaded KYC documents |
| `DOCUMENTS_REJECTED` | `5` | Documents rejected; requires correction/resubmission |
| `ACTIVE` | `6` | Organizer account fully activated (`is_active = 1`) |

---

## Deliverables Checklist

### Database & Models
- [x] Migration `008_create_organizer_invitations.sql`
- [x] Migration `009_update_organizers_for_redesign.sql`
- [x] Migration `010_make_application_fields_not_null.sql`
- [x] `invitationModel.js` — CRUD for `organizer_invitations` table
- [x] `organizerModel.js` — `createOrganizerApplication`, status update helper functions
- [x] `adminModel.js` — status-aware organizer query functions

### Backend Services & Controllers
- [x] `authService.submitOrganizerApplication` — Phase 1 lead application handling
- [x] `authController.applyOrganizer` — Phase 1 HTTP controller
- [x] `validateOrganizerApplication` middleware — validates 6 Phase 1 mandatory fields
- [ ] `invitationService.js` — SHA-256 token hashing & validation logic
- [ ] `emailService.js` — Email transport & HTML template renderer (`inviteEmail.html`, `rejectionEmail.html`)
- [ ] `adminService.approveOrganizer` — Generates token, computes SHA-256 hash, stores in DB, sends email
- [ ] `adminService.rejectOrganizer` — Sets status `REJECTED` (1) with reason
- [ ] `GET /api/organizer-registration/validate?token=` — Pre-fill validation endpoint
- [ ] `POST /api/organizer-registration/submit` — Phase 2 submission & user creation transaction
- [ ] `PATCH /api/admin/organizers/:id/verify-documents` — KYC review endpoint
- [ ] `PATCH /api/admin/organizers/:id/activate` — Final activation endpoint (sets status 6, `is_active = 1`)
- [ ] Login guard in `authService.loginUser` — restricts login to status `ACTIVE` (6) & `is_active = 1`

### Frontend Pages & Components
- [x] `OrganizerSignupForm.tsx` — Streamlined for 6 Phase 1 lead fields
- [x] `SignupOrganizerPage.tsx` — Phase 1 application submission & success card
- [ ] `CompleteRegistrationPage.tsx` — Phase 2 token-validated registration form at `/organizer/register`
- [ ] `OrganizersPage.tsx` — Multi-stage action button matrix & status badges
- [ ] `RejectOrganizerDialog.tsx` — Rejection reason modal
