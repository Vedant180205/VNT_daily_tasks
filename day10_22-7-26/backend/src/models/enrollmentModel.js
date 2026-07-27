const pool = require("../config/db");

/**
 * Fetches a paginated, filtered list of enrollments joined with team names.
 *
 * @param {object} options - Sanitized filter/pagination options from the service layer.
 * @returns {{ enrollments: Array, total: number }}
 */
const getAllEnrollments = async ({ search, status, invite_type, role, team_id, limit, offset }) => {
    const conditions = [];
    const params = [];

    if (search) {
        conditions.push("(e.name LIKE ? OR e.phone LIKE ?)");
        params.push(`%${search}%`, `%${search}%`);
    }

    if (status !== null && status !== undefined) {
        conditions.push("e.status = ?");
        params.push(status);
    }

    if (invite_type !== null && invite_type !== undefined) {
        conditions.push("e.invite_type = ?");
        params.push(invite_type);
    }

    if (role !== null && role !== undefined) {
        conditions.push("e.role = ?");
        params.push(role);
    }

    if (team_id) {
        conditions.push("e.team_id = ?");
        params.push(team_id);
    }

    const whereClause = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

    const countQuery = `SELECT COUNT(*) AS total FROM enrollments e ${whereClause}`;
    const [countRows] = await pool.query(countQuery, params);

    const dataQuery = `
        SELECT
            e.id,
            e.name,
            e.phone,
            e.team_id,
            t.name AS team_name,
            e.status,
            e.invite_type,
            e.role,
            e.enrolled_at
        FROM enrollments e
        LEFT JOIN teams t ON e.team_id = t.id
        ${whereClause}
        ORDER BY e.enrolled_at DESC
        LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataQuery, [...params, limit, offset]);

    return {
        enrollments: rows,
        total: countRows[0].total
    };
};

module.exports = {
    getAllEnrollments
};
