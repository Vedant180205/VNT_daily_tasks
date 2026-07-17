const enrollmentModel = require("../models/enrollmentModel");

/**
 * Retrieves a paginated, filtered list of enrollments.
 * Sanitizes and validates all query parameters before delegating to the model.
 *
 * @param {object} options - Raw query params from req.query
 * @returns {{ page, limit, total, totalPages, data }}
 */
const getEnrollments = async (options) => {
    const page  = Math.max(1, parseInt(options.page,  10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(options.limit, 10) || 50));
    const offset = (page - 1) * limit;
    const search = options.search ? String(options.search).trim() : "";

    // TINYINT flags — only apply filter if the param is explicitly provided
    const status      = options.status      !== undefined ? parseInt(options.status,      10) : null;
    const invite_type = options.invite_type !== undefined ? parseInt(options.invite_type, 10) : null;
    const role        = options.role        !== undefined ? parseInt(options.role,        10) : null;
    const team_id     = options.team_id     !== undefined ? parseInt(options.team_id,     10) : null;

    // Validate flag ranges to avoid nonsense DB queries
    if (status      !== null && ![0, 1, 2].includes(status)) {
        const error = new Error("Invalid status value. Must be 0, 1, or 2.");
        error.status = 400;
        throw error;
    }
    if (invite_type !== null && ![0, 1].includes(invite_type)) {
        const error = new Error("Invalid invite_type value. Must be 0 or 1.");
        error.status = 400;
        throw error;
    }
    if (role !== null && ![1, 2, 3, 4].includes(role)) {
        const error = new Error("Invalid role value. Must be 1, 2, 3, or 4.");
        error.status = 400;
        throw error;
    }

    const result = await enrollmentModel.getAllEnrollments({
        search,
        status,
        invite_type,
        role,
        team_id,
        limit,
        offset
    });

    const totalPages = Math.ceil(result.total / limit);

    return {
        page,
        limit,
        total: result.total,
        totalPages,
        data: result.enrollments
    };
};

module.exports = {
    getEnrollments
};
