const pool = require("../config/db");

const notificationModel = {
    createNotification: async (title, message, targetRoleId) => {
        // targetRoleId can be null (meaning all users/roles)
        const [result] = await pool.query(
            "INSERT INTO notifications (title, message, target_role_id) VALUES (?, ?, ?)",
            [title, message, targetRoleId || null]
        );
        return result.insertId;
    },

    getAllNotifications: async () => {
        const [rows] = await pool.query(
            `SELECT n.id, n.title, n.message, n.target_role_id, r.name as target_role_name, n.created_at 
             FROM notifications n 
             LEFT JOIN roles r ON n.target_role_id = r.id 
             ORDER BY n.created_at DESC`
        );
        return rows;
    },

    getNotificationsForRole: async (roleId) => {
        const [rows] = await pool.query(
            `SELECT n.id, n.title, n.message, n.target_role_id, r.name as target_role_name, n.created_at 
             FROM notifications n 
             LEFT JOIN roles r ON n.target_role_id = r.id 
             WHERE n.target_role_id IS NULL OR n.target_role_id = ? 
             ORDER BY n.created_at DESC`,
            [roleId]
        );
        return rows;
    },

    deleteNotification: async (id) => {
        const [result] = await pool.query(
            "DELETE FROM notifications WHERE id = ?",
            [id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = notificationModel;
