const pool = require("../config/db");

// Responsible for storing a newly generated invitation token hash
const createInvitation = async (organizerId, tokenHash, expiresAt) => {
    const [result] = await pool.query(
        "INSERT INTO organizer_invitations (organizer_id, token, expires_at) VALUES (?, ?, ?)",
        [organizerId, tokenHash, expiresAt]
    );
    return result.insertId;
};

// Responsible for finding a valid (unexpired, unused) invitation token hash and joining Phase 1 lead details
const findValidToken = async (tokenHash) => {
    const [rows] = await pool.query(
        `SELECT i.id as invitation_id, i.organizer_id, i.expires_at, i.used_at,
                o.full_name, o.email, o.phone, o.org_name, o.state, o.city, o.approval_status
         FROM organizer_invitations i
         JOIN organizers o ON i.organizer_id = o.id
         WHERE i.token = ? AND i.used_at IS NULL AND i.expires_at > NOW()`,
        [tokenHash]
    );
    return rows[0];
};

// Responsible for marking an invitation token as consumed/used by token hash
const markTokenUsed = async (tokenHash) => {
    const [result] = await pool.query(
        "UPDATE organizer_invitations SET used_at = NOW() WHERE token = ?",
        [tokenHash]
    );
    return result.affectedRows > 0;
};

// Responsible for invalidating any active/unused tokens for an organizer (resend flow)
const invalidatePreviousTokens = async (organizerId) => {
    const [result] = await pool.query(
        "UPDATE organizer_invitations SET used_at = NOW() WHERE organizer_id = ? AND used_at IS NULL",
        [organizerId]
    );
    return result.affectedRows;
};

module.exports = {
    createInvitation,
    findValidToken,
    markTokenUsed,
    invalidatePreviousTokens
};
