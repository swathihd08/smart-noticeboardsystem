const Feedback = require('../models/Feedback');

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Private
exports.createFeedback = async (req, res) => {
    const { message } = req.body;
    try {
        const feedback = new Feedback({
            user: req.user.id,
            message
        });
        const createdFeedback = await feedback.save();
        res.status(201).json(createdFeedback);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all feedback (Admin)
// @route   GET /api/feedback
// @access  Private/Admin
exports.getAllFeedback = async (req, res) => {
    try {
        // Populate gets the user's name based on their ID
        const feedbacks = await Feedback.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get logged in user's feedback
// @route   GET /api/feedback/my
// @access  Private
exports.getMyFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reply to feedback (Admin)
// @route   PUT /api/feedback/:id/reply
// @access  Private/Admin
exports.replyFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (feedback) {
            feedback.reply = req.body.reply;
            const updatedFeedback = await feedback.save();
            res.json(updatedFeedback);
        } else {
            res.status(404).json({ message: 'Feedback not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};