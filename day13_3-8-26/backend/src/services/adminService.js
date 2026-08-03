const adminModel = require("../models/adminModel");
const invitationService = require("../services/invitationService");
const organizerModel = require("../models/organizerModel");
const emailService = require("../services/emailService");
const pool = require("../config/db");

const getPendingOrganizers = async () => {
    return await adminModel.getPendingOrganizers();
};

// Approves a Phase 1 Application lead, generates an invitation token, and dispatches registration email via Nodemailer
const approveOrganizer = async (id, expiresInHours) => {
    if (!expiresInHours) {
        const error = new Error("Expiry duration in hours is required (e.g. 24, 48, 72)");
        error.statusCode = 400;
        throw error;
    }

    const organizer = await adminModel.getOrganizerById(id);
    if (!organizer) {
        const error = new Error("Organizer application not found");
        error.statusCode = 404;
        throw error;
    }

    // Status must be PENDING_REVIEW (0) or REGISTRATION_PENDING (2 - for resend link)
    if (organizer.approval_status !== 0 && organizer.approval_status !== 2) {
        const error = new Error("Organizer application is already processed or active");
        error.statusCode = 400;
        throw error;
    }

    // 1. Create invitation token entry in organizer_invitations table with admin specified expiry
    const invitation = await invitationService.createInvitation(id, expiresInHours);

    // 2. Update organizer approval_status to REGISTRATION_PENDING (2)
    await organizerModel.updateStatus(id, 2);

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const inviteLink = `${baseUrl}/organizer/register?token=${invitation.rawToken}`;

    // 3. Dispatch Email via Nodemailer
    await emailService.sendRegistrationLinkEmail(
        organizer.email,
        organizer.full_name,
        inviteLink,
        invitation.expiresInHours
    );

    return {
        organizerId: id,
        email: organizer.email,
        full_name: organizer.full_name,
        expiresAt: invitation.expiresAt,
        expiresInHours: invitation.expiresInHours,
        rawToken: invitation.rawToken,
        inviteLink
    };
};

// Rejects an Organizer Application Lead or Registration with optional reason and sends email
const rejectOrganizer = async (id, reason) => {
    const organizer = await adminModel.getOrganizerById(id);
    if (!organizer) {
        const error = new Error("Organizer not found");
        error.statusCode = 404;
        throw error;
    }

    const rejectionReason = reason && reason.trim() !== "" ? reason.trim() : "Application declined by admin";

    // Set approval_status = 1 (REJECTED) and store rejection_reason
    await organizerModel.setRejected(id, rejectionReason);

    // Dispatch Rejection Email via Nodemailer
    await emailService.sendRejectionEmail(
        organizer.email,
        organizer.full_name,
        rejectionReason
    );

    return true;
};

// Verifies KYC documents and updates approval_status = 4 (DOCUMENTS_VERIFIED)
const verifyOrganizerDocuments = async (id) => {
    const organizer = await adminModel.getOrganizerById(id);
    if (!organizer) {
        const error = new Error("Organizer not found");
        error.statusCode = 404;
        throw error;
    }

    if (organizer.approval_status !== 3) {
        const error = new Error("Organizer must complete registration before document verification");
        error.statusCode = 400;
        throw error;
    }

    // Update status to 4 (DOCUMENTS_VERIFIED)
    await organizerModel.updateStatus(id, 4);
    return true;
};

// Final Activation after reviewing Phase 2 KYC Documents: Creates user entry in users table and activates organizer (status = 6, is_active = 1)
const activateOrganizer = async (id) => {
    const organizer = await adminModel.getOrganizerById(id);
    if (!organizer) {
        const error = new Error("Organizer not found");
        error.statusCode = 404;
        throw error;
    }

    if (organizer.approval_status !== 3 && organizer.approval_status !== 4) {
        const error = new Error("Organizer must complete registration before activation");
        error.statusCode = 400;
        throw error;
    }

    if (!organizer.password) {
        const error = new Error("Organizer has not set a password yet");
        error.statusCode = 400;
        throw error;
    }

    // 1. Get Organizer Role ID
    const [roles] = await pool.query("SELECT id FROM roles WHERE name = 'Organizer'");
    if (!roles.length) throw new Error("Organizer role not found in database");
    const roleId = roles[0].id;

    // Run Transaction to create entry in users table and link user_id
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let userId = organizer.user_id;

        // Create user account in users table ON ADMIN ACTIVATION
        if (!userId) {
            const [userResult] = await connection.query(
                "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
                [organizer.full_name, organizer.email, organizer.password, roleId]
            );
            userId = userResult.insertId;
        }

        // Update organizer approval_status = 5 (ACTIVE), is_active = 1, user_id = userId
        await connection.query(
            "UPDATE organizers SET user_id = ?, approval_status = 5, is_active = 1 WHERE id = ?",
            [userId, id]
        );

        await connection.commit();

        // Send activation success email to organizer
        await emailService.sendActivationEmail(organizer.email, organizer.full_name);

        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const getAllOrganizers = async (options = {}) => {
    return await adminModel.getAllOrganizersWithStatus(options);
};

module.exports = {
    getPendingOrganizers,
    approveOrganizer,
    rejectOrganizer,
    verifyOrganizerDocuments,
    activateOrganizer,
    getAllOrganizers
};
