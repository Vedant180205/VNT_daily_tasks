-- Migration: 011_create_organizer_statuses.sql
-- Description: Creates master lookup table for organizer onboarding statuses

CREATE TABLE IF NOT EXISTS organizer_statuses (
  id TINYINT PRIMARY KEY,
  code_name VARCHAR(50) NOT NULL UNIQUE,
  label VARCHAR(100) NOT NULL,
  description TEXT
);

-- Seed master status reference data
INSERT INTO organizer_statuses (id, code_name, label, description) VALUES
(0, 'PENDING_REVIEW', 'Pending Review', 'Phase 1 lead application submitted (awaiting admin link dispatch)'),
(1, 'REJECTED', 'Rejected', 'Lead application or KYC documents declined by admin'),
(2, 'REGISTRATION_PENDING', 'Registration Pending', 'Admin approved lead; registration link emailed to applicant'),
(3, 'REGISTRATION_COMPLETED', 'Registration Completed', 'Organizer submitted Phase 2 form & uploaded KYC documents'),
(4, 'DOCUMENTS_UNDER_REVIEW', 'Documents Under Review', 'Admin reviewing submitted KYC documents'),
(5, 'DOCUMENTS_REJECTED', 'Documents Rejected', 'Documents rejected; requires resubmission'),
(6, 'ACTIVE', 'Active', 'Admin approved & activated account; users entry created; login enabled')
ON DUPLICATE KEY UPDATE label = VALUES(label), description = VALUES(description);
