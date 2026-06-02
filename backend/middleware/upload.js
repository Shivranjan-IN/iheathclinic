const multer = require('multer');
const path = require('path');

// Use memory storage - files are stored in buffer (not disk)
// This allows us to store file data directly in the database
const storage = multer.memoryStorage();

// Custom filename generator for memory storage
const fileFilter = (req, file, cb) => {
    // Allow PDF, images (jpeg, jpg, png, webp, gif), and Word documents (doc, docx)
    const allowedMimes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const allowedExtensions = /pdf|jpg|jpeg|png|doc|docx|gif|webp/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimes.includes(file.mimetype);

    console.log('File upload check:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        extname: path.extname(file.originalname).toLowerCase(),
        extnameMatch: extname,
        mimetypeMatch: mimetype
    });

    if (extname || mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, images (JPEG, PNG, WEBP, GIF), and Word documents are allowed'));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 }, // 10MB default
    fileFilter
});

// Export a function to get storage with custom filename
// This is needed for profile photos which still use disk storage
const getDiskStorage = () => multer.diskStorage({
    destination: (req, file, cb) => {
        // Use absolute path to ensure files are saved to the correct location
        const uploadPath = path.join(__dirname, '..', 'uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Export both upload (memory) and uploadDisk (disk) middleware
const uploadDisk = multer({
    storage: getDiskStorage(),
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 },
    fileFilter
});

// Export as both default and named exports
module.exports = upload;
module.exports.upload = upload;
module.exports.uploadDisk = uploadDisk;
