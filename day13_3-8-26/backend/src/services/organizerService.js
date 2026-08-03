const bcrypt = require("bcrypt");
const pool = require("../config/db");
const userModel = require("../models/userModel");
const organizerModel = require("../models/organizerModel");
const invitationService = require("./invitationService");

// Handles business logic for Phase 1 Lead Application submission
const submitApplication = async (applicationData) => {
    const { email } = applicationData;

    // 1. Check if email already exists in users table (already registered active user)
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
        const error = new Error("Already registered.");
        error.statusCode = 409;
        throw error;
    }

    // 2. Check if email already exists in organizers table (pending or processed application)
    const existingOrganizer = await organizerModel.findOrganizerByEmail(email);
    if (existingOrganizer) {
        const error = new Error("Application already submitted.");
        error.statusCode = 409;
        throw error;
    }

    // 3. Save strictly Phase 1 application details to organizers table
    const organizerId = await organizerModel.createOrganizerApplication(applicationData);

    return { id: organizerId, email };
};

// Validates Phase 2 registration token link and returns prefilled lead data
const validateRegistrationToken = async (token) => {
    return await invitationService.validateToken(token);
};

// Completes Phase 2 registration: saves password & KYC details ONLY to organizers table (user account created on Admin Activation)
const completeRegistration = async (registrationPayload) => {
    const { token, password, address, zone, aadhaar_number, pan_number, documentFiles } = registrationPayload;

    // 1. Validate token again before processing
    const invitationData = await invitationService.validateToken(token);

    // 2. Extract document paths if uploaded
    const documentPaths = (documentFiles && Array.isArray(documentFiles))
        ? documentFiles.map(file => `/uploads/organizers/documents/${file.filename}`)
        : [];

    // 3. Hash password with bcrypt before saving to organizers table
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Update organizers table ONLY (user_id remains NULL until Admin activates)
    await pool.query(
        `UPDATE organizers 
         SET password = ?, 
             address = ?, 
             zone = ?, 
             aadhaar_number = ?, 
             pan_number = ?, 
             documents = ?, 
             approval_status = 3 
         WHERE id = ?`,
        [hashedPassword, address, zone, aadhaar_number, pan_number, JSON.stringify(documentPaths), invitationData.organizer_id]
    );

    // 5. Mark token as consumed/used
    await invitationService.consumeToken(token);

    return {
        organizerId: invitationData.organizer_id,
        email: invitationData.email,
        status: 3
    };
};

module.exports = {
    submitApplication,
    validateRegistrationToken,
    completeRegistration
};
