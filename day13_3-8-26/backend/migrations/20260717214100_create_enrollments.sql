CREATE TABLE enrollments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  phone       VARCHAR(20)  NOT NULL,
  team_id     INT          NOT NULL,
  status      TINYINT      NOT NULL DEFAULT 0,  -- 0=unpaid, 1=paid, 2=free
  invite_type TINYINT      NOT NULL DEFAULT 0,  -- 0=non-invited, 1=invited
  role        TINYINT      NOT NULL,             -- 1=batsman, 2=bowler, 3=wicketkeeper, 4=allrounder
  enrolled_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);
