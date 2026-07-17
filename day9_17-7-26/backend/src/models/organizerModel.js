const pool = require("../config/db");

// Responsible for creating an unapproved organizer profile
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
            full_name, email, password, phone, org_name, 
            address, state, city, zone, aadhaar_number, 
            pan_number, JSON.stringify(documents)
        ]
    );
    
    return result.insertId;
};

// Responsible for checking if email is already pending as an organizer
const findOrganizerByEmail = async (email) => {
    const [rows] = await pool.query(
        "SELECT * FROM organizers WHERE email = ?",
        [email]
    );
    return rows[0];
};

module.exports = {
    createOrganizer,
    findOrganizerByEmail
};
