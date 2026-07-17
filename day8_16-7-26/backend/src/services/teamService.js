const teamModel = require("../models/teamModel");

// Get all teams from the database
const getAllTeams = async () => {
    return await teamModel.getAllTeams();
};

// Create a new team with business rules (uniqueness check)
const createTeam = async (name) => {
    // 1. Check if the team name already exists
    const existingTeam = await teamModel.findTeamByName(name);
    
    if (existingTeam) {
        const error = new Error("Team already exists");
        error.statusCode = 409;
        throw error;
    }

    // 2. Save the team in the database
    const newTeamId = await teamModel.createTeam(name);
    
    // 3. Return the new team data
    return {
        id: newTeamId,
        name
    };
};

// Delete a team by ID
const deleteTeam = async (id) => {
    // Optionally check if the team exists first, but DELETE FROM teams WHERE id = ? is fine
    const success = await teamModel.deleteTeam(id);
    if (!success) {
        const error = new Error("Team not found or already deleted");
        error.statusCode = 404;
        throw error;
    }
    return success;
};

module.exports = {
    getAllTeams,
    createTeam,
    deleteTeam
};
