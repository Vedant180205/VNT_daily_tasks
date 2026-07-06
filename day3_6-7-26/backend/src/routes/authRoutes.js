const express = require("express");
const authController = require("../controllers/authController");
const { validateRegister, validateLogin } = require("../middleware/validateAuth");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Maps the POST /register endpoint to the register controller
// Uses validateRegister middleware for checking name, email, and password requirements
router.post("/register", validateRegister, authController.register);

// Maps the POST /login endpoint to the login controller
// Uses validateLogin middleware for checking email and password requirements
router.post("/login", validateLogin, authController.login);

// Endpoint to fetch the current user profile (Protected route)
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;
