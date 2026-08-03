const redisClient = require("../config/redis");
const crypto = require("crypto");

/**
 * Middleware to prevent duplicate POST/PUT requests.
 * Uses Redis SET NX to acquire a temporary lock based on request payload.
 * @param {number} lockSeconds - How long to lock the exact same request (default 5s)
 */
const idempotencyMiddleware = (lockSeconds = 5) => {
    return async (req, res, next) => {
        // Only protect mutating endpoints that we want to avoid double-clicking on
        if (req.method !== 'POST' && req.method !== 'PUT') {
            return next();
        }

        try {
            // 1. Identify the user (fallback to IP if not logged in)
            const userId = req.user?.id || req.ip;

            // 2. Hash the request body to create a unique fingerprint
            // Note: If using multipart/form-data, req.body might be empty here until parsed by multer,
            // but since we place this middleware AFTER auth and BEFORE or AFTER multer?
            // Usually idempotency is best placed after parsing but before the controller.
            // Let's stringify the body and hash it.
            const payloadString = JSON.stringify(req.body || {});
            
            const hash = crypto
                .createHash('sha256')
                .update(`${req.method}:${req.originalUrl}:${payloadString}`)
                .digest('hex');

            const lockKey = `idempotency:${userId}:${hash}`;

            // 3. Try to acquire the lock using Redis SET NX (Set if Not eXists)
            // 'NX' ensures atomic operation: returns 'OK' if set, or null if it already exists
            const acquired = await redisClient.set(lockKey, 'locked', {
                NX: true,
                EX: lockSeconds
            });

            if (!acquired) {
                // Lock already exists - this is a duplicate request
                return res.status(429).json({
                    success: false,
                    message: "Duplicate request detected. Please wait before submitting again."
                });
            }

            // 4. Lock acquired, proceed to controller
            next();
        } catch (error) {
            console.error("[Idempotency] Error checking lock:", error);
            // Fail open: if Redis is down, allow the request to pass through
            next();
        }
    };
};

module.exports = idempotencyMiddleware;
