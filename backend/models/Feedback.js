const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    reply: {
        type: String, // Admin's reply
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);