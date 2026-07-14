const playerService = require("../services/playerService");
const redisClient = require("../config/redis");

const invalidatePlayerCache = async () => {
    try {
        const keys = await redisClient.keys('players:*');
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (error) {
        console.error("Cache invalidation error:", error);
    }
};

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
        await invalidatePlayerCache();
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
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const search = req.query.search || '';
        const cacheKey = `players:page=${page}:limit=${limit}:search=${search}`;

        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log("CACHE HIT");
            return res.json(JSON.parse(cachedData));
        }

        console.log("CACHE MISS");
        const result = await playerService.getPlayers(req.query);
        const responseData = {
            success: true,
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
            data: result.data
        };

        await redisClient.setEx(cacheKey, 60, JSON.stringify(responseData));

        res.json(responseData);
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
        await invalidatePlayerCache();
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
        await invalidatePlayerCache();
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
