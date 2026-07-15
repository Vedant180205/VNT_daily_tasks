const playerService = require("../services/playerService");

const createPlayer = async (req, res, next) => {
    try {
        const payload = { ...req.body };
        if (req.files) {
            if (req.files.avatar && req.files.avatar.length > 0) {
                payload.avatar = `/uploads/players/avatar/${req.files.avatar[0].filename}`;
            }
            if (req.files.gallery && req.files.gallery.length > 0) {
                payload.gallery = req.files.gallery.map(file => `/uploads/players/gallery/${file.filename}`);
            }
        }
        const player = await playerService.createPlayer(payload);
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
        const payload = { ...req.body };
        
        // Normalize retained_gallery to an array
        if (req.body.retained_gallery) {
            payload.retained_gallery = Array.isArray(req.body.retained_gallery) 
                ? req.body.retained_gallery 
                : [req.body.retained_gallery];
        } else {
            payload.retained_gallery = [];
        }

        if (req.files) {
            if (req.files.avatar && req.files.avatar.length > 0) {
                payload.avatar = `/uploads/players/avatar/${req.files.avatar[0].filename}`;
            }
            if (req.files.gallery && req.files.gallery.length > 0) {
                payload.gallery = req.files.gallery.map(file => `/uploads/players/gallery/${file.filename}`);
            }
        }
        const player = await playerService.updatePlayer(req.params.id, payload);
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
