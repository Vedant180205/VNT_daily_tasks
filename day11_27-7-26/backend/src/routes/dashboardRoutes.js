const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

// Use authMiddleware for all dashboard routes
router.use(authMiddleware);

// GET /api/dashboard
router.get("/", dashboardController.getDashboardData);

module.exports = router;
