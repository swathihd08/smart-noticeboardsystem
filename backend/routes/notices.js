const express = require('express');
const router = express.Router();
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, admin, faculty } = require('../middleware/authMiddleware');

// No Multer, No Cloudinary here. Just simple routes.

router.route('/')
    .get(protect, getNotices)
    // Controller now just expects JSON data, not a file
    .post(protect, faculty, createNotice);

router.route('/:id')
    .put(protect, admin, updateNotice)
    .delete(protect, faculty, deleteNotice);

module.exports = router;