CREATE TABLE IF NOT EXISTS mvp_sync_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    status VARCHAR(50) DEFAULT 'RUNNING',
    total_players INT DEFAULT 0,
    logs_processed INT DEFAULT 0,
    execution_ms INT DEFAULT NULL,
    error_message TEXT NULL
);
