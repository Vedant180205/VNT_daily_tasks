const express = require("express");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rbacMiddleware");

const router = express.Router();

// GET /api/admin/organizers/pending
router.get("/organizers/pending", authMiddleware, requireRole('Admin'), adminController.getPendingOrganizers);

// GET /api/admin/organizers
router.get("/organizers", authMiddleware, requireRole('Admin'), adminController.getOrganizers);

// PATCH /api/admin/organizers/:id/approve
router.patch("/organizers/:id/approve", authMiddleware, requireRole('Admin'), adminController.approveOrganizer);

module.exports = router;
