const express = require("express");
const router = express.Router();
const mvpController = require("../controllers/mvpController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/rbacMiddleware");

// Protected route to fetch the ranking leaderboard
router.get("/leaderboard", authMiddleware, mvpController.getLeaderboard);

// Protected route to fetch paginated performance logs
router.get("/logs", authMiddleware, requirePermission("view_activity_logs"), mvpController.getPerformanceLogs);

// Protected route to fetch last sync info
router.get("/last-sync", authMiddleware, mvpController.getLastSync);

module.exports = router;
