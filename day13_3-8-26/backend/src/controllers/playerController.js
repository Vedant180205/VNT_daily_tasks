const playerService = require("../services/playerService");
const cacheService = require("../services/cacheService");
const searchService = require("../services/searchService");
const jobTrackerService = require("../services/jobTrackerService");
const fs = require('fs');
const csv = require('csv-parser');
const crypto = require('crypto');
const playerQueue = require('../queues/playerQueue');

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
        
        // Update caches and indexes
        await cacheService.delByPattern('players:*');
        await searchService.addToIndex({ id: player.id || player.insertId, name: payload.name });
        
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
        const responseData = {
            success: true,
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
            data: result.data
        };

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
        
        // We need the old name to remove it from the index.
        const oldPlayer = await playerService.getPlayer(req.params.id);
        
        const player = await playerService.updatePlayer(req.params.id, payload);
        
        await cacheService.delByPattern('players:*');
        
        // If name changed, update index
        if (payload.name && oldPlayer && oldPlayer.name !== payload.name) {
            await searchService.removeFromIndex(req.params.id, oldPlayer.name);
            await searchService.addToIndex({ id: req.params.id, name: payload.name });
        }
        
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
        const oldPlayer = await playerService.getPlayer(req.params.id);
        
        await playerService.deletePlayer(req.params.id);
        await cacheService.delByPattern('players:*');
        
        if (oldPlayer) {
            await searchService.removeFromIndex(req.params.id, oldPlayer.name);
        }
        
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
        await jobTrackerService.initializeJob('upload', uploadId, { total: 0, completed: 0, failed: 0 });
        
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', async (data) => {
                await jobTrackerService.incrementJobProgress('upload', uploadId, 'total', 1);
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
        const status = await jobTrackerService.getJobStatus('upload', id);
        
        if (!status) {
            return res.status(404).json({ success: false, message: "Upload ID not found" });
        }

        res.json({
            success: true,
            data: status
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
