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

// 2. Configure Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'college_notices',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx'],
        resource_type: 'auto', 
    },
});

const upload = multer({ storage: storage });

// --- ROUTES ---

router.route('/')
    .get(protect, getNotices)
    // 3. Upload Logic with Error Catching
    .post(protect, faculty, (req, res, next) => {
        const uploadMiddleware = upload.single('noticeFile');
        
        uploadMiddleware(req, res, function (err) {
            if (err) {
                console.error("CLOUDINARY UPLOAD ERROR:", err);
                return res.status(500).json({ msg: 'File Upload Failed', error: err.message });
            }
            // If no error, proceed to the controller
            next();
        });
    }, createNotice);

router.route('/:id')
    .put(protect, admin, updateNotice)
    .delete(protect, faculty, deleteNotice);

// 4. CRITICAL EXPORT (This was likely missing)
module.exports = router;