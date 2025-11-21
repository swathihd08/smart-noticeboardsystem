const Notice = require('../models/Notice');

// @desc    Get all notices
// @route   GET /api/notices
exports.getNotices = async (req, res) => {
    try {
        const notices = await Notice.find().sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// @desc    Create a notice (Admin & Faculty)
// @route   POST /api/notices
exports.createNotice = async (req, res) => {
    try {
        const { title, content, category } = req.body;

        // Handle File Upload (Cloudinary puts url in req.file.path)
        let fileUrl = null;
        if (req.file && req.file.path) {
            fileUrl = req.file.path;
        }

        const newNotice = new Notice({
            title,
            content,
            category: category || 'General',
            fileUrl, 
            author: req.user.id,
        });

        const notice = await newNotice.save();
        res.json(notice);
    } catch (err) {
        console.error("Create Notice Error:", err);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// @desc    Update a notice
// @route   PUT /api/notices/:id
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
// @route   DELETE /api/notices/:id
exports.deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({ msg: 'Notice not found' });
        }

        // Check if User is Author OR Admin
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