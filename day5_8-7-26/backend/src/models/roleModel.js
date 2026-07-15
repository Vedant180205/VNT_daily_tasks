const pool = require("../config/db");

// Responsible for checking if a specific role has a specific permission
const checkRolePermission = async (roleId, permissionName) => {
    const [rows] = await pool.query(
        `SELECT 1 
         FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = ? AND p.name = ?`,
        [roleId, permissionName]
    );
    
    // Return true if at least one record is found
    return rows.length > 0;
};

// Responsible for fetching all permissions for a specific role
const getPermissionsByRoleId = async (roleId) => {
    if (!roleId) return [];
    
    const [rows] = await pool.query(
        `SELECT p.name 
         FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = ?`,
        [roleId]
    );
    
    return rows.map(row => row.name);
};

module.exports = {
    checkRolePermission,
    getPermissionsByRoleId
};
