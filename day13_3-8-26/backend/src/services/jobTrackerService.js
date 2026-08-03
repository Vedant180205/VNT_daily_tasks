const redisBull = require('../config/redisBull');

/**
 * Initializes a new job tracker in Redis.
 * @param {string} type - The job type (e.g., 'upload')
 * @param {string} id - The unique job ID
 * @param {object} initialStatus - Initial fields (e.g., { total: 0, completed: 0, failed: 0 })
 */
const initializeJob = async (type, id, initialStatus) => {
    try {
        await redisBull.hset(`${type}:${id}:status`, initialStatus);
        // Set an expiry so these don't live forever (e.g., 24 hours)
        await redisBull.expire(`${type}:${id}:status`, 86400);
    } catch (error) {
        console.error(`[JobTracker] Error initializing job ${id}:`, error);
    }
};

/**
 * Increments a specific counter for a job.
 * @param {string} type - The job type
 * @param {string} id - The unique job ID
 * @param {string} field - The field to increment (e.g., 'total', 'completed')
 * @param {number} amount - The amount to increment by
 */
const incrementJobProgress = async (type, id, field, amount = 1) => {
    try {
        await redisBull.hincrby(`${type}:${id}:status`, field, amount);
    } catch (error) {
        console.error(`[JobTracker] Error incrementing ${field} for job ${id}:`, error);
    }
};

/**
 * Adds an error message to a job's error log (stored in a Redis List).
 * @param {string} type - The job type
 * @param {string} id - The unique job ID
 * @param {object} errorObj - The error details to log
 */
const addJobError = async (type, id, errorObj) => {
    try {
        const errorStr = JSON.stringify(errorObj);
        await redisBull.rpush(`${type}:${id}:errors`, errorStr);
        await redisBull.expire(`${type}:${id}:errors`, 86400); // match status expiry
    } catch (error) {
        console.error(`[JobTracker] Error adding error log for job ${id}:`, error);
    }
};

/**
 * Retrieves the current status and any errors for a job.
 * @param {string} type - The job type
 * @param {string} id - The unique job ID
 * @returns {object|null} - The job status or null if not found
 */
const getJobStatus = async (type, id) => {
    try {
        const status = await redisBull.hgetall(`${type}:${id}:status`);
        
        if (!status || Object.keys(status).length === 0) {
            return null;
        }

        const failed = parseInt(status.failed, 10) || 0;
        let errors = [];

        if (failed > 0) {
            const rawErrors = await redisBull.lrange(`${type}:${id}:errors`, 0, -1);
            errors = rawErrors.map(errStr => {
                try {
                    return JSON.parse(errStr);
                } catch(e) {
                    return { reason: errStr };
                }
            });
        }

        return {
            total: parseInt(status.total, 10) || 0,
            completed: parseInt(status.completed, 10) || 0,
            failed,
            errors
        };
    } catch (error) {
        console.error(`[JobTracker] Error getting status for job ${id}:`, error);
        return null;
    }
};

module.exports = {
    initializeJob,
    incrementJobProgress,
    addJobError,
    getJobStatus
};
