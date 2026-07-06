const playerService = require("../services/playerService");

const createPlayer = async (req, res, next) => {
    try {
        const player = await playerService.createPlayer(req.body);
        res.status(201).json({
            success: true,
            data: player
        });
    } catch (error) {
        next(error);
    }
};

const getPlayers = async (req, res, next) => {
    try {
        const result = await playerService.getPlayers(req.query);
        res.json({
            success: true,
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
            data: result.data
        });
    } catch (error) {
        next(error);
    }
};

const getPlayer = async (req, res, next) => {
    try {
        const player = await playerService.getPlayer(req.params.id);
        res.json({
            success: true,
            data: player
        });
    } catch (error) {
        next(error);
    }
};

const updatePlayer = async (req, res, next) => {
    try {
        const player = await playerService.updatePlayer(req.params.id, req.body);
        res.json({
            success: true,
            data: player
        });
    } catch (error) {
        next(error);
    }
};

const deletePlayer = async (req, res, next) => {
    try {
        await playerService.deletePlayer(req.params.id);
        res.json({
            success: true,
            message: "Player deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPlayer,
    getPlayers,
    getPlayer,
    updatePlayer,
    deletePlayer
};
