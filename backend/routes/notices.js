const express = require('express');
const router = express.Router();
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
// 1. Import 'faculty' here
const { protect, admin, faculty } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getNotices)
    // 2. CHANGE THIS LINE: Use 'faculty' instead of 'admin'
    .post(protect, faculty, createNotice);

router.route('/:id')
    // We will handle the delete logic inside the controller, so we can use 'faculty' here too
    .put(protect, admin, updateNotice)
    .delete(protect, faculty, deleteNotice); // Change this to 'faculty' too!

module.exports = router;