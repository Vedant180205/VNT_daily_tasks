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

    // Avatar Validation (required on create)
    if (req.method === 'POST') {
        if (!req.files || !req.files['avatar'] || req.files['avatar'].length === 0) {
            const error = new Error("Avatar image is required");
            error.statusCode = 400;
            return next(error);
        }
    }
    
    // Gallery validation
    if (req.files && req.files['gallery']) {
        const galleryFiles = req.files['gallery'];
        
        // Check for duplicates in the current upload batch
        const filenames = galleryFiles.map(f => f.originalname);
        const uniqueFilenames = new Set(filenames);
        if (uniqueFilenames.size !== filenames.length) {
            const error = new Error("Duplicate images found in gallery upload. Please select unique files.");
            error.statusCode = 400;
            return next(error);
        }
        
        // Check total max 5 (including retained)
        let retainedCount = 0;
        if (req.body.retained_gallery) {
            retainedCount = Array.isArray(req.body.retained_gallery) 
                ? req.body.retained_gallery.length 
                : 1;
        }
        
        if (galleryFiles.length + retainedCount > 5) {
            const error = new Error("Maximum of 5 gallery images allowed total.");
            error.statusCode = 400;
            return next(error);
        }
    }

    next();
}

module.exports = validatePlayer;