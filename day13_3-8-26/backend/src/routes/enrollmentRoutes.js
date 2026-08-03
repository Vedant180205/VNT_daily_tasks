const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/rbacMiddleware");

// Protected route — require view_enrollments permission
router.get("/", authMiddleware, requirePermission("view_enrollments"), enrollmentController.getEnrollments);

module.exports = router;
