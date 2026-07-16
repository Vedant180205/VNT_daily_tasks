const express = require("express");
const teamController = require("../controllers/teamController");
const validateTeam = require("../middleware/validateTeam");

const router = express.Router();

// Public endpoint to retrieve all teams
router.get("/", teamController.getTeams);

// Endpoint to create a new team
// Note: Kept unprotected for now as requested
router.post("/", validateTeam, teamController.createTeam);

module.exports = router;
