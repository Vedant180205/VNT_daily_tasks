const adminModel = require("../models/adminModel");
const userModel = require("../models/userModel");
const pool = require("../config/db");

const getPendingOrganizers = async () => {
    return await adminModel.getPendingOrganizers();
};

const approveOrganizer = async (id) => {
    const organizer = await adminModel.getOrganizerById(id);
    if (!organizer) {
        const error = new Error("Organizer not found");
        error.statusCode = 404;
        throw error;
    }

    if (organizer.approval_status !== 0) {
        const error = new Error("Organizer is already processed");
        error.statusCode = 400;
        throw error;
    }

    // Get Organizer role ID
    const [roles] = await pool.query("SELECT id FROM roles WHERE name = 'Organizer'");
    if (!roles.length) {
        throw new Error("Organizer role not found in database");
    }
    const roleId = roles[0].id;

    // Start Transaction
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Insert into users table
        const [userResult] = await connection.query(
            "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
            [organizer.full_name, organizer.email, organizer.password, roleId]
        );
        const newUserId = userResult.insertId;

        // 2. Update organizer table
        await connection.query(
            "UPDATE organizers SET approval_status = 1, is_active = 1, user_id = ? WHERE id = ?",
            [newUserId, id]
        );

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    getPendingOrganizers,
    approveOrganizer
};
