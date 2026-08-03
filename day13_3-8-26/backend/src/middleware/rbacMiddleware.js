const pool = require("../config/db");

const requirePermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            
            // Get user's role
            const [users] = await pool.query(
                "SELECT r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?",
                [userId]
            );
            
            if (!users.length) {
                return res.status(401).json({ success: false, message: "User not found" });
            }
            
            const roleName = users[0].role_name;
            
            // Check permission in role_permissions table
            const [permissions] = await pool.query(
                `SELECT p.name 
                 FROM role_permissions rp 
                 JOIN roles r ON rp.role_id = r.id 
                 JOIN permissions p ON rp.permission_id = p.id 
                 WHERE r.name = ? AND p.name = ?`,
                [roleName, requiredPermission]
            );
            
            if (permissions.length === 0) {
                return res.status(403).json({ 
                    success: false, 
                    message: `Permission denied. Requires '${requiredPermission}'` 
                });
            }
            
            next();
        } catch (error) {
            next(error);
        }
    };
};

const requireRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
            
            const [users] = await pool.query(
                "SELECT r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?",
                [userId]
            );
            
            if (!users.length) {
                return res.status(401).json({ success: false, message: "User not found" });
            }
            
            const roleName = users[0].role_name;
            
            if (!roles.includes(roleName)) {
                return res.status(403).json({ 
                    success: false, 
                    message: `Permission denied. Admins only.` 
                });
            }
            
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = { requirePermission, requireRole };
