const express = require('express');
const router = express.Router();
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, admin, faculty } = require('../middleware/authMiddleware');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream'); // Built-in Node.js tool

// 1. Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Multer to use MEMORY (RAM) instead of Disk
const upload = multer({ storage: multer.memoryStorage() });

// 3. Middleware to Stream Buffer to Cloudinary
const uploadToCloudinary = (req, res, next) => {
    // If no file attached, just skip to controller
    if (!req.file) return next();

    console.log("🔹 Starting Memory Stream Upload...");

    // Create a stream to Cloudinary
    const stream = cloudinary.uploader.upload_stream(
        {
            folder: 'college_notices',
            resource_type: 'auto',
        },
        (error, result) => {
            if (error) {
                console.error("🔴 Cloudinary Upload Error:", error);
                return res.status(500).json({ msg: 'Cloudinary Upload Failed', error: error.message });
            }
            
            console.log("✅ Cloudinary Success:", result.secure_url);
            
            // Save the URL to the file object so the controller can see it
            req.file.path = result.secure_url;
            next();
        }
    );

    // Convert the file buffer (RAM) into a readable stream and pipe it to Cloudinary
    Readable.from(req.file.buffer).pipe(stream);
};

// --- ROUTES ---

router.route('/')
    .get(protect, getNotices)
    .post(protect, faculty, upload.single('noticeFile'), uploadToCloudinary, createNotice);

router.route('/:id')
    .put(protect, admin, updateNotice)
    .delete(protect, faculty, deleteNotice);

module.exports = router;