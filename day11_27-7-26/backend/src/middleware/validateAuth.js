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

// Responsible for validating Phase 1 Organizer Application Lead Form
function validateOrganizerApplication(req, res, next) {
    const { full_name, email, phone, org_name, state, city } = req.body;

    if (!full_name || !full_name.trim()) return next(Object.assign(new Error("Full Name is required"), { statusCode: 400 }));

    if (!org_name || !org_name.trim()) return next(Object.assign(new Error("Organization Name is required"), { statusCode: 400 }));

    if (!email || !emailRegex.test(email.trim())) return next(Object.assign(new Error("Valid email is required"), { statusCode: 400 }));

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) return next(Object.assign(new Error("Valid 10-digit Indian phone number required"), { statusCode: 400 }));

    if (!state || !state.trim()) return next(Object.assign(new Error("State is required"), { statusCode: 400 }));

    if (!city || !city.trim()) return next(Object.assign(new Error("City is required"), { statusCode: 400 }));

    next();
}

// Responsible for validating Phase 2/3 Registration & KYC Form
function validateOrganizerRegistration(req, res, next) {
    const { password, confirm_password, aadhaar_number, pan_number } = req.body;

    if (!password || password.length < 8) return next(Object.assign(new Error("Password must be at least 8 characters"), { statusCode: 400 }));

    if (confirm_password && password !== confirm_password) return next(Object.assign(new Error("Passwords do not match"), { statusCode: 400 }));

    if (aadhaar_number && !/^\d{12}$/.test(aadhaar_number)) return next(Object.assign(new Error("Valid 12-digit Aadhaar number required"), { statusCode: 400 }));

    if (pan_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan_number)) return next(Object.assign(new Error("Valid PAN number required"), { statusCode: 400 }));

    next();
}

module.exports = {
    validateRegister,
    validateLogin,
    validateOrganizerApplication,
    validateOrganizerRegistration
};
