const jwt = require("jsonwebtoken");

// Middleware to authenticate requests using JWT
const authMiddleware = (req, res, next) => {
    // 1. Read the Authorization header
    const authHeader = req.header("Authorization");

    // 2. Validate if the header exists
    if (!authHeader) {
        const error = new Error("Access token is required");
        error.statusCode = 401;
        return next(error);
    }

    // 3. Validate the format (must start with 'Bearer ')
    if (!authHeader.startsWith("Bearer ")) {
        const error = new Error("Invalid authorization header");
        error.statusCode = 401;
        return next(error);
    }

    // 4. Extract the token by removing 'Bearer ' prefix
    const token = authHeader.replace("Bearer ", "");

    try {
        // 5. Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 6. Attach the decoded payload to the request object
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role_id: decoded.role_id,
            role_name: decoded.role_name
        };

        // 7. Call next() to pass control to the next middleware or controller
        next();
    } catch (error) {
        // Catch verification errors (expired, malformed, or invalid signature)
        const err = new Error("Invalid or expired token");
        err.statusCode = 401;
        return next(err);
    }
};

module.exports = authMiddleware;
