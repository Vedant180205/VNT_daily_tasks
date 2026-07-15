const express = require("express");
const teamController = require("../controllers/teamController");
const validateTeam = require("../middleware/validateTeam");
const authMiddleware = require("../middleware/authMiddleware");
const requirePermission = require("../middleware/requirePermission");

const router = express.Router();

// Endpoint to retrieve all teams
router.get("/", authMiddleware, requirePermission('view_teams'), teamController.getTeams);

// Endpoint to create a new team
router.post("/", authMiddleware, requirePermission('create_teams'), validateTeam, teamController.createTeam);

module.exports = router;
