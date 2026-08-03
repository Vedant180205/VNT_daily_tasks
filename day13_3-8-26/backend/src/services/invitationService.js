const crypto = require("crypto");
const invitationModel = require("../models/invitationModel");

// Computes SHA-256 hash of a raw token string
const hashToken = (rawToken) => {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
};

// Generates a 64-character cryptographically secure random token string
const generateRawToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

// Creates a secure invitation token entry for an organizer with admin-specified expiration duration
const createInvitation = async (organizerId, expiresInHours = 72) => {
    const hours = parseInt(expiresInHours, 10);
    if (isNaN(hours) || hours <= 0) {
        const error = new Error("Expiry duration in hours must be a positive integer");
        error.statusCode = 400;
        throw error;
    }

    // 1. Invalidate any existing unused tokens for this organizer
    await invitationModel.invalidatePreviousTokens(organizerId);

    // 2. Generate raw token and compute SHA-256 hash
    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);

    // 3. Set expiration based on admin specified expiresInHours
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    // 4. Save tokenHash to database
    await invitationModel.createInvitation(organizerId, tokenHash, expiresAt);

    return {
        rawToken,
        tokenHash,
        expiresAt,
        expiresInHours: hours
    };
};

// Validates a raw token against database token hashes and returns pre-filled lead data
const validateToken = async (rawToken) => {
    if (!rawToken || typeof rawToken !== "string") {
        const error = new Error("Invalid or missing invitation token");
        error.statusCode = 400;
        throw error;
    }

    const tokenHash = hashToken(rawToken);
    const invitation = await invitationModel.findValidToken(tokenHash);

    if (!invitation) {
        const error = new Error("This invitation link is invalid or has expired.");
        error.statusCode = 400;
        throw error;
    }

    return {
        organizer_id: invitation.organizer_id,
        full_name: invitation.full_name,
        email: invitation.email,
        phone: invitation.phone,
        org_name: invitation.org_name,
        state: invitation.state,
        city: invitation.city,
        approval_status: invitation.approval_status,
        expires_at: invitation.expires_at
    };
};

// Marks a raw token as consumed/used by computing its hash
const consumeToken = async (rawToken) => {
    const tokenHash = hashToken(rawToken);
    return await invitationModel.markTokenUsed(tokenHash);
};

module.exports = {
    hashToken,
    generateRawToken,
    createInvitation,
    validateToken,
    consumeToken
};
