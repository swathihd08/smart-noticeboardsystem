const Notice = require('../models/Notice');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary directly here
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    const { title, content, category } = req.body;
    let fileUrl = null;

    try {
        // --- FILE UPLOAD LOGIC ---
        if (req.file) {
            console.log("🔹 Processing File Upload...");
            
            // Convert buffer to Base64 string
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: 'college_notices',
                resource_type: 'auto'
            });
            
            console.log("✅ Upload Success:", result.secure_url);
            fileUrl = result.secure_url;
        }
        // -------------------------

        const newNotice = new Notice({
            title,
            content,
            category: category || 'General',
            fileUrl, // Save the URL (or null if no file)
            author: req.user.id,
        });

        const notice = await newNotice.save();
        res.json(notice);

    } catch (err) {
        console.error("🔴 CREATE NOTICE ERROR:", err);
        // Send the EXACT error to the frontend
        res.status(500).json({ 
            msg: 'Creation Failed', 
            error: err.message || 'Unknown Error' 
        });
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
            return res.status(401).json({ msg: 'Not authorized to delete this notice' });
        }

        await Notice.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Notice removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};