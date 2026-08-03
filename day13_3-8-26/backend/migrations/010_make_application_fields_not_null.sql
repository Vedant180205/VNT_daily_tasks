-- Backfill any legacy NULL values for application fields before setting NOT NULL
UPDATE organizers SET state = 'N/A' WHERE state IS NULL;
UPDATE organizers SET city = 'N/A' WHERE city IS NULL;
UPDATE organizers SET org_name = 'N/A' WHERE org_name IS NULL;
UPDATE organizers SET phone = '0000000000' WHERE phone IS NULL;

-- Enforce NOT NULL on Phase 1 mandatory application fields
ALTER TABLE organizers
MODIFY COLUMN org_name VARCHAR(255) NOT NULL,
MODIFY COLUMN phone VARCHAR(20) NOT NULL,
MODIFY COLUMN state VARCHAR(100) NOT NULL,
MODIFY COLUMN city VARCHAR(100) NOT NULL;
