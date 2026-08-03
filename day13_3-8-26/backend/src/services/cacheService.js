const redisClient = require('../config/redis');

/**
 * Gets a parsed JSON value from the cache.
 * @param {string} key 
 * @returns {Object|null} The parsed object or null if not found/error
 */
const get = async (key) => {
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Cache GET error for key ${key}:`, error);
        return null; // Fail-open: if cache read fails, we can fallback to DB
    }
};

/**
 * Sets a JSON-stringified value in the cache with a TTL.
 * @param {string} key 
 * @param {Object} data 
 * @param {number} ttlSeconds 
 */
const set = async (key, data, ttlSeconds = 60) => {
    try {
        const stringified = JSON.stringify(data);
        await redisClient.setEx(key, ttlSeconds, stringified);
    } catch (error) {
        console.error(`Cache SET error for key ${key}:`, error);
        // Don't throw, failing to cache shouldn't break the application
    }
};

/**
 * Deletes a specific key from the cache.
 * @param {string} key 
 */
const del = async (key) => {
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error(`Cache DEL error for key ${key}:`, error);
    }
};

/**
 * Deletes all keys matching a pattern using SCAN (non-blocking).
 * Use this instead of KEYS * in production!
 * @param {string} pattern - e.g., 'players:*'
 */
const delByPattern = async (pattern) => {
    try {
        let cursor = 0;
        let keysDeleted = 0;
        
        do {
            // Use SCAN to avoid blocking Redis with KEYS command
            const result = await redisClient.scan(cursor, {
                MATCH: pattern,
                COUNT: 100
            });
            
            cursor = result.cursor;
            const keys = result.keys;
            
            if (keys && keys.length > 0) {
                await redisClient.del(keys); // del accepts an array of keys
                keysDeleted += keys.length;
            }
        } while (cursor !== 0);
        
        if (keysDeleted > 0) {
            console.log(`Cache invalidated: deleted ${keysDeleted} keys matching '${pattern}'`);
        }
    } catch (error) {
        console.error(`Cache SCAN/DEL error for pattern ${pattern}:`, error);
    }
};

module.exports = {
    get,
    set,
    del,
    delByPattern
};
