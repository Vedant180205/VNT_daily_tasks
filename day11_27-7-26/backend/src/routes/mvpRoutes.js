const express = require("express");
const router = express.Router();
const mvpController = require("../controllers/mvpController");

// Public route to fetch the ranking leaderboard
router.get("/leaderboard", mvpController.getLeaderboard);

// Public route to fetch paginated performance logs
router.get("/logs", mvpController.getPerformanceLogs);

module.exports = router;
