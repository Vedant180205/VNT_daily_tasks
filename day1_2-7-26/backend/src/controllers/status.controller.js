const { checkDatabase } = require('../services/db.service');

// In-memory tracker (lives as long as the server runs)
let lastSuccessfulApiResponseAt = null;

async function getStatus(req, res) {
    try {
        const dbOk = await checkDatabase();

        const status = {
            api: 'ok',
            database: dbOk ? 'ok' : 'error',
            environment: process.env.NODE_ENV || 'local',
            timestamp: new Date().toISOString(),
            lastSuccessfulApiResponseAt: lastSuccessfulApiResponseAt
        };

        res.json(status);

        // Update tracker after sending response
        lastSuccessfulApiResponseAt = new Date().toISOString();

    } catch (error) {
        console.error('Unhandled error:', error);
        res.status(500).json({
            api: 'error',
            database: 'error',
            environment: process.env.NODE_ENV || 'local',
            timestamp: new Date().toISOString(),
            lastSuccessfulApiResponseAt: lastSuccessfulApiResponseAt
        });
    }
}

module.exports = { getStatus };