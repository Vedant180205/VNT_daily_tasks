const pool = require("../config/db");

// Responsible for inserting Phase 1 Lead Application (Full Name, Org Name, Email, Phone, State, City)
const createOrganizerApplication = async (applicationData) => {
    const { full_name, email, phone, org_name, state, city } = applicationData;

    const [result] = await pool.query(
        `INSERT INTO organizers (
            full_name, email, phone, org_name, state, city, approval_status, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, 0, 0)`,
        [full_name, email, phone, org_name, state, city]
    );

    return result.insertId;
};

// Responsible for creating a full organizer profile (Registration / KYC stage)
const createOrganizer = async (organizerData) => {
    const { 
        full_name, email, password, phone, org_name, 
        address, state, city, zone, aadhaar_number, 
        pan_number, documents 
    } = organizerData;

    const [result] = await pool.query(
        `INSERT INTO organizers (
            full_name, email, password, phone, org_name, 
            address, state, city, zone, aadhaar_number, 
            pan_number, documents, approval_status, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
        [
            full_name, email, password || null, phone, org_name, 
            address, state, city, zone, aadhaar_number, 
            pan_number, documents ? JSON.stringify(documents) : null
        ]
    );
    
    return result.insertId;
};

// Responsible for checking if email is already registered as an organizer
const findOrganizerByEmail = async (email) => {
    const [rows] = await pool.query(
        "SELECT * FROM organizers WHERE email = ?",
        [email]
    );
    return rows[0];
};

// Responsible for fetching an organizer record by primary key
const getOrganizerById = async (id) => {
    const [rows] = await pool.query(
        "SELECT * FROM organizers WHERE id = ?",
        [id]
    );
    return rows[0];
};

// Update approval status to a specific status value
const updateStatus = async (id, status) => {
    const [result] = await pool.query(
        "UPDATE organizers SET approval_status = ? WHERE id = ?",
        [status, id]
    );
    return result.affectedRows > 0;
};

// Mark organizer as rejected with a reason (status = 1)
const setRejected = async (id, reason) => {
    const [result] = await pool.query(
        "UPDATE organizers SET approval_status = 1, rejection_reason = ? WHERE id = ?",
        [reason, id]
    );
    return result.affectedRows > 0;
};

// Mark organizer as registered and link user_id (status = 3)
const setRegistered = async (id, userId) => {
    const [result] = await pool.query(
        "UPDATE organizers SET approval_status = 3, user_id = ? WHERE id = ?",
        [userId, id]
    );
    return result.affectedRows > 0;
};

// Mark organizer documents as verified (status = 4)
const setDocumentsVerified = async (id) => {
    const [result] = await pool.query(
        "UPDATE organizers SET approval_status = 4 WHERE id = ?",
        [id]
    );
    return result.affectedRows > 0;
};

// Mark organizer as active (status = 5, is_active = 1)
const setActive = async (id) => {
    const [result] = await pool.query(
        "UPDATE organizers SET approval_status = 5, is_active = 1 WHERE id = ?",
        [id]
    );
    return result.affectedRows > 0;
};

// Responsible for updating organizer profile with Phase 2 registration data (address, zone, aadhaar, pan, documents) and setting approval_status = 3
const completeRegistrationProfile = async (organizerId, userId, registrationData) => {
    const { address, zone, aadhaar_number, pan_number, documents } = registrationData;

    const [result] = await pool.query(
        `UPDATE organizers 
         SET user_id = ?, 
             address = ?, 
             zone = ?, 
             aadhaar_number = ?, 
             pan_number = ?, 
             documents = ?, 
             approval_status = 3 
         WHERE id = ?`,
        [userId, address, zone, aadhaar_number, pan_number, JSON.stringify(documents), organizerId]
    );

    return result.affectedRows > 0;
};

module.exports = {
    createOrganizerApplication,
    createOrganizer,
    completeRegistrationProfile,
    findOrganizerByEmail,
    getOrganizerById,
    updateStatus,
    setRejected,
    setRegistered,
    setDocumentsVerified,
    setActive
};
