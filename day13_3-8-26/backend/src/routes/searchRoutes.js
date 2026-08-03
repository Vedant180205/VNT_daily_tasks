const express = require("express");
const searchController = require("../controllers/searchController");

const router = express.Router();

// Autocomplete route (can be public or protected, leaving public for ease of use in autocomplete dropdowns, or you can add authMiddleware if preferred)
router.get("/", searchController.autocomplete);

module.exports = router;
