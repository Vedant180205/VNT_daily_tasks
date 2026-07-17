const pool = require("../config/db");

// GET /api/locations/countries
exports.getCountries = async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            "SELECT id, name, iso2, iso3, emoji FROM countries ORDER BY name ASC"
        );
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        next(error);
    }
};

// GET /api/locations/countries/:id/states
exports.getStatesByCountry = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            "SELECT id, name, state_code, latitude, longitude FROM states WHERE country_id = ? ORDER BY name ASC",
            [id]
        );
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        next(error);
    }
};

// GET /api/locations/states/:id/cities
exports.getCitiesByState = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            "SELECT id, name, latitude, longitude FROM cities WHERE state_id = ? ORDER BY name ASC",
            [id]
        );
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        next(error);
    }
};

// GET /api/locations/cities?search=xyz
exports.searchCities = async (req, res, next) => {
    try {
        const { search } = req.query;
        let query = `
            SELECT c.id, c.name, s.name as state_name, co.name as country_name 
            FROM cities c 
            JOIN states s ON c.state_id = s.id 
            JOIN countries co ON c.country_id = co.id 
        `;
        let params = [];

        if (search && search.trim() !== '') {
            query += " WHERE c.name LIKE ? ";
            params.push(`${search}%`); // Prefix search is index-friendly
        }

        query += " ORDER BY c.name ASC LIMIT 50"; // Limit results to prevent massive payloads

        const [rows] = await pool.query(query, params);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        next(error);
    }
};
