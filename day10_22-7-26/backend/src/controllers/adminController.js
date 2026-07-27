const adminService = require("../services/adminService");

const getPendingOrganizers = async (req, res, next) => {
    try {
        const organizers = await adminService.getPendingOrganizers();
        res.status(200).json({
            success: true,
            data: organizers
        });
    } catch (error) {
        next(error);
    }
};

const approveOrganizer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { expiresInHours } = req.body;
        
        const result = await adminService.approveOrganizer(id, expiresInHours);
        res.status(200).json({
            success: true,
            message: "Registration link generated and invitation sent successfully.",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const rejectOrganizer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        await adminService.rejectOrganizer(id, reason);
        res.status(200).json({
            success: true,
            message: "Organizer application rejected successfully."
        });
    } catch (error) {
        next(error);
    }
};

const verifyOrganizerDocuments = async (req, res, next) => {
    try {
        const { id } = req.params;
        await adminService.verifyOrganizerDocuments(id);
        res.status(200).json({
            success: true,
            message: "KYC documents marked as verified successfully."
        });
    } catch (error) {
        next(error);
    }
};

const activateOrganizer = async (req, res, next) => {
    try {
        const { id } = req.params;
        await adminService.activateOrganizer(id);
        res.status(200).json({
            success: true,
            message: "Organizer verified and activated successfully. Account is now active."
        });
    } catch (error) {
        next(error);
    }
};

const getOrganizers = async (req, res, next) => {
    try {
        const organizers = await adminService.getAllOrganizers();
        res.status(200).json({
            success: true,
            data: organizers
        });
    } catch (error) {
        next(error);
    }
};

const emailTemplateModel = require("../models/emailTemplateModel");

const getEmailTemplates = async (req, res, next) => {
    try {
        const templates = await emailTemplateModel.getAllTemplates();
        res.status(200).json({
            success: true,
            data: templates
        });
    } catch (error) {
        next(error);
    }
};

const updateEmailTemplate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { subject, body_html } = req.body;
        
        if (!subject || !body_html) {
            const error = new Error("Subject and body_html are required");
            error.statusCode = 400;
            throw error;
        }

        const success = await emailTemplateModel.updateTemplate(id, subject, body_html);
        if (!success) {
            const error = new Error("Template not found or no changes made");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            message: "Email template updated successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPendingOrganizers,
    approveOrganizer,
    rejectOrganizer,
    verifyOrganizerDocuments,
    activateOrganizer,
    getOrganizers,
    getEmailTemplates,
    updateEmailTemplate
};
