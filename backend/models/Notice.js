const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { 
        type: String, 
        required: true, 
        // Updated list based on your request
        enum: ['Academics', 'Events', 'Placements', 'Exams', 'Holidays', 'Emergency Alerts'], 
        default: 'Academics' 
    },
    // Add this field for file paths
    fileUrl: { type: String }, 
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Notice', NoticeSchema);