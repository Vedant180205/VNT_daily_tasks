const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/rbacMiddleware");
const notificationController = require("../controllers/notificationController");

// GET /api/notifications/my -> Fetch logged-in user's notifications (based on role)
router.get("/my", authMiddleware, notificationController.getMyNotifications);

// GET /api/notifications -> Admin: view all active notifications
router.get("/", authMiddleware, requirePermission("manage_notifications"), notificationController.getNotifications);

// POST /api/notifications -> Admin: create a new targeted notification
router.post("/", authMiddleware, requirePermission("manage_notifications"), notificationController.createNotification);

// DELETE /api/notifications/:id -> Admin: delete notification
router.delete("/:id", authMiddleware, requirePermission("manage_notifications"), notificationController.deleteNotification);

module.exports = router;
