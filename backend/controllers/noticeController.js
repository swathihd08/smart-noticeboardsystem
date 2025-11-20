const Notice = require('../models/Notice');

// @desc    Get all notices
// @route   GET /api/notices
exports.getNotices = async (req, res) => {
    try {
        const notices = await Notice.find().sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

// @desc    Create a notice
// @route   POST /api/notices
exports.createNotice = async (req, res) => {
    const { title, content } = req.body;
    try {
        const newNotice = new Notice({
            title,
            content,
            author: req.user.id,
        });
        const notice = await newNotice.save();
        res.json(notice);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

// @desc    Update a notice
// @route   PUT /api/notices/:id
exports.updateNotice = async (req, res) => {
    try {
        let notice = await Notice.findById(req.params.id);
        if (!notice) return res.status(404).json({ msg: 'Notice not found' });
        
        notice = await Notice.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(notice);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({ msg: 'Notice not found' });
        }

        // --- SMART CHECK ---
        // Check if the user is the "Author" of the notice OR is an "Admin"
        if (notice.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized to delete this notice' });
        }

        await Notice.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Notice removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
};