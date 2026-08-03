const cacheService = require("../services/cacheService");

/**
 * Express middleware factory for caching GET responses.
 * @param {number} ttlSeconds - Time to live in seconds
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (ttlSeconds = 60) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== "GET") {
            return next();
        }

        try {
            // Create a deterministic cache key based on the URL (which includes query params)
            // We use a base64 encoded version of the originalUrl to ensure it's a valid Redis key
            const urlKey = Buffer.from(req.originalUrl).toString('base64');
            const cacheKey = `cache:${urlKey}`;

            // 1. Check if we have a cached response
            const cachedData = await cacheService.get(cacheKey);

            if (cachedData) {
                console.log(`[Cache Middleware] HIT: ${req.originalUrl}`);
                res.setHeader('X-Cache', 'HIT');
                return res.json(cachedData);
            }

            console.log(`[Cache Middleware] MISS: ${req.originalUrl}`);
            res.setHeader('X-Cache', 'MISS');

            // 2. If not cached, we need to intercept the response
            // We monkey-patch res.json so that when the controller calls it, 
            // we grab the data and store it in Redis before sending it to the client.
            const originalJson = res.json;

            res.json = function (body) {
                // Only cache successful 2xx responses
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    cacheService.set(cacheKey, body, ttlSeconds);
                }
                
                // Call the original res.json with the body to actually send the response
                return originalJson.call(this, body);
            };

            next();
        } catch (error) {
            console.error("Cache middleware error:", error);
            // Fail open: if cache fails, just proceed to the controller
            next();
        }
    };
};

module.exports = cacheMiddleware;
