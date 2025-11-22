const express = require('express');
const router = express.Router();
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, admin, faculty } = require('../middleware/authMiddleware');

// --- CLOUDINARY SETUP ---
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 1. Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Storage (SIMPLIFIED)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'college_notices',
        // We removed 'allowed_formats' and 'resource_type' to prevent crashes
    },
});

const upload = multer({ storage: storage });

// --- ROUTES ---

router.route('/')
    .get(protect, getNotices)
    .post(protect, faculty, (req, res, next) => {
        console.log("🔹 Request received at Backend Upload Route"); // Debug Log 1
        
        const uploadMiddleware = upload.single('noticeFile');
        
        uploadMiddleware(req, res, function (err) {
            if (err) {
                console.error("🔴 MULTER/CLOUDINARY ERROR:", err); // Debug Log 2
                // Send the actual error message to the frontend so you can see it in Inspect Element
                return res.status(500).json({ msg: 'Upload Failed', error: err.message || err });
            }
            console.log("✅ File uploaded successfully to Cloudinary"); // Debug Log 3
            next();
        });
    }, createNotice);

router.route('/:id')
    .put(protect, admin, updateNotice)
    .delete(protect, faculty, deleteNotice);

module.exports = router;