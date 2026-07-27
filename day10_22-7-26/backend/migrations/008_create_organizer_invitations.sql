-- Create organizer_invitations table for one-time registration tokens
CREATE TABLE IF NOT EXISTS organizer_invitations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizer_id INT NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES organizers(id) ON DELETE CASCADE,
  INDEX idx_organizer_id (organizer_id)
);
