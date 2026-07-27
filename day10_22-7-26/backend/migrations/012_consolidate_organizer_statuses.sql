-- Migration: 012_consolidate_organizer_statuses.sql
-- Description: Consolidates statuses 3 & 4 into single state (3: DOCUMENTS_UNDER_REVIEW) and adjusts status numbers (0..5)

-- 1. Update existing organizers records to match new consolidated status numbers
UPDATE organizers SET approval_status = 3 WHERE approval_status = 4;
UPDATE organizers SET approval_status = 4 WHERE approval_status = 5;
UPDATE organizers SET approval_status = 5 WHERE approval_status = 6;

-- 2. Reset and populate master lookup table organizer_statuses
DELETE FROM organizer_statuses;

INSERT INTO organizer_statuses (id, code_name, label, description) VALUES
(0, 'PENDING_REVIEW', 'Pending Review', 'Phase 1 lead application submitted (awaiting admin link dispatch)'),
(1, 'REJECTED', 'Rejected', 'Lead application declined by admin'),
(2, 'REGISTRATION_PENDING', 'Registration Pending', 'Admin approved lead; registration link emailed to applicant'),
(3, 'DOCUMENTS_UNDER_REVIEW', 'Documents Under Review', 'Phase 2 registration & KYC documents submitted by organizer; awaiting final admin approval'),
(4, 'DOCUMENTS_REJECTED', 'Documents Rejected', 'KYC documents declined by admin; resubmission needed'),
(5, 'ACTIVE', 'Active', 'Admin approved & activated account; user entry created; login enabled');
