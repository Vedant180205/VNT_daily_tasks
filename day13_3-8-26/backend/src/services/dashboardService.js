const pool = require("../config/db");
const redisClient = require("../config/redis");

class DashboardService {
  async getMasterPayload() {
    const CACHE_KEY = "dashboard:master_payload_v3";
    
    try {
      // 1. Try Cache
      const cached = await redisClient.get(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error("[DashboardService] Redis get error:", err);
    }

    // 2. Fetch all data in parallel
    const [health, kpis, charts, recentActivity, topPlayers] = await Promise.all([
      this.collectHealth(),
      this.collectKpis(),
      this.collectCharts(),
      this.collectRecentActivity(),
      this.collectTopPlayers()
    ]);

    const payload = {
      health,
      kpis,
      charts,
      recentActivity,
      topPlayers
    };

    try {
      // 3. Cache for 5 minutes (300 seconds)
      await redisClient.setEx(CACHE_KEY, 300, JSON.stringify(payload));
    } catch (err) {
      console.error("[DashboardService] Redis set error:", err);
    }

    return payload;
  }

  async collectHealth() {
    let dbConnected = false;
    try {
      await pool.query("SELECT 1");
      dbConnected = true;
    } catch (e) {
      dbConnected = false;
    }

    return {
      status: dbConnected && redisClient.isOpen ? "online" : "degraded",
      redisConnected: redisClient.isOpen,
      dbConnected
    };
  }

  async collectKpis() {
    // Collect counts from various tables
    const [[{ totalPlayers }]] = await pool.query("SELECT COUNT(*) as totalPlayers FROM players");
    const [[{ totalTeams }]] = await pool.query("SELECT COUNT(*) as totalTeams FROM teams");
    const [[{ totalOrganizers }]] = await pool.query("SELECT COUNT(*) as totalOrganizers FROM organizers");
    
    let totalEnrollments = 0;
    try {
        const [[{ count }]] = await pool.query("SELECT COUNT(*) as count FROM enrollments");
        totalEnrollments = count;
    } catch (e) {
        // Table might not exist or be empty
    }

    const [[{ pendingOrganizers }]] = await pool.query("SELECT COUNT(*) as pendingOrganizers FROM organizers WHERE approval_status = 'pending'");
    const totalRevenue = totalEnrollments * 1500;

    return {
      totalPlayers,
      totalTeams,
      totalOrganizers,
      totalEnrollments,
      activeTeams: totalTeams,
      pendingOrganizers,
      totalRevenue,
      playerGrowthPercent: 12.5
    };
  }

  async collectCharts() {
    const query = `
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM players 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    const [rows] = await pool.query(query);
    
    const registrationTrend = rows.map(r => ({
      date: r.date.toISOString().split('T')[0],
      count: r.count
    }));

    return {
      registrationTrend
    };
  }

  async collectRecentActivity() {
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
      WHERE l.is_mft = 1
      ORDER BY l.created_at DESC, l.id DESC
      LIMIT 5
    `;
    
    try {
        const [rows] = await pool.query(query);
        return rows;
    } catch(e) {
        console.error("[DashboardService] collectRecentActivity error:", e);
        return [];
    }
  }

  async collectTopPlayers() {
    const query = `
      SELECT player_id as id, player_full_name as name, 'N/A' as team, total_points as points 
      FROM mvp_players 
      ORDER BY rank_position ASC 
      LIMIT 3
    `;
    try {
        const [rows] = await pool.query(query);
        return rows;
    } catch(e) {
        return [];
    }
  }
}

module.exports = new DashboardService();
