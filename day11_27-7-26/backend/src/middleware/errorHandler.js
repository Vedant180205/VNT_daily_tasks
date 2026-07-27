const errorHandler = (err, req, res, next) => {
    // Log the error for internal tracking
    console.error(err);

    // Handle Multer specific errors
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'File is too large. Max size is 2MB.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ success: false, message: 'Too many files uploaded or invalid field name.' });
        }
        return res.status(400).json({ success: false, message: err.message });
    }
    
    // Handle custom file filter errors
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ success: false, message: err.message });
    }

    const status = err.statusCode || err.status || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(status).json({
        success: false,
        message
    });
};

module.exports = errorHandler;
