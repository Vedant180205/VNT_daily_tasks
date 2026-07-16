-- Create the organizers profile table linked to the users table
CREATE TABLE IF NOT EXISTS organizers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  org_name VARCHAR(255),
  address TEXT,
  state VARCHAR(100),
  city VARCHAR(100),
  zone VARCHAR(100),
  aadhaar_number VARCHAR(20),
  pan_number VARCHAR(20),
  documents JSON,
  approval_status TINYINT DEFAULT 0,
  is_active TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert the 'Organizer' role into the roles table
INSERT IGNORE INTO roles (id, name) VALUES (4, 'Organizer');

-- Grant permissions to the Organizer role
-- 1: view_players
-- 2: create_players
-- 5: view_teams
-- 6: create_teams
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES 
(4, 1), 
(4, 2), 
(4, 5), 
(4, 6);
