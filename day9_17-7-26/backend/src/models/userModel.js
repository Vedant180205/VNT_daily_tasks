const pool = require("../config/db");

// Responsible for checking if a user exists in the database by their email
const findUserByEmail = async (email) => {
    const [rows] = await pool.query(
        `SELECT u.*, r.name as role_name 
         FROM users u 
         LEFT JOIN roles r ON u.role_id = r.id 
         WHERE u.email = ?`,
        [email]
    );
    return rows[0];
};

// Responsible for creating a new user in the database
const createUser = async (user) => {
    const { name, email, password } = user;
    const [result] = await pool.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, password]
    );
    return result.insertId;
};

// Responsible for fetching a user from the database by their ID
const findUserById = async (id) => {
    const [rows] = await pool.query(
        `SELECT u.*, r.name as role_name 
         FROM users u 
         LEFT JOIN roles r ON u.role_id = r.id 
         WHERE u.id = ?`,
        [id]
    );
    return rows[0];
};

module.exports = {
    findUserByEmail,
    createUser,
    findUserById
};
