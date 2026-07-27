-- Migration: 013_add_documents_verified_status.sql
-- Description: Sets up 6-status lifecycle (0: PENDING_REVIEW, 1: REJECTED, 2: REGISTRATION_PENDING, 3: REGISTRATION_COMPLETED, 4: DOCUMENTS_VERIFIED, 5: ACTIVE)

UPDATE organizers SET approval_status = 5 WHERE (approval_status = 6 OR approval_status = 5) AND is_active = 1;
UPDATE organizers SET approval_status = 3 WHERE approval_status = 4 AND is_active = 0;

DELETE FROM organizer_statuses;

INSERT INTO organizer_statuses (id, code_name, label, description) VALUES
(0, 'PENDING_REVIEW', 'Pending Review', 'Phase 1 lead application submitted (awaiting admin link dispatch)'),
(1, 'REJECTED', 'Rejected', 'Lead application declined by admin'),
(2, 'REGISTRATION_PENDING', 'Registration Pending', 'Admin approved lead; registration link emailed to applicant'),
(3, 'REGISTRATION_COMPLETED', 'Registration Completed', 'Phase 2 registration & KYC documents submitted by organizer'),
(4, 'DOCUMENTS_VERIFIED', 'Documents Verified', 'KYC documents verified and approved by admin'),
(5, 'ACTIVE', 'Active', 'Admin approved & activated account; user entry created; login enabled');
