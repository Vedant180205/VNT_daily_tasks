CREATE TABLE IF NOT EXISTS mvp_performance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    match_reference VARCHAR(100),
    batting_points INT DEFAULT 0,
    bowling_points INT DEFAULT 0,
    fielding_points INT DEFAULT 0,
    is_mft TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_player_mft (player_id, is_mft),
    INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS mvp_players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL UNIQUE,
    player_full_name VARCHAR(255) NOT NULL,
    total_points INT DEFAULT 0,
    rank_position INT DEFAULT NULL,
    is_mft TINYINT DEFAULT 1,
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_total_points (total_points DESC),
    INDEX idx_created_at (created_at)
);
