const express = require('express');
const router = express.Router();
const { 
    createFeedback, 
    getAllFeedback, 
    getMyFeedback, 
    replyFeedback, 
    deleteFeedback, 
    deleteReply 
} = require('../controllers/feedbackController');

const { protect, admin } = require('../middleware/authMiddleware');

// Route for creating feedback and getting all feedback (Admin only)
router.route('/')
    .post(protect, createFeedback)
    .get(protect, admin, getAllFeedback);

// Route for getting the logged-in user's feedback history
router.route('/my')
    .get(protect, getMyFeedback);

// Route for deleting a specific feedback message (User or Admin)
router.route('/:id')
    .delete(protect, deleteFeedback);

// Route for replying to feedback and deleting replies (Admin only)
router.route('/:id/reply')
    .put(protect, admin, replyFeedback)
    .delete(protect, admin, deleteReply);

module.exports = router;