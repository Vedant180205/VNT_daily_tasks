const pool = require("../config/db");

// Retrieve all teams ordered by ID
const getAllTeams = async () => {
    const [rows] = await pool.query("SELECT id, name FROM teams ORDER BY id ASC");
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

module.exports = {
    getAllTeams,
    findTeamByName,
    createTeam
};
