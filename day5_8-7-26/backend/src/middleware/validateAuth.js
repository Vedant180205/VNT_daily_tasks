const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Responsible for validating user input for registration requests
function validateRegister(req, res, next) {
    const { name, email, password } = req.body;

    // Name Validation
    if (!name || !name.trim()) {
        const error = new Error("Name is required");
        error.statusCode = 400;
        return next(error);
    }

    // Email Validation
    if (!email) {
        const error = new Error("Email is required");
        error.statusCode = 400;
        return next(error);
    }

    if (!emailRegex.test(email.trim())) {
        const error = new Error("Invalid email format");
        error.statusCode = 400;
        return next(error);
    }

    // Password Validation
    if (!password) {
        const error = new Error("Password is required");
        error.statusCode = 400;
        return next(error);
    }

    if (password.length < 6) {
        const error = new Error("Password must be at least 6 characters");
        error.statusCode = 400;
        return next(error);
    }

    next();
}

// Responsible for validating user input for login requests
function validateLogin(req, res, next) {
    const { email, password } = req.body;

    if (!email) {
        const error = new Error("Email is required");
        error.statusCode = 400;
        return next(error);
    }

    if (!password) {
        const error = new Error("Password is required");
        error.statusCode = 400;
        return next(error);
    }

    next();
}

module.exports = {
    validateRegister,
    validateLogin
};
