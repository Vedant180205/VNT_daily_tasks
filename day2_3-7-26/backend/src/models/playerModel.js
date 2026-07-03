const pool = require("../config/db");

const findPlayerByEmail = async (email, excludeId = null) => {
    let query = "SELECT * FROM players WHERE email = ? AND is_deleted = FALSE";
    const params = [email];
    
    if (excludeId) {
        query += " AND id != ?";
        params.push(excludeId);
    }
    
    const [rows] = await pool.query(query, params);
    return rows[0];
};

const createPlayer = async (player) => {
    const { name, email, phone } = player;
    const [result] = await pool.query(
        "INSERT INTO players (name, email, phone) VALUES (?, ?, ?)",
        [name, email, phone]
    );
    return result.insertId;
};

const getPlayerById = async (id) => {
    const [rows] = await pool.query(
        "SELECT * FROM players WHERE id = ? AND is_deleted = FALSE",
        [id]
    );
    return rows[0];
};

const getAllPlayers = async ({ search, sort, order, limit, offset }) => {
    let query = "SELECT * FROM players WHERE is_deleted = FALSE";
    let countQuery = "SELECT COUNT(*) as total FROM players WHERE is_deleted = FALSE";
    const params = [];
    const countParams = [];

    if (search) {
        const startsWith = `${search}%`;
        const wordStartsWith = `% ${search}%`;
        
        query += " AND (name LIKE ? OR name LIKE ? OR email LIKE ?)";
        countQuery += " AND (name LIKE ? OR name LIKE ? OR email LIKE ?)";
        
        params.push(startsWith, wordStartsWith, startsWith);
        countParams.push(startsWith, wordStartsWith, startsWith);
    }

    query += ` ORDER BY ${sort} ${order.toUpperCase()}`;

    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    const [countRows] = await pool.query(countQuery, countParams);

    return {
        players: rows,
        total: countRows[0].total
    };
};

const updatePlayer = async (id, player) => {
    const { name, email, phone } = player;
    const [result] = await pool.query(
        "UPDATE players SET name = ?, email = ?, phone = ? WHERE id = ? AND is_deleted = FALSE",
        [name, email, phone, id]
    );
    return result.affectedRows;
};

const softDeletePlayer = async (id) => {
    const [result] = await pool.query(
        "UPDATE players SET is_deleted = TRUE WHERE id = ? AND is_deleted = FALSE",
        [id]
    );
    return result.affectedRows;
};

module.exports = {
    findPlayerByEmail,
    createPlayer,
    getPlayerById,
    getAllPlayers,
    updatePlayer,
    softDeletePlayer
};