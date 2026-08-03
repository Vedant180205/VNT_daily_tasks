const redisClient = require('../config/redis');
const db = require('../config/db');

const INDEX_KEY = 'players_search';

/**
 * Builds the Redis autocomplete index from the database.
 * To be called once on server startup.
 */
const buildIndex = async () => {
    try {
        console.log("[Search Index] Building autocomplete index...");
        
        // 1. Fetch all non-deleted players
        const [players] = await db.execute("SELECT id, name FROM players WHERE is_deleted = FALSE");
        
        if (players.length === 0) {
            console.log("[Search Index] No players found to index.");
            return;
        }

        // 2. Clear existing index
        await redisClient.del(INDEX_KEY);

        // 3. Prepare ZADD arguments.
        // Node-Redis v4+ expects an array of objects: [{ score, value }, ...]
        const zaddArgs = players.map(player => ({
            score: 0,
            value: `${player.name.toLowerCase()}:${player.id}`
        }));

        // 4. Batch insert into Redis Sorted Set
        await redisClient.zAdd(INDEX_KEY, zaddArgs);
        
        console.log(`[Search Index] Successfully indexed ${players.length} players.`);
    } catch (error) {
        console.error("[Search Index] Failed to build index:", error);
    }
};

/**
 * Adds a single player to the autocomplete index
 */
const addToIndex = async (player) => {
    try {
        if (!player || !player.id || !player.name) return;
        const member = `${player.name.toLowerCase()}:${player.id}`;
        await redisClient.zAdd(INDEX_KEY, [{ score: 0, value: member }]);
    } catch (error) {
        console.error(`[Search Index] Failed to add player ${player.id} to index:`, error);
    }
};

/**
 * Removes a player from the index (e.g., on delete or name change)
 */
const removeFromIndex = async (id, oldName) => {
    try {
        const member = `${oldName.toLowerCase()}:${id}`;
        await redisClient.zRem(INDEX_KEY, member);
    } catch (error) {
        console.error(`[Search Index] Failed to remove player ${id} from index:`, error);
    }
};

/**
 * Performs a prefix search using ZRANGEBYLEX
 */
const autocomplete = async (prefix, limit = 10) => {
    if (!prefix || prefix.trim() === '') {
        return [];
    }

    try {
        const lowerPrefix = prefix.toLowerCase().trim();
        // [ means inclusive. \xff is the maximum byte value (so we get everything starting with prefix)
        const min = `[${lowerPrefix}`;
        const max = `[${lowerPrefix}\xff`;

        // ZRANGEBYLEX players_search [prefix [prefix\xff LIMIT 0 10
        const members = await redisClient.zRangeByLex(INDEX_KEY, min, max, {
            LIMIT: { offset: 0, count: limit }
        });

        // Parse "name:id" back into objects
        const results = members.map(member => {
            const lastColonIndex = member.lastIndexOf(':');
            const id = parseInt(member.substring(lastColonIndex + 1), 10);
            const name = member.substring(0, lastColonIndex);
            
            // Note: Since we lowercase everything for indexing, the exact original capitalization is lost here.
            // For a pure autocomplete dropdown, this is usually acceptable. 
            // The frontend can just capitalize the words via CSS or JS.
            return { id, name };
        });

        return results;
    } catch (error) {
        console.error("[Search Index] Autocomplete query failed:", error);
        return [];
    }
};

module.exports = {
    buildIndex,
    addToIndex,
    removeFromIndex,
    autocomplete
};
