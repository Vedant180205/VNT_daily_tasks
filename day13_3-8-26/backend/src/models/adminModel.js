const pool = require("../config/db");

const getPendingOrganizers = async () => {
    const [rows] = await pool.query(
        "SELECT id, full_name, email, phone, org_name, address, state, city, zone, aadhaar_number, pan_number, documents, created_at FROM organizers WHERE approval_status = 0"
    );
    return rows;
};

const getOrganizerById = async (id) => {
    const [rows] = await pool.query(
        "SELECT * FROM organizers WHERE id = ?",
        [id]
    );
    return rows[0];
};

const approveOrganizer = async (organizerId, userId) => {
    const [result] = await pool.query(
        "UPDATE organizers SET approval_status = 1, is_active = 1, user_id = ? WHERE id = ?",
        [userId, organizerId]
    );
    return result.affectedRows > 0;
};

const getAllOrganizers = async () => {
    const [rows] = await pool.query(
        "SELECT id, full_name, email, phone, org_name, address, state, city, zone, created_at FROM organizers WHERE approval_status = 1"
    );
    return rows;
};

// Fetch organizers by specific approval status
const getOrganizersByStatus = async (status) => {
    const [rows] = await pool.query(
        "SELECT id, full_name, email, phone, org_name, address, state, city, zone, aadhaar_number, pan_number, documents, approval_status, is_active, rejection_reason, created_at FROM organizers WHERE approval_status = ?",
        [status]
    );
    return rows;
};

// Fetch all organizers across all stages with full details including KYC documents and approval status
const getAllOrganizersWithStatus = async (options = {}) => {
    let whereClause = "WHERE 1=1";
    const params = [];

    if (options.status !== undefined && options.status !== '') {
        // e.g. status could be a number matching approval_status, or string like 'pending'
        if (options.status === 'pending') {
            whereClause += " AND approval_status = 0";
        } else if (options.status === 'active') {
            whereClause += " AND approval_status = 5";
        } else if (options.status === 'rejected') {
            whereClause += " AND approval_status = 1";
        } else if (!isNaN(options.status)) {
            whereClause += " AND approval_status = ?";
            params.push(options.status);
        }
    }

    if (options.search) {
        whereClause += " AND (full_name LIKE ? OR org_name LIKE ? OR email LIKE ?)";
        const searchPattern = `%${options.search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }

    let sortColumn = "created_at";
    if (options.sortBy === "name") sortColumn = "full_name";
    else if (options.sortBy === "org_name") sortColumn = "org_name";
    
    let orderDirection = "DESC";
    if (options.order && options.order.toUpperCase() === "ASC") {
        orderDirection = "ASC";
    }

    const query = `
        SELECT id, user_id, full_name, email, phone, org_name, address, state, city, zone, aadhaar_number, pan_number, documents, approval_status, is_active, rejection_reason, created_at 
        FROM organizers 
        ${whereClause} 
        ORDER BY ${sortColumn} ${orderDirection}
    `;

    const [rows] = await pool.query(query, params);
    return rows;
};

module.exports = {
    getPendingOrganizers,
    getOrganizerById,
    approveOrganizer,
    getAllOrganizers,
    getOrganizersByStatus,
    getAllOrganizersWithStatus
};
