const teamService = require("../services/teamService");

// Get all teams
const getTeams = async (req, res, next) => {
    try {
        const teams = await teamService.getAllTeams();
        
        res.status(200).json({
            success: true,
            count: teams.length,
            data: teams
        });
    } catch (error) {
        next(error);
    }
};

// Create a new team
const createTeam = async (req, res, next) => {
    try {
        const { name } = req.body;
        
        const newTeam = await teamService.createTeam(name);
        
        res.status(201).json({
            success: true,
            message: "Team created successfully",
            data: newTeam
        });
    } catch (error) {
        next(error);
    }
};

// Delete a team
const deleteTeam = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        await teamService.deleteTeam(id);
        
        res.status(200).json({
            success: true,
            message: "Team deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTeams,
    createTeam,
    deleteTeam
};
