const pool = require("../config/db");
const notificationModel = require("../models/notificationModel");

const createNotification = async (req, res, next) => {
    try {
        const { title, message, target_role_id } = req.body;

        if (!title || !title.trim() || !message || !message.trim()) {
            const error = new Error("Title and message are required");
            error.statusCode = 400;
            throw error;
        }

        const id = await notificationModel.createNotification(
            title.trim(),
            message.trim(),
            target_role_id
        );

        res.status(201).json({
            success: true,
            message: "Notification created successfully",
            data: { id }
        });
    } catch (error) {
        next(error);
    }
};

const getNotifications = async (req, res, next) => {
    try {
        const notifications = await notificationModel.getAllNotifications();
        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

const deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const success = await notificationModel.deleteNotification(id);

        if (!success) {
            const error = new Error("Notification not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            message: "Notification deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

const getMyNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // Fetch user's role_id
        const [users] = await pool.query(
            "SELECT role_id FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const roleId = users[0].role_id;
        const notifications = await notificationModel.getNotificationsForRole(roleId);

        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createNotification,
    getNotifications,
    deleteNotification,
    getMyNotifications
};
