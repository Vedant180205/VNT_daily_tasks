const roleModel = require("../models/roleModel");

// Factory function that returns a middleware for a specific permission
const requirePermission = (permissionName) => {
    return async (req, res, next) => {
        try {
            // 1. Ensure the user is authenticated (authMiddleware should run before this)
            if (!req.user || !req.user.role_id) {
                const error = new Error("Access denied: No role assigned");
                error.statusCode = 403;
                return next(error);
            }

            // 2. Check if the user's role has the requested permission
            const hasPermission = await roleModel.checkRolePermission(req.user.role_id, permissionName);

            // 3. If they don't have the permission, throw a 403
            if (!hasPermission) {
                const error = new Error("Access denied");
                error.statusCode = 403;
                return next(error);
            }

            // 4. If they do, continue to the controller
            next();
        } catch (err) {
            next(err);
        }
    };
};

module.exports = requirePermission;
