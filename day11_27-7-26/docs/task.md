🚀 NEXT TASK – MVP RANKING SYSTEM (DB + SYNC + REDIS OPTIMIZATION)
🎯 Objective:
Build a real leaderboard system like production, with:
👉 Performance logs
👉 Sync script
👉 Ranking system
👉 Redis caching for scalability
🔥 STEP 1 – CREATE TABLES (IMPORTANT – YOU DON’T
HAVE THESE)
Run these queries first:
1️⃣ Performance Logs (Match-wise data)
CREATE TABLE mvp_performance_logs (
id INT AUTO_INCREMENT PRIMARY KEY,
ispl_id VARCHAR(50),
batting_points INT DEFAULT 0,
bowling_points INT DEFAULT 0,
fielding_points INT DEFAULT 0,
is_mft TINYINT DEFAULT 1,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
👉 Stores every match performance separately
2️⃣ Leaderboard Table
CREATE TABLE mvp_players (
id INT AUTO_INCREMENT PRIMARY KEY,
ispl_id VARCHAR(50),
player_full_name VARCHAR(255),
total_points INT DEFAULT 0,
rank_position INT DEFAULT NULL,
is_mft TINYINT DEFAULT 1,
created_at TIMESTAMP,
updated_at TIMESTAMP
);
👉 Final ranking table
3️⃣ Users Table (if not exists)
CREATE TABLE users (
id INT AUTO_INCREMENT PRIMARY KEY,
user_name VARCHAR(50),
first_name VARCHAR(100),
middle_name VARCHAR(100),
surname VARCHAR(100)
);
🔥 STEP 2 – INSERT SAMPLE DATA
👉 Add at least 10 players
👉 Add multiple logs per player
Example:
INSERT INTO mvp_performance_logs
(ispl_id, batting_points, bowling_points, fielding_points)
VALUES
('PL001', 20, 10, 5),
('PL001', 10, 5, 0),
('PL002', 30, 0, 10),
('PL003', 50, 0, 0),
('PL004', 10, 10, 10);
🔥 STEP 3 – CREATE SYNC SCRIPT
Create file:
👉 mvpSync.js
⚙️ LOGIC (VERY IMPORTANT)
1. Fetch logs:
👉 Only where:
is_mft = 1
2. Calculate points:
total = batting + bowling + fielding
3. Group by player:
👉 Sum total per ispl_id
4. Get player name:
From users table:
full_name = first + middle + last
5. Insert / Update leaderboard
👉 If exists → UPDATE
👉 If not → INSERT
6. Generate ranking
👉 Sort:
total_points DESC
Assign:
rank = 1, 2, 3...
🔥 STEP 4 – REDIS (IMPORTANT – REAL PRODUCTION)
Since in real app:
👉 There can be 10,000+ players
Use Redis to cache leaderboard
Key:
mvp:leaderboard
Flow:
1. Check Redis
2. If exists → return cached leaderboard
3. If not → run sync → store in Redis
TTL:
👉 60–120 seconds
After sync:
👉 Update Redis again
🔥 STEP 5 – OPTIONAL API
Create:
GET /api/mvp/leaderboard
Flow:
• Try Redis
• Else DB
• Return ranking
🔥 STEP 6 – OUTPUT
Console log:
• Before sync
• After sync
• Rankings
🔥 IMPORTANT RULES
⚠️ Do NOT store total directly in logs
⚠️ Always calculate dynamically
⚠️ Ranking must update every sync
🔥 BONUS (ADVANCED)
• Handle tie ranks
• Cache top 10 separately
• Add cron job later