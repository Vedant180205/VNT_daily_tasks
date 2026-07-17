const express = require("express");
const authController = require("../controllers/authController");
const { validateRegister, validateLogin, validateOrganizerSignup } = require("../middleware/validateAuth");
const authMiddleware = require("../middleware/authMiddleware");
const { organizerUploads } = require("../middleware/uploadMiddleware");

const router = express.Router();

// Maps the POST /register endpoint to the register controller
// Uses validateRegister middleware for checking name, email, and password requirements
router.post("/register", validateRegister, authController.register);

// Maps the POST /login endpoint to the login controller
// Uses validateLogin middleware for checking email and password requirements
router.post("/login", validateLogin, authController.login);

// Endpoint to fetch the current user profile (Protected route)
router.get("/me", authMiddleware, authController.getMe);

// Endpoint for Organizer Signup (multipart/form-data)
router.post("/signup-organizer", organizerUploads, validateOrganizerSignup, authController.signupOrganizer);

module.exports = router;
