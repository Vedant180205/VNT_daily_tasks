const { validatePlayerData } = require('../utils/validators');

function validatePlayer(req, res, next) {
    try {
        validatePlayerData(req.body);
    } catch (err) {
        const error = new Error(err.message);
        error.statusCode = err.status || 400;
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