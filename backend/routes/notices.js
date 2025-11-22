const express = require('express');
const router = express.Router();
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, admin, faculty } = require('../middleware/authMiddleware');

// --- CLOUDINARY & MULTER SETUP ---
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier'); // We will use the built-in stream capabilities

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use Memory Storage (Keeps file in RAM instead of disk)
const upload = multer({ storage: multer.memoryStorage() });

// --- HELPER FUNCTION TO UPLOAD TO CLOUDINARY ---
const uploadToCloudinary = (req, res, next) => {
    // If no file was sent, just skip to the controller
    if (!req.file) return next();

    console.log("🔹 Starting Manual Cloudinary Upload...");

    const uploadStream = cloudinary.uploader.upload_stream(
        {
            folder: 'college_notices',
            resource_type: 'auto', // Handle PDFs and Images
        },
        (error, result) => {
            if (error) {
                console.error("🔴 Cloudinary Upload Error:", error);
                return res.status(500).json({ msg: 'Cloudinary Error', error: error.message });
            }
            
            console.log("✅ Cloudinary Upload Success:", result.secure_url);
            
            // IMPORTANT: We manually set the path so the Controller can read it
            req.file.path = result.secure_url;
            next();
        }
    );

    // Pipe the file buffer from memory to Cloudinary
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
};

// --- ROUTES ---

router.route('/')
    .get(protect, getNotices)
    // 1. Multer grabs file -> 2. We upload to Cloudinary -> 3. Controller saves to DB
    .post(protect, faculty, upload.single('noticeFile'), uploadToCloudinary, createNotice);

router.route('/:id')
    .put(protect, admin, updateNotice)
    .delete(protect, faculty, deleteNotice);

module.exports = router;