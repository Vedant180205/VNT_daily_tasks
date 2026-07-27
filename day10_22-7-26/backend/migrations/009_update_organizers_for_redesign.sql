-- Update organizers table for Onboarding Redesign
-- approval_status contract:
-- 0 = Pending Review
-- 1 = Approved — Invite Sent
-- 2 = Rejected
-- 3 = Registered — Password Set
-- 4 = Documents Verified
-- 5 = Active — Fully Onboarded

ALTER TABLE organizers
ADD COLUMN rejection_reason TEXT NULL,
MODIFY COLUMN password VARCHAR(255) NULL;
