const nameRegex = /^[A-Za-z\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

function validatePlayer(req, res, next) {
    const { name, email, phone } = req.body;

    // Name Validation
    if (!name) {
        const error = new Error("Name is required");
        error.statusCode = 400;
        return next(error);
    }

    if (!name.trim()) {
        const error = new Error("Name cannot be empty");
        error.statusCode = 400;
        return next(error);
    }

    if (!nameRegex.test(name.trim())) {
        const error = new Error("Name should contain only alphabets and spaces");
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

    // Phone Validation
    if (!phone) {
        const error = new Error("Phone number is required");
        error.statusCode = 400;
        return next(error);
    }

    if (!phoneRegex.test(phone.trim())) {
        const error = new Error("Phone number must contain exactly 10 digits");
        error.statusCode = 400;
        return next(error);
    }

    next();
}

module.exports = validatePlayer;