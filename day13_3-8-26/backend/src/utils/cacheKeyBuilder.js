/**
 * Utility for building deterministic cache keys
 */

/**
 * Builds a consistent cache key from a base prefix and an object of parameters.
 * Sorts the keys alphabetically so that the order of query params doesn't matter.
 * 
 * @param {string} prefix - The base namespace (e.g., 'players')
 * @param {Object} params - The query parameters or fields to include
 * @returns {string} - The constructed cache key
 */
const buildKey = (prefix, params = {}) => {
    // Sort keys alphabetically to ensure deterministic output
    const sortedKeys = Object.keys(params).sort();
    
    // Map to key=value pairs, ignoring null/undefined
    const parts = sortedKeys.map(key => {
        const val = params[key];
        if (val === null || val === undefined) return `${key}=`;
        return `${key}=${val}`;
    });

    if (parts.length === 0) return prefix;
    
    return `${prefix}:${parts.join(':')}`;
};

/**
 * Specific builder for player listing
 */
const buildPlayerListKey = (queryParams) => {
    return buildKey('players', {
        page: queryParams.page || 1,
        limit: queryParams.limit || 10,
        search: queryParams.search || '',
        sort: queryParams.sort || 'created_at',
        order: queryParams.order || 'desc',
        team: queryParams.team || '',
        status: queryParams.status || ''
    });
};

module.exports = {
    buildKey,
    buildPlayerListKey
};
