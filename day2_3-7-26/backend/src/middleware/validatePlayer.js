const nameRegex = /^[A-Za-z\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

function validatePlayer(req, res, next) {
    const { name, email, phone } = req.body;

    // Name Validation
    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Name is required"
        });
    }

    if (!name.trim()) {
        return res.status(400).json({
            success: false,
            message: "Name cannot be empty"
        });
    }

    if (!nameRegex.test(name.trim())) {
        return res.status(400).json({
            success: false,
            message: "Name should contain only alphabets and spaces"
        });
    }

    // Email Validation
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required"
        });
    }

    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

    // Phone Validation
    if (!phone) {
        return res.status(400).json({
            success: false,
            message: "Phone number is required"
        });
    }

    if (!phoneRegex.test(phone.trim())) {
        return res.status(400).json({
            success: false,
            message: "Phone number must contain exactly 10 digits"
        });
    }

    next();
}

module.exports = validatePlayer;