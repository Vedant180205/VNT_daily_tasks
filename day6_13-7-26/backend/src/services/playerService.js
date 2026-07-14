const playerModel = require("../models/playerModel");
const { deleteFile } = require("../utils/fileUtils");

const createPlayer = async (playerData) => {
    // Check if email is already taken
    const existingPlayer = await playerModel.findPlayerByEmail(playerData.email);
    if (existingPlayer) {
        const error = new Error("Email already exists");
        error.status = 409;
        throw error;
    }
    
    const insertId = await playerModel.createPlayer(playerData);
    return await playerModel.getPlayerById(insertId);
};

const getPlayers = async (options) => {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const search = options.search || "";
    const team = options.team ? parseInt(options.team, 10) : null;
    const date = options.date || null;
    
    let sort = options.sort;
    const validSortFields = ["name", "email", "created_at"];
    if (!validSortFields.includes(sort)) {
        sort = "created_at";
    }
    
    let order = options.order && String(options.order).toLowerCase();
    if (order !== "asc" && order !== "desc") {
        order = "desc";
    }
    
    const result = await playerModel.getAllPlayers({
        search,
        sort,
        order,
        limit,
        offset,
        team,
        date
    });
    
    const totalPages = Math.ceil(result.total / limit);
    
    return {
        page,
        limit,
        total: result.total,
        totalPages,
        data: result.players
    };
};

const getPlayer = async (id) => {
    const player = await playerModel.getPlayerById(id);
    if (!player) {
        const error = new Error("Player not found");
        error.status = 404;
        throw error;
    }
    return player;
};

const updatePlayer = async (id, playerData) => {
    // Ensure player exists
    const player = await playerModel.getPlayerById(id);
    if (!player) {
        const error = new Error("Player not found");
        error.status = 404;
        throw error;
    }
    
    // Check for email uniqueness ignoring current player
    const existingPlayer = await playerModel.findPlayerByEmail(playerData.email, id);
    if (existingPlayer) {
        const error = new Error("Email already exists");
        error.status = 409;
        throw error;
    }
    
    // Delete old avatar if new one is uploaded
    if (playerData.avatar && player.avatar) {
        deleteFile(player.avatar);
    }
    
    // Process Gallery
    let finalGallery = [];
    const oldGallery = typeof player.gallery === 'string' ? JSON.parse(player.gallery) : (player.gallery || []);
    const oldGalleryArray = Array.isArray(oldGallery) ? oldGallery : [];
    
    // Which old images were retained?
    const retained = playerData.retained_gallery || [];
    
    // Any old image NOT in the retained list should be deleted
    oldGalleryArray.forEach(fileUrl => {
        if (!retained.includes(fileUrl)) {
            deleteFile(fileUrl);
        }
    });
    
    // Combine retained images with new uploaded images
    finalGallery = [...retained];
    if (playerData.gallery && Array.isArray(playerData.gallery)) {
        finalGallery = [...finalGallery, ...playerData.gallery];
    }
    
    playerData.gallery = finalGallery;
    
    // Fallback for avatar
    if (!playerData.avatar) {
        playerData.avatar = player.avatar;
    }
    
    await playerModel.updatePlayer(id, playerData);
    return await playerModel.getPlayerById(id);
};

const deletePlayer = async (id) => {
    const player = await playerModel.getPlayerById(id);
    if (!player) {
        const error = new Error("Player not found");
        error.status = 404;
        throw error;
    }
    
    await playerModel.softDeletePlayer(id);
    return true;
};

module.exports = {
    createPlayer,
    getPlayers,
    getPlayer,
    updatePlayer,
    deletePlayer
};
