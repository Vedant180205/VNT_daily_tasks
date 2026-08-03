# Implementation Roadmap: Organizer Onboarding Redesign

> **Reference Documents:**
> - Feature task: `docs/task.md`
> - Architecture: `docs/PROJECT_ARCHITECTURE.md`
> - Decisions: `docs/DECISION_LOG.md`
> - Audit: `docs/PROJECT_AUDIT.md`
>
> **Guiding Principle:** Every stage must leave the existing system fully functional.
> No stage should break authentication, player management, enrollment features, or any other module.
> Each stage is independently testable and independently deployable.

---

## Complete Business Lifecycle State Machine

```
Application Submitted (Public Lead Form)
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

### Business Status Contract Table

| Status | Code | Meaning | Form / Action |
|--------|------|---------|---------------|
| `PENDING_REVIEW` | `0` | Initial application lead awaiting admin review | Public Phase 1 Form |
| `REJECTED` | `1` | Lead application rejected by admin | Admin Reject Action |
| `REGISTRATION_PENDING` | `2` | Approved; registration invite link sent via email | Admin Approve Action |
| `REGISTRATION_COMPLETED` | `3` | Full registration & KYC submitted by organizer | Phase 2 Registration Form |
| `DOCUMENTS_UNDER_REVIEW` | `4` | Admin is reviewing uploaded KYC documents | Admin Detail Review |
| `DOCUMENTS_REJECTED` | `5` | Documents rejected; requires correction/resubmission | Admin Reject Docs Action |
| `ACTIVE` | `6` | Organizer account fully activated (`is_active = 1`) | Admin Activate Action |

---

## Form Field Specifications By Phase

### Phase 1 — Application Form (Public Lead Enquiry)
Accessible to anyone at `/signup-organizer` or `/apply-organizer`.

**Mandatory Fields:**
- Full Name * (`full_name`)
- Organization Name * (`org_name`)
- Email * (`email`) — checked for duplicates against `users` and `organizers`
- Phone Number * (`phone`)
- State * (`state`)
- City * (`city`)

**Optional Lead Fields:**
- Brief Description (`description`)
- Website (`website`)
- Referral Code (`referral_code`)

**Excluded Fields (NOT collected at Phase 1):**
- Password, Aadhaar Number, PAN Number, Street Address, Zone, Verification Documents.

---

### Phase 2 — Registration & KYC Form (Link Accessible Only)
Accessible only via unique token link: `/organizer/register?token=<raw_token>`.

**Pre-filled & Locked Fields (from Phase 1 Lead Data):**
- Full Name (`full_name`) — Locked
- Email (`email`) — Locked
- Phone Number (`phone`) — Locked
- State (`state`) — Read-only
- City (`city`) — Read-only
- Organization Name (`org_name`) — Editable if needed

**New Mandatory Fields Collected:**
- Password * (`password`, min 8 chars)
- Confirm Password * (`confirm_password`)
- Street Address * (`street_address`)
- Zone * (`zone`)
- PAN Number * (`pan_number`, 10-char regex)
- Aadhaar Number * (`aadhaar_number`, 12-digit regex)
- Verification Documents * (`documents`, ID/GST/Registration proof files)

---

## Security Model & Token Architecture

1. **Token Generation (Server-Side):**
   - Admin approves application -> Server generates 64-char cryptographically secure token (`crypto.randomBytes(32).toString('hex')`).
   - Server computes `token_hash = SHA-256(raw_token)`.
   - Stores `(organizer_id, token_hash, expires_at, used_at = NULL)` in `organizer_invitations`. Raw token is **never** stored in the database.

2. **Email Delivery:**
   - Link sent to applicant: `https://site.com/organizer/register?token=<raw_token>`

3. **Phase 2 Pre-fill Validation (`GET /api/organizer-registration/validate?token=<raw_token>`):**
   - Frontend extracts `token` parameter from URL on page load.
   - Calls backend validation endpoint.
   - Backend computes `SHA-256(raw_token)` and looks up `organizer_invitations`:
     - Token hash exists?
     - `expires_at > NOW()`?
     - `used_at IS NULL`?
     - Application status is `REGISTRATION_PENDING` (2)?
   - If valid, returns Phase 1 lead data (`full_name`, `org_name`, `email`, `phone`, `state`, `city`) to render pre-filled form.

4. **Phase 2 Form Submission (`POST /api/organizer-registration/submit`):**
   - Payload: `{ token, password, street_address, zone, pan_number, aadhaar_number, documents }`.
   - Backend **re-validates token** by computing `SHA-256(token)` again before making DB mutations.
   - Hashes password with `bcrypt` (10 rounds).
   - Atomically inside a DB transaction:
     - Creates row in `users` table.
     - Updates `organizers` table with `user_id`, full profile data, and status `REGISTRATION_COMPLETED` (3).
     - Sets `token_hash` record `used_at = NOW()`.

5. **Login Security Check (`POST /api/auth/login`):**
   - Email exists? -> Password correct? -> `is_active == 1` AND `approval_status == 6 (ACTIVE)`?
   - If not active, returns `403 Forbidden`:
     > *"Your account is not yet activated. Current Status: Documents under verification."*

---

## Stage Overview & Implementation Progress

| Stage | Name | Complexity | Risk to Existing System | Status |
|-------|------|------------|------------------------|--------|
| 1 | Database Design | Low | None — additive only | Completed |
| 2 | Application Model | Low | None — new files only | Completed |
| 3 | Application APIs | Low | Minimal — Phase 1 endpoint updated | Completed |
| 4 | Admin Review APIs | Medium | Low — approval & rejection endpoints | In Progress |
| 5 | Registration Token System | Medium | None — SHA-256 token hashing & email service | Pending |
| 6 | Registration Form UI | Medium | None — Phase 2 `/organizer/register` page | Pending |
| 7 | Organizer Creation Transaction | High | Medium — atomic user & profile creation | Pending |
| 8 | Document Verification | Low | None — KYC review & status transitions | Pending |
| 9 | Account Activation & Login Guard | Low | Low — login check updated to status 6 | Pending |
| 10 | Frontend Integration | Medium | Low — admin multi-status UI | Pending |
| 11 | Testing Pass | Low | None — E2E validation | Pending |
| 12 | Cleanup & Documentation | Low | None — final docs update | Pending |

---

## Stage 4 — Admin Review APIs (Detailed Specification)

### Objective
Implement the backend endpoints for Admin Review:
1. `PATCH /api/admin/organizers/:id/approve` — Approves application, generates token, computes SHA-256 hash, stores in `organizer_invitations`, sets status `REGISTRATION_PENDING` (2).
2. `PATCH /api/admin/organizers/:id/reject` — Rejects application with reason, sets status `REJECTED` (1).

### Files Expected to Change
| File | Action | Reason |
|------|--------|--------|
| `backend/src/services/adminService.js` | **MODIFY** | Implement approve and reject business functions |
| `backend/src/controllers/adminController.js` | **MODIFY** | Implement approve and reject HTTP handlers |
| `backend/src/routes/adminRoutes.js` | **MODIFY** | Register `PATCH /organizers/:id/approve` and `PATCH /organizers/:id/reject` |
| `backend/src/services/invitationService.js` | **CREATE** | SHA-256 token generation and DB storage |

---

## Stage 5 — Registration Token System (Detailed Specification)

### Objective
Build the token validation endpoint and email dispatch service.
1. `GET /api/organizer-registration/validate?token=<raw_token>` — Validates raw token via SHA-256 lookup, returns pre-fill lead data.
2. `emailService.js` — Sends registration email with link `https://site.com/organizer/register?token=<raw_token>`.

---

## Stage 6 — Registration Form UI (Detailed Specification)

### Objective
Build `frontend/src/pages/CompleteRegistrationPage.tsx` at route `/organizer/register`.
- Extracts `token` from URL.
- On mount: calls `GET /api/organizer-registration/validate?token=...`.
- If invalid/expired: renders Error view with "Link Expired / Invalid" message.
- If valid: renders pre-filled locked fields (`full_name`, `email`, `phone`, `state`, `city`) and collects `password`, `confirm_password`, `street_address`, `zone`, `pan_number`, `aadhaar_number`, `documents`.

---

## Stage 7 — Organizer Creation Transaction (Detailed Specification)

### Objective
Implement `POST /api/organizer-registration/submit`.
- Re-validates `SHA-256(token)` against DB.
- Hashes password using `bcrypt`.
- Starts DB transaction:
  - Creates user in `users` table.
  - Updates `organizers` row with full profile & KYC data, sets status to `REGISTRATION_COMPLETED` (3).
  - Marks invitation token `used_at = NOW()`.
- Responds with success message.

---

## Stage 8 — Document Verification (Detailed Specification)

### Objective
Admin KYC Review endpoints:
1. `PATCH /api/admin/organizers/:id/verify-documents` — Sets status `DOCUMENTS_UNDER_REVIEW` (4) / Verified.
2. `PATCH /api/admin/organizers/:id/reject-documents` — Sets status `DOCUMENTS_REJECTED` (5) with correction reason.

---

## Stage 9 — Account Activation & Login Guard (Detailed Specification)

### Objective
1. `PATCH /api/admin/organizers/:id/activate` — Sets status `ACTIVE` (6) and `is_active = 1`.
2. Update `authService.loginUser`:
   - Checks if organizer status == `ACTIVE` (6) and `is_active == 1`.
   - If not active, returns `403` with exact current status message.
