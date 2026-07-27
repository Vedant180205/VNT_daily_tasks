const pool = require("../config/db");
const mvpModel = require("../models/mvpModel");
const redisClient = require("../config/redis");

class MvpRankingService {
  /**
   * Core synchronization engine for the MVP Leaderboard.
   * Pipeline: Load Logs -> Aggregate -> Validate -> Transaction (Upsert)
   * (Ranking Generation and Redis Refresh are added in subsequent stages)
   */
  async syncLeaderboard(isMft = 1) {
    let connection;
    try {
      console.log(`[MVP Sync] Starting synchronization for is_mft=${isMft}...`);
      
      // 1. Load Logs
      const rawLogs = await mvpModel.getAllLogs(isMft);
      console.log(`[MVP Sync] Loaded ${rawLogs.length} raw performance logs.`);

      // 2. Aggregate
      const aggregatedMap = new Map();
      
      for (const log of rawLogs) {
        // 3. Validate
        if (
          log.batting_points < 0 || 
          log.bowling_points < 0 || 
          log.fielding_points < 0
        ) {
          console.warn(`[MVP Sync] Skipping corrupted log for Player ID ${log.player_id}: Negative points detected.`);
          continue;
        }

        const playerId = log.player_id;
        const totalLogPoints = log.batting_points + log.bowling_points + log.fielding_points;

        if (!aggregatedMap.has(playerId)) {
          aggregatedMap.set(playerId, {
            player_id: playerId,
            player_full_name: log.player_full_name,
            total_points: 0,
            is_mft: isMft
          });
        }
        
        const playerStats = aggregatedMap.get(playerId);
        playerStats.total_points += totalLogPoints;
      }

      const playersToUpsert = Array.from(aggregatedMap.values());
      console.log(`[MVP Sync] Aggregated data for ${playersToUpsert.length} unique players.`);

      if (playersToUpsert.length === 0) {
        console.log(`[MVP Sync] No valid data to sync. Exiting.`);
        return { success: true, message: "No data to sync." };
      }

      // 4. Generate Rank (Standard Competition Ranking)
      playersToUpsert.sort((a, b) => b.total_points - a.total_points);

      let currentRank = 1;
      let previousPoints = -1;
      let rankStep = 1;

      for (const player of playersToUpsert) {
        if (player.total_points === previousPoints) {
          player.rank_position = currentRank;
          rankStep++;
        } else {
          currentRank = currentRank + (previousPoints === -1 ? 0 : rankStep);
          player.rank_position = currentRank;
          rankStep = 1;
        }
        previousPoints = player.total_points;
      }

      console.log(`[MVP Sync] Generated ranks for ${playersToUpsert.length} players.`);

      // 5. Transaction (Upsert)
      connection = await pool.getConnection();
      await connection.beginTransaction();

      console.log(`[MVP Sync] Upserting leaderboard table...`);
      await mvpModel.upsertLeaderboard(connection, playersToUpsert);

      await connection.commit();
      console.log(`[MVP Sync] Database transaction committed successfully.`);

      // 5. Redis Invalidation & Regeneration (Cache-Aside)
      try {
        console.log(`[MVP Sync] Refreshing Redis cache keys...`);
        const TTL_SECONDS = 120;
        
        // Define API payload contract
        const leaderboardData = playersToUpsert.map(p => ({
          rank: p.rank_position,
          playerId: p.player_id,
          name: p.player_full_name,
          points: p.total_points
        }));

        const top10Data = leaderboardData.slice(0, 10);
        
        const fullPayload = JSON.stringify({
          success: true,
          lastSynced: new Date().toISOString(),
          data: leaderboardData
        });

        const top10Payload = JSON.stringify({
          success: true,
          lastSynced: new Date().toISOString(),
          data: top10Data
        });

        // Explicit invalidation
        await redisClient.del("mvp:leaderboard");
        await redisClient.del("mvp:leaderboard:top10");

        // Proactive cache warming
        await redisClient.set("mvp:leaderboard", fullPayload, { EX: TTL_SECONDS });
        await redisClient.set("mvp:leaderboard:top10", top10Payload, { EX: TTL_SECONDS });
        
        console.log(`[MVP Sync] Redis cache refreshed successfully (TTL: ${TTL_SECONDS}s).`);
      } catch (redisError) {
        console.warn(`[MVP Sync] Redis refresh failed (falling back to DB on next read):`, redisError.message);
      }

      return {
        success: true,
        stats: {
          logsProcessed: rawLogs.length,
          playersUpdated: playersToUpsert.length
        }
      };

    } catch (error) {
      if (connection) {
        await connection.rollback();
        console.error(`[MVP Sync] Transaction rolled back due to error.`);
      }
      console.error(`[MVP Sync] Synchronization failed:`, error);
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * Retrieves the leaderboard for the API.
   * Checks Redis first. If miss, fetches from DB, caches, and returns.
   */
  async getLeaderboard() {
    try {
      // 1. Check Cache
      const cached = await redisClient.get("mvp:leaderboard");
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (redisErr) {
      console.warn(`[MVP API] Redis read failed, falling back to DB:`, redisErr.message);
    }

    // 2. Cache Miss - Fetch from DB
    const query = `
      SELECT 
        rank_position as \`rank\`, 
        player_id as playerId, 
        player_full_name as name, 
        total_points as points,
        last_synced_at
      FROM mvp_players 
      WHERE is_mft = 1 
      ORDER BY rank_position ASC, total_points DESC
    `;
    const [rows] = await pool.query(query);

    const payload = {
      success: true,
      lastSynced: rows.length > 0 ? rows[0].last_synced_at : new Date().toISOString(),
      data: rows.map(r => ({
        rank: r.rank,
        playerId: r.playerId,
        name: r.name,
        points: r.points
      }))
    };

    // 3. Proactively warm cache for next requests
    try {
      await redisClient.set("mvp:leaderboard", JSON.stringify(payload), { EX: 120 });
    } catch (redisErr) {
      console.warn(`[MVP API] Redis write failed:`, redisErr.message);
    }

    return payload;
  }
}

module.exports = new MvpRankingService();
