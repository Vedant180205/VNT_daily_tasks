const organizerService = require("../services/organizerService");

// Handles Phase 1 Lead Application submission
const applyOrganizer = async (req, res, next) => {
    try {
        const applicationData = req.body;
        const result = await organizerService.submitApplication(applicationData);

        res.status(201).json({
            success: true,
            message: "Application submitted successfully. Awaiting admin review.",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// Handles Phase 2 Registration link validation (prefills lead data)
const validateRegistrationToken = async (req, res, next) => {
    try {
        const { token } = req.query;
        const result = await organizerService.validateRegistrationToken(token);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// Handles Phase 2 Registration form submission (sets password, KYC documents, creates user)
const completeRegistration = async (req, res, next) => {
    try {
        const registrationPayload = {
            ...req.body,
            documentFiles: req.files ? req.files['documents'] : []
        };

        const result = await organizerService.completeRegistration(registrationPayload);

        res.status(200).json({
            success: true,
            message: "Registration and document submission completed successfully. Awaiting final admin approval.",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    applyOrganizer,
    validateRegistrationToken,
    completeRegistration
};
