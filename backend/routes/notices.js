const express = require('express');
const router = express.Router();
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, admin, faculty } = require('../middleware/authMiddleware');

// --- CLOUDINARY SETUP ---
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// --- DETECTIVE LOGS (Debug Check) ---
console.log("---------------------------------------");
console.log("🕵️ DETECTIVE CHECK IN NOTICES.JS:");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
// We only print the first 4 characters for security
console.log("API Key starts with:", process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.substring(0, 4) : "MISSING");
console.log("API Secret starts with:", process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.substring(0, 4) : "MISSING");
console.log("---------------------------------------");
// ------------------------------------

// 1. Configure Cloudinary
try {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
} catch (configError) {
    console.error("🔴 Cloudinary Config Failed:", configError);
}

// 2. Configure Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'college_notices',
        resource_type: 'auto', 
    },
});

const upload = multer({ storage: storage });

// --- ROUTES ---

router.route('/')
    .get(protect, getNotices)
    .post(protect, faculty, (req, res, next) => {
        console.log("🔹 Attempting Upload...");
        
        const uploadMiddleware = upload.single('noticeFile');
        
        uploadMiddleware(req, res, function (err) {
            if (err) {
                console.error("🔴 UPLOAD ERROR DETAILS:", err);
                return res.status(500).json({ msg: 'Upload Failed', error: err.message || err });
            }
            console.log("✅ Upload Success!");
            next();
        });
    }, createNotice);

router.route('/:id')
    .put(protect, admin, updateNotice)
    .delete(protect, faculty, deleteNotice);

module.exports = router;