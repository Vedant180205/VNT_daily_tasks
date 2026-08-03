const mvpRankingService = require("../services/mvpRankingService");
const mvpModel = require("../models/mvpModel");

/**
 * Controller for MVP Ranking endpoints.
 */
class MvpController {
  
  /**
   * GET /api/mvp/leaderboard
   * Fetches the aggregated ranking leaderboard.
   */
  async getLeaderboard(req, res) {
    try {
      const payload = await mvpRankingService.getLeaderboard();
      res.status(200).json(payload);
    } catch (error) {
      console.error("[MvpController] Failed to get leaderboard:", error);
      res.status(500).json({ success: false, message: "Internal server error while fetching leaderboard." });
    }
  }

  /**
   * GET /api/mvp/last-sync
   * Fetches the latest execution state of the MVP sync job.
   */
  async getLastSync(req, res) {
    try {
      const lastSync = await mvpModel.getLastSyncLog();
      if (!lastSync) {
        return res.status(200).json({
          success: true,
          message: "No sync jobs have run yet.",
          data: null
        });
      }
      res.status(200).json({
        success: true,
        data: {
          lastSync: lastSync.completed_at || lastSync.started_at,
          playersProcessed: lastSync.total_players,
          status: lastSync.status,
          executionTimeMs: lastSync.execution_ms,
          errorMessage: lastSync.error_message
        }
      });
    } catch (error) {
      console.error("[MvpController] Failed to get last sync:", error);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  }
  /**
   * GET /api/mvp/logs
   * Fetches paginated performance logs.
   */
  async getPerformanceLogs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const data = await mvpModel.getPaginatedLogs(offset, limit);
      const total = await mvpModel.getTotalLogsCount();
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      });
    } catch (error) {
      console.error("[MvpController] Failed to get performance logs:", error);
      res.status(500).json({ success: false, message: "Internal server error while fetching logs." });
    }
  }

}
module.exports = new MvpController();
