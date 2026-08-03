-- Drop the existing organizers table and recreate it with the revised schema
DROP TABLE IF EXISTS organizers;

CREATE TABLE organizers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
