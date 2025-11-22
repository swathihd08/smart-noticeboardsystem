const express = require('express');
const router = express.Router();
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, admin, faculty } = require('../middleware/authMiddleware');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier'); // The new tool

// 1. Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Use Memory Storage
const upload = multer({ storage: multer.memoryStorage() });

// 3. Stream Upload Logic
const uploadToCloudinary = (req, res, next) => {
    if (!req.file) return next();

    console.log("🔹 Starting Stream Upload...");

    let cld_upload_stream = cloudinary.uploader.upload_stream(
        {
            folder: "college_notices",
            resource_type: "auto"
        },
        (error, result) => {
            if (error) {
                console.error("🔴 Stream Upload Error:", error);
                // Send the full error object so we can debug if it fails
                return res.status(500).json({ msg: 'Upload Failed', error: JSON.stringify(error) });
            }
            console.log("✅ Upload Success:", result.secure_url);
            req.file.path = result.secure_url;
            next();
        }
    );

    // Pipe the file from memory to Cloudinary
    streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
};

// --- ROUTES ---

router.route('/')
    .get(protect, getNotices)
    .post(protect, faculty, upload.single('noticeFile'), uploadToCloudinary, createNotice);

router.route('/:id')
    .put(protect, admin, updateNotice)
    .delete(protect, faculty, deleteNotice);

module.exports = router;