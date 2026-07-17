const pool = require("../config/db");

// Retrieve all teams ordered by ID
const getAllTeams = async () => {
    const [rows] = await pool.query("SELECT id, name, created_at FROM teams ORDER BY id ASC");
    return rows;
};

// Find a team by its exact name to check for duplicates
const findTeamByName = async (name) => {
    const [rows] = await pool.query("SELECT * FROM teams WHERE name = ?", [name]);
    return rows[0];
};

// Create a new team
const createTeam = async (name) => {
    const [result] = await pool.query("INSERT INTO teams (name) VALUES (?)", [name]);
    return result.insertId;
};

// Delete a team by id
const deleteTeam = async (id) => {
    const [result] = await pool.query("DELETE FROM teams WHERE id = ?", [id]);
    return result.affectedRows > 0;
};

module.exports = {
    getAllTeams,
    findTeamByName,
    createTeam,
    deleteTeam
};
