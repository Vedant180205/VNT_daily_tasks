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
    const { name, email, phone, team_id } = player;
    const [result] = await pool.query(
        "INSERT INTO players (name, email, phone, team_id) VALUES (?, ?, ?, ?)",
        [name, email, phone, team_id || null]
    );
    return result.insertId;
};

const getPlayerById = async (id) => {
    const [rows] = await pool.query(
        "SELECT players.*, teams.name AS team_name " +
        "FROM players " +
        "LEFT JOIN teams ON players.team_id = teams.id " +
        "WHERE players.id = ? AND players.is_deleted = FALSE",
        [id]
    );
    return rows[0];
};

const getAllPlayers = async ({ search, sort, order, limit, offset, team, date }) => {
    let whereClause = "WHERE players.is_deleted = FALSE";
    const whereParams = [];

    if (search) {
        const startsWith = `${search}%`;
        const wordStartsWith = `% ${search}%`;
        whereClause += " AND (players.name LIKE ? OR players.name LIKE ? OR players.email LIKE ?)";
        whereParams.push(startsWith, wordStartsWith, startsWith);
    }

    if (team) {
        whereClause += " AND players.team_id = ?";
        whereParams.push(team);
    }

    if (date) {
        whereClause += " AND DATE(players.created_at) = ?";
        whereParams.push(date);
    }

    const countQuery = `SELECT COUNT(*) as total FROM players ${whereClause}`;
    const [countRows] = await pool.query(countQuery, whereParams);

    const query = `
        SELECT players.*, teams.name AS team_name 
        FROM players 
        LEFT JOIN teams ON players.team_id = teams.id 
        ${whereClause} 
        ORDER BY players.${sort} ${order.toUpperCase()} 
        LIMIT ? OFFSET ?
    `;
    const params = [...whereParams, limit, offset];
    const [rows] = await pool.query(query, params);

    return {
        players: rows,
        total: countRows[0].total
    };
};

const updatePlayer = async (id, player) => {
    const { name, email, phone, team_id } = player;
    const [result] = await pool.query(
        "UPDATE players SET name = ?, email = ?, phone = ?, team_id = ? WHERE id = ? AND is_deleted = FALSE",
        [name, email, phone, team_id || null, id]
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