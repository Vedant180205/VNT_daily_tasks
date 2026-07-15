const playerService = require("../services/playerService");
const redisClient = require("../config/redis");
const fs = require('fs');
const csv = require('csv-parser');
const crypto = require('crypto');
const playerQueue = require('../queues/playerQueue');
const bullConnection = require('../config/redisBull');

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

const uploadCSV = async (req, res, next) => {
    try {
        if (!req.file) {
            const error = new Error('No CSV file uploaded.');
            error.status = 400;
            throw error;
        }

        const uploadId = crypto.randomUUID();
        await bullConnection.hset(`upload:${uploadId}:status`, { total: 0, completed: 0, failed: 0 });
        
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', async (data) => {
                await bullConnection.hincrby(`upload:${uploadId}:status`, 'total', 1);
                playerQueue.add('create-player', { ...data, uploadId });
            })
            .on('end', () => {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error("Error deleting temp CSV file:", err);
                });
            })
            .on('error', (error) => {
                fs.unlink(req.file.path, () => {});
                console.error("CSV parsing error:", error);
            });

        res.status(202).json({
            success: true,
            uploadId,
            message: "File uploaded. Processing in background."
        });

    } catch (error) {
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, () => {});
        }
        next(error);
    }
};

const getUploadStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const status = await bullConnection.hgetall(`upload:${id}:status`);
        
        if (!status || Object.keys(status).length === 0) {
            return res.status(404).json({ success: false, message: "Upload ID not found" });
        }

        const failed = parseInt(status.failed) || 0;
        let errors = [];

        if (failed > 0) {
            const rawErrors = await bullConnection.lrange(`upload:${id}:errors`, 0, -1);
            errors = rawErrors.map(errStr => {
                try {
                    return JSON.parse(errStr);
                } catch(e) {
                    return { reason: errStr };
                }
            });
        }

        res.json({
            success: true,
            data: {
                total: parseInt(status.total) || 0,
                completed: parseInt(status.completed) || 0,
                failed,
                errors
            }
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
    deletePlayer,
    uploadCSV,
    getUploadStatus
};
