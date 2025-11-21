const express = require('express');
const router = express.Router();
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, admin, faculty } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/'); // Files will be saved in an 'uploads' folder
    },
    filename(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    },
});

const upload = multer({ 
    storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|pdf|doc|docx/; // Allowed file types
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Error: Images, PDFs, and Docs only!'));
    }
});
// ---------------------------

router.route('/')
    .get(protect, getNotices)
    // Add 'upload.single' middleware to handle the file
    .post(protect, faculty, upload.single('noticeFile'), createNotice);

router.route('/:id')
    .put(protect, admin, updateNotice)
    .delete(protect, faculty, deleteNotice);

module.exports = router;