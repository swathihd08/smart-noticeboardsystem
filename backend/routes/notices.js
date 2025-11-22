const express = require('express');
const router = express.Router();
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, admin, faculty } = require('../middleware/authMiddleware');
const multer = require('multer');

// Use Memory Storage (RAM) - No disk writing, no external tools
const upload = multer({ storage: multer.memoryStorage() });

// --- ROUTES ---

router.route('/')
    .get(protect, getNotices)
    // Just grab the file and pass it to the controller. No complex logic here.
    .post(protect, faculty, upload.single('noticeFile'), createNotice);

router.route('/:id')
    .put(protect, admin, updateNotice)
    .delete(protect, faculty, deleteNotice);

module.exports = router;