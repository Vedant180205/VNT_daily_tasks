const pool = require('../config/db.config');

async function checkDatabase() {
    try {
        const connection = await pool.getConnection();
        await connection.query('SELECT 1 + 1 AS result');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database check failed:', error.message);
        return false;
    }
}

module.exports = { checkDatabase };