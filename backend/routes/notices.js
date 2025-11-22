const express = require('express');
const router = express.Router();
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, admin, faculty } = require('../middleware/authMiddleware');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// 1. Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. AUTO-CREATE UPLOAD FOLDER (The Fix)
// We check if 'uploads' exists. If not, we make it.
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 3. Configure Multer
const upload = multer({ dest: uploadDir });

// 4. Middleware to Upload to Cloudinary
const uploadToCloudinary = async (req, res, next) => {
    if (!req.file) return next();

    try {
        console.log("🔹 Uploading file to Cloudinary...");
        
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'college_notices',
            resource_type: 'auto',
        });

        console.log("✅ Cloudinary Success:", result.secure_url);

        // Delete the local temp file
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Failed to delete temp file:", err);
        });

        req.file.path = result.secure_url;
        next();

    } catch (error) {
        console.error("🔴 Cloudinary Error:", error);
        // Delete temp file even if upload failed
        fs.unlink(req.file.path, () => {}); 
        return res.status(500).json({ msg: 'Cloudinary Upload Failed', error: error.message });
    }
};

// --- ROUTES ---

router.route('/')
    .get(protect, getNotices)
    .post(protect, faculty, upload.single('noticeFile'), uploadToCloudinary, createNotice);

router.route('/:id')
    .put(protect, admin, updateNotice)
    .delete(protect, faculty, deleteNotice);

module.exports = router;