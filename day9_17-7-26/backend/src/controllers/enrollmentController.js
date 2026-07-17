const enrollmentService = require("../services/enrollmentService");

/**
 * GET /api/enrollments
 * Returns a paginated, filtered list of enrollments.
 * Supports: page, limit, search, status, invite_type, role, team_id
 */
const getEnrollments = async (req, res, next) => {
    try {
        const result = await enrollmentService.getEnrollments(req.query);
        res.json({
            success: true,
            data: result.data,
            pagination: {
                page:       result.page,
                limit:      result.limit,
                total:      result.total,
                totalPages: result.totalPages
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEnrollments
};
