const adminService = require("../services/adminService");

const getPendingOrganizers = async (req, res, next) => {
    try {
        const organizers = await adminService.getPendingOrganizers();
        res.status(200).json({
            success: true,
            data: organizers
        });
    } catch (error) {
        next(error);
    }
};

const approveOrganizer = async (req, res, next) => {
    try {
        const { id } = req.params;
        await adminService.approveOrganizer(id);
        res.status(200).json({
            success: true,
            message: "Organizer approved successfully"
        });
    } catch (error) {
        next(error);
    }
};

const getOrganizers = async (req, res, next) => {
    try {
        const organizers = await adminService.getAllOrganizers();
        res.status(200).json({
            success: true,
            data: organizers
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPendingOrganizers,
    approveOrganizer,
    getOrganizers
};
