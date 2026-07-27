const express = require("express");
const organizerController = require("../controllers/organizerController");
const { validateOrganizerApplication, validateOrganizerRegistration } = require("../middleware/validateAuth");
const { organizerUploads } = require("../middleware/uploadMiddleware");

const router = express.Router();

// Phase 1: Public Lead Application Submission
// POST /api/organizers/apply
router.post("/apply", validateOrganizerApplication, organizerController.applyOrganizer);

// Phase 2: Registration Link Token Validation (Prefills Phase 1 Lead Data)
// GET /api/organizers/registration/validate?token=...
router.get("/registration/validate", organizerController.validateRegistrationToken);

// Phase 2: Registration & KYC Form Submission
// POST /api/organizers/registration/submit
router.post(
    "/registration/submit", 
    organizerUploads, 
    validateOrganizerRegistration, 
    organizerController.completeRegistration
);

module.exports = router;
