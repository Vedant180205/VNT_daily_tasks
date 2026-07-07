// Validation middleware for Team creation
function validateTeam(req, res, next) {
    const { name } = req.body;

    if (!name || !name.trim()) {
        const error = new Error("Team name is required and cannot be empty");
        error.statusCode = 400;
        return next(error);
    }

    // Trim whitespace to ensure clean data
    req.body.name = name.trim();

    next();
}

module.exports = validateTeam;
