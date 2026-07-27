const express = require("express");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rbacMiddleware");

const router = express.Router();

// GET /api/admin/organizers/pending
router.get("/organizers/pending", authMiddleware, requireRole('Admin'), adminController.getPendingOrganizers);

// GET /api/admin/organizers
router.get("/organizers", authMiddleware, requireRole('Admin'), adminController.getOrganizers);

// PATCH /api/admin/organizers/:id/approve (Send Registration Link)
router.patch("/organizers/:id/approve", authMiddleware, requireRole('Admin'), adminController.approveOrganizer);

// PATCH /api/admin/organizers/:id/reject (Reject Lead Application or KYC)
router.patch("/organizers/:id/reject", authMiddleware, requireRole('Admin'), adminController.rejectOrganizer);

// PATCH /api/admin/organizers/:id/verify-docs (Mark KYC Documents Verified - status = 4)
router.patch("/organizers/:id/verify-docs", authMiddleware, requireRole('Admin'), adminController.verifyOrganizerDocuments);

// PATCH /api/admin/organizers/:id/activate (Final Approval & Activation - status = 6)
router.patch("/organizers/:id/activate", authMiddleware, requireRole('Admin'), adminController.activateOrganizer);

// GET /api/admin/email-templates
router.get("/email-templates", authMiddleware, requireRole('Admin'), adminController.getEmailTemplates);

// PUT /api/admin/email-templates/:id
router.put("/email-templates/:id", authMiddleware, requireRole('Admin'), adminController.updateEmailTemplate);

module.exports = router;
