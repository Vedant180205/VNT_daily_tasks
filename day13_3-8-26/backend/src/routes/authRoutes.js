const express = require("express");
const authController = require("../controllers/authController");
const { validateRegister, validateLogin, validateOrganizerApplication } = require("../middleware/validateAuth");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Maps the POST /register endpoint to the register controller
router.post("/register", validateRegister, authController.register);

// Maps the POST /login endpoint to the login controller
router.post("/login", validateLogin, authController.login);

// Endpoint to fetch the current user profile (Protected route)
router.get("/me", authMiddleware, authController.getMe);

// Logout route (Protected route)
router.post("/logout", authMiddleware, authController.logout);

// Dedicated endpoint for Phase 1 Organizer Lead Application Form
router.post("/apply-organizer", validateOrganizerApplication, authController.applyOrganizer);

// Alias endpoint for backward compatibility
router.post("/signup-organizer", validateOrganizerApplication, authController.applyOrganizer);

module.exports = router;
