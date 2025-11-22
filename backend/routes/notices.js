const express = require('express');
const router = express.Router();
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, admin, faculty } = require('../middleware/authMiddleware');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs'); // Built-in module, no install needed

// 1. Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Local Storage (Temporary)
// This creates an 'uploads' folder automatically if it doesn't exist
const upload = multer({ dest: 'uploads/' });

// 3. Middleware to Upload to Cloudinary
const uploadToCloudinary = async (req, res, next) => {
    // If no file attached, skip this step
    if (!req.file) return next();

    try {
        console.log("🔹 Uploading file to Cloudinary...");
        
        // Upload the local file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'college_notices',
            resource_type: 'auto', // Auto-detect Image vs PDF
        });

        console.log("✅ Cloudinary Success:", result.secure_url);

        // IMPORTANT: Delete the local file to save space
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Failed to delete temp file:", err);
        });

        // Overwrite the path with the new Cloudinary URL so the Controller uses it
        req.file.path = result.secure_url;
        next();

    } catch (error) {
        console.error("🔴 Cloudinary Error:", error);
        return res.status(500).json({ msg: 'Cloudinary Upload Failed', error: error.message });
    }
};

// --- ROUTES ---

router.route('/')
    .get(protect, getNotices)
    // Flow: Multer saves locally -> We upload to Cloud -> We delete local -> Controller saves DB
    .post(protect, faculty, upload.single('noticeFile'), uploadToCloudinary, createNotice);

router.route('/:id')
    .put(protect, admin, updateNotice)
    .delete(protect, faculty, deleteNotice);

module.exports = router;