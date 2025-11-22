const express = require('express');
const router = express.Router();
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, admin, faculty } = require('../middleware/authMiddleware');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// 1. Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Use Memory Storage (RAM)
const upload = multer({ storage: multer.memoryStorage() });

// 3. Middleware: Convert File to Base64 -> Upload to Cloudinary
const uploadToCloudinary = async (req, res, next) => {
    // If no file, skip
    if (!req.file) return next();

    try {
        console.log("🔹 Starting Base64 Upload...");

        // Convert the file buffer to a Base64 string
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        // Upload the string to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'college_notices',
            resource_type: 'auto',
        });

        console.log("✅ Cloudinary Success:", result.secure_url);
        
        // Save the URL so the controller can use it
        req.file.path = result.secure_url;
        next();

    } catch (error) {
        console.error("🔴 Cloudinary Error:", error);
        // Send the exact error to the frontend so we can see it
        return res.status(500).json({ 
            msg: 'Upload Failed', 
            error: error.message || 'Unknown Error' 
        });
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