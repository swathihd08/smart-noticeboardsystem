const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });
        
        user = new User({ name, email, password, role });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// @desc    Login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// @desc    Get Me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @desc    Forgot Password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    console.log("🔹 1. Request received for:", email);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("❌ User not found");
            return res.status(404).json({ msg: 'Email not found' });
        }

        // Generate Token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; 
        await user.save();
        console.log("🔹 2. Token generated & saved");

        // Configure Email (Standard Port 587)
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // True for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            },
            logger: true, // FORCE LOGS
            debug: true   // INCLUDE DEBUG INFO
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        
        console.log("🔹 3. Attempting to send email...");

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request',
            text: `Click here to reset your password: ${resetUrl}`,
        });

        console.log("✅ 4. Email sent successfully!");
        res.status(200).json({ msg: 'Email sent' });

    } catch (err) {
        console.error("🔴 FATAL EMAIL ERROR:", err);
        
        // Cleanup token if failed
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        
        return res.status(500).json({ msg: 'Email sending failed', error: err.message });
    }
};

// @desc    Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.resetToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ msg: 'Invalid token' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ msg: 'Password updated' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};