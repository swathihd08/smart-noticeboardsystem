const express = require('express');
const router = express.Router();
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, admin, faculty } = require('../middleware/authMiddleware');

// --- CLOUDINARY SETUP ---
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with your keys
console.log("DEBUG: Cloud Name is:", process.env.CLOUDINARY_CLOUD_NAME);
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'college_notices', // The folder name in Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx'],
        resource_type: 'auto', // Auto-detect if it's an image or raw file (pdf)
    },
});

const upload = multer({ storage: storage });
// ------------------------

router.route('/')
    .get(protect, getNotices)
    .post(protect, faculty, (req, res, next) => {
        // Wrap upload in a custom function to catch errors
        upload.single('noticeFile')(req, res, (err) => {
            if (err) {
                // This will print the REAL error to your Render logs
                console.error("MULTER UPLOAD ERROR:", err); 
                return res.status(500).json({ msg: 'File Upload Failed', error: err.message });
            }
            // If no error, continue to the controller
            next();
        });
    }, createNotice);