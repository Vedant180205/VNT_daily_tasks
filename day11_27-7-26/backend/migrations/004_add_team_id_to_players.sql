-- Note: MySQL does not natively support "ADD COLUMN IF NOT EXISTS" for older versions.
-- This migration assumes it is only run once successfully.
ALTER TABLE players
ADD COLUMN team_id INT NULL,
ADD CONSTRAINT fk_team
    FOREIGN KEY (team_id)
    REFERENCES teams(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
