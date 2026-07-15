const fs = require('fs');
const path = require('path');

/**
 * Deletes a file from the local filesystem
 * @param {string} filePath - The relative URL path (e.g., "/uploads/players/avatar/file.jpg")
 */
const deleteFile = (filePath) => {
    if (!filePath) return;
    
    // Resolve absolute path
    const absolutePath = path.join(__dirname, '../../', filePath);
    
    fs.unlink(absolutePath, (err) => {
        // Ignore ENOENT (file doesn't exist)
        if (err && err.code !== 'ENOENT') {
            console.error(`Failed to delete file: ${absolutePath}`, err);
        }
    });
};

module.exports = {
    deleteFile
};
