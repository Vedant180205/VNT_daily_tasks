const express = require("express");
const teamController = require("../controllers/teamController");
const validateTeam = require("../middleware/validateTeam");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/rbacMiddleware");

const cacheMiddleware = require("../middleware/cacheMiddleware");

const router = express.Router();

// Protected endpoint to retrieve all teams
router.get("/", authMiddleware, requirePermission("view_teams"), cacheMiddleware(60), teamController.getTeams);

// Endpoint to create a new team
router.post("/", authMiddleware, requirePermission("create_teams"), validateTeam, teamController.createTeam);

// Endpoint to delete a team
router.delete("/:id", authMiddleware, requirePermission("delete_teams"), teamController.deleteTeam);

module.exports = router;
