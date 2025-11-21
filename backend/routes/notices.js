const express = require('express');
const router = express.Router();

// Import Controllers
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');

// Import Middleware
const { protect, admin, faculty } = require('../middleware/authMiddleware');

// --- CLOUDINARY CONFIGURATION ---
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

try {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'college_notices',
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx'],
            resource_type: 'auto', 
        },
    });

    var upload = multer({ storage: storage });
} catch (error) {
    console.error("Cloudinary Config Error:", error);
    // Fallback to prevent crash if env vars are missing, but uploads won't work
    var upload = multer({ dest: 'uploads/' }); 
}
// --------------------------------

// Define Routes
router.route('/')
    .get(protect, getNotices)
    .post(protect, faculty, upload.single('noticeFile'), createNotice);

router.route('/:id')
    .put(protect, admin, updateNotice)
    .delete(protect, faculty, deleteNotice);

module.exports = router;