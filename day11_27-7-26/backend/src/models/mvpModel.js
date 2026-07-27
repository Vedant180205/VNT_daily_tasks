const pool = require("../config/db");

class MvpModel {
  /**
   * Fetches all performance logs joined with player profiles.
   * Filters by is_mft flag.
   */
  async getAllLogs(isMft = 1) {
    const query = `
      SELECT 
        l.player_id,
        p.name as player_full_name,
        l.batting_points,
        l.bowling_points,
        l.fielding_points
      FROM mvp_performance_logs l
      JOIN players p ON l.player_id = p.id
      WHERE l.is_mft = ?
    `;
    const [rows] = await pool.query(query, [isMft]);
    return rows;
  }

  /**
   * Upserts aggregated totals into the mvp_players table.
   * Receives a transaction connection to ensure atomicity.
   */
  async upsertLeaderboard(connection, playersToUpsert) {
    if (!playersToUpsert || playersToUpsert.length === 0) return;

    // Using INSERT ... ON DUPLICATE KEY UPDATE to efficiently upsert records.
    const query = `
      INSERT INTO mvp_players 
        (player_id, player_full_name, total_points, is_mft, rank_position)
      VALUES ?
      ON DUPLICATE KEY UPDATE 
        player_full_name = VALUES(player_full_name),
        total_points = VALUES(total_points),
        is_mft = VALUES(is_mft),
        rank_position = VALUES(rank_position),
        last_synced_at = CURRENT_TIMESTAMP
    `;
    
    // Convert array of objects to array of arrays for bulk insert
    const values = playersToUpsert.map(p => [
      p.player_id, 
      p.player_full_name, 
      p.total_points, 
      p.is_mft,
      p.rank_position
    ]);

    await connection.query(query, [values]);
  }

  /**
   * Fetches paginated performance logs joined with player profiles.
   */
  async getPaginatedLogs(offset, limit, isMft = 1) {
    const query = `
      SELECT 
        l.id,
        l.player_id,
        p.name as player_full_name,
        l.batting_points,
        l.bowling_points,
        l.fielding_points,
        l.created_at
      FROM mvp_performance_logs l
      JOIN players p ON l.player_id = p.id
      WHERE l.is_mft = ?
      ORDER BY l.created_at DESC, l.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [isMft, parseInt(limit), parseInt(offset)]);
    return rows;
  }

  /**
   * Fetches the total count of performance logs.
   */
  async getTotalLogsCount(isMft = 1) {
    const query = `
      SELECT COUNT(*) as total 
      FROM mvp_performance_logs 
      WHERE is_mft = ?
    `;
    const [rows] = await pool.query(query, [isMft]);
    return rows[0].total;
  }
}

module.exports = new MvpModel();
