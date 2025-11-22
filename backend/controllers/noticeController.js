const Notice = require('../models/Notice');

// @desc    Get all notices
exports.getNotices = async (req, res) => {
    try {
        const notices = await Notice.find().sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

// @desc    Create a notice
exports.createNotice = async (req, res) => {
    // The Frontend will send the fileUrl directly
    const { title, content, category, fileUrl } = req.body;

    try {
        const newNotice = new Notice({
            title,
            content,
            category: category || 'General',
            fileUrl: fileUrl || null, // Save the link provided by frontend
            author: req.user.id,
        });

        const notice = await newNotice.save();
        res.json(notice);
    } catch (err) {
        console.error("Create Error:", err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

// @desc    Update a notice
exports.updateNotice = async (req, res) => {
    try {
        let notice = await Notice.findById(req.params.id);
        if (!notice) return res.status(404).json({ msg: 'Notice not found' });
        
        const updatedNotice = await Notice.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(updatedNotice);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

// @desc    Delete a notice
exports.deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) return res.status(404).json({ msg: 'Notice not found' });

        if (notice.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Notice.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Notice removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};