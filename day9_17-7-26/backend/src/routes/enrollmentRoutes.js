const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController");

// Public route — no auth required for listing enrollments
router.get("/", enrollmentController.getEnrollments);

module.exports = router;
