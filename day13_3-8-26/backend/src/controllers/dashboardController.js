const dashboardService = require("../services/dashboardService");

class DashboardController {
  async getDashboardData(req, res) {
    try {
      const payload = await dashboardService.getMasterPayload();
      res.status(200).json({
        success: true,
        data: payload
      });
    } catch (error) {
      console.error("[DashboardController] Failed to get dashboard data:", error);
      res.status(500).json({ success: false, message: "Internal server error while fetching dashboard data." });
    }
  }
}

module.exports = new DashboardController();
