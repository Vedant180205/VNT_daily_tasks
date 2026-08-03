const express = require("express");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/rbacMiddleware");

const router = express.Router();

// GET /api/admin/organizers/pending
router.get("/organizers/pending", authMiddleware, requirePermission('manage_organizers'), adminController.getPendingOrganizers);

// GET /api/admin/organizers
router.get("/organizers", authMiddleware, requirePermission('manage_organizers'), adminController.getOrganizers);

// PATCH /api/admin/organizers/:id/approve (Send Registration Link)
router.patch("/organizers/:id/approve", authMiddleware, requirePermission('manage_organizers'), adminController.approveOrganizer);

// PATCH /api/admin/organizers/:id/reject (Reject Lead Application or KYC)
router.patch("/organizers/:id/reject", authMiddleware, requirePermission('manage_organizers'), adminController.rejectOrganizer);

// PATCH /api/admin/organizers/:id/verify-docs (Mark KYC Documents Verified - status = 4)
router.patch("/organizers/:id/verify-docs", authMiddleware, requirePermission('manage_organizers'), adminController.verifyOrganizerDocuments);

// PATCH /api/admin/organizers/:id/activate (Final Approval & Activation - status = 6)
router.patch("/organizers/:id/activate", authMiddleware, requirePermission('manage_organizers'), adminController.activateOrganizer);

// GET /api/admin/email-templates
router.get("/email-templates", authMiddleware, requirePermission('manage_email_templates'), adminController.getEmailTemplates);

// PUT /api/admin/email-templates/:id
router.put("/email-templates/:id", authMiddleware, requirePermission('manage_email_templates'), adminController.updateEmailTemplate);

module.exports = router;
