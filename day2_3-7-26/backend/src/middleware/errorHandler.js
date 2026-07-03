const errorHandler = (err, req, res, next) => {
    // Log the error for internal tracking
    console.error(err);

    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(status).json({
        success: false,
        message
    });
};

module.exports = errorHandler;
