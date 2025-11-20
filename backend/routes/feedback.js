const express = require('express');
const router = express.Router();
const { createFeedback, getAllFeedback, getMyFeedback, replyFeedback } = require('../controllers/feedbackController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createFeedback).get(protect, admin, getAllFeedback);
router.route('/my').get(protect, getMyFeedback);
router.route('/:id/reply').put(protect, admin, replyFeedback);

module.exports = router;