const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dest = path.join(__dirname, '../../uploads/players/gallery');
        if (file.fieldname === 'avatar') {
            dest = path.join(__dirname, '../../uploads/players/avatar');
        }
        
        // Ensure directory exists
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        cb(null, uniqueSuffix + '-' + safeName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const error = new Error('Invalid file type. Only JPG and PNG are allowed.');
        error.code = 'LIMIT_UNEXPECTED_FILE';
        cb(error, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    },
    fileFilter: fileFilter
});

const playerUploads = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'gallery', maxCount: 5 }
]);

module.exports = {
    playerUploads
};
