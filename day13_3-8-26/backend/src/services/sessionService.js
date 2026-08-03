const redisClient = require('../config/redis');

const getSessionTTL = () => {
    return parseInt(process.env.SESSION_TTL_SECONDS, 10) || 86400; // default 24h
};

const createSession = async (userId, token) => {
    try {
        const key = `session:${userId}`;
        const sessionData = {
            token: token,
            login_at: new Date().toISOString()
        };
        
        // Use multi to execute commands atomically
        const multi = redisClient.multi();
        multi.hSet(key, 'token', sessionData.token);
        multi.hSet(key, 'login_at', sessionData.login_at);
        multi.expire(key, getSessionTTL());
        
        await multi.exec();
    } catch (error) {
        console.error(`Failed to create session for user ${userId}:`, error);
        throw error;
    }
};

const validateSession = async (userId, token) => {
    try {
        const key = `session:${userId}`;
        const session = await redisClient.hGetAll(key);
        
        // If hash doesn't exist, redis returns an empty object {}
        if (!session || Object.keys(session).length === 0) {
            return false;
        }

        // Validate token strictly
        if (session.token !== token) {
            return false;
        }

        return true;
    } catch (error) {
        console.error(`Failed to validate session for user ${userId}:`, error);
        // Fail-closed in case of Redis errors to ensure security
        throw error;
    }
};

const destroySession = async (userId) => {
    try {
        const key = `session:${userId}`;
        await redisClient.del(key);
    } catch (error) {
        console.error(`Failed to destroy session for user ${userId}:`, error);
        throw error;
    }
};

module.exports = {
    createSession,
    validateSession,
    destroySession
};
