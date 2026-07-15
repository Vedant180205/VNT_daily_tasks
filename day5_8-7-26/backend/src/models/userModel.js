const pool = require("../config/db");

// Responsible for checking if a user exists in the database by their email
const findUserByEmail = async (email) => {
    const [rows] = await pool.query(
        "SELECT users.*, roles.name AS role_name FROM users LEFT JOIN roles ON users.role_id = roles.id WHERE users.email = ?",
        [email]
    );
    return rows[0];
};

// Responsible for creating a new user in the database
const createUser = async (user) => {
    const { name, email, password, role_id } = user;
    const [result] = await pool.query(
        "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
        [name, email, password, role_id || null]
    );
    return result.insertId;
};

// Responsible for fetching a user from the database by their ID
const findUserById = async (id) => {
    const [rows] = await pool.query(
        "SELECT users.*, roles.name AS role_name FROM users LEFT JOIN roles ON users.role_id = roles.id WHERE users.id = ?",
        [id]
    );
    return rows[0];
};

module.exports = {
    findUserByEmail,
    createUser,
    findUserById
};
