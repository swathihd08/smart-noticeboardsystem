const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();
// --- DEBUGGING BLOCK ---
console.log("---------------------------------------");
console.log("🚀 SERVER STARTING...");
console.log("✅ Cloudinary Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("✅ Cloudinary API Key Length:", process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.length : "MISSING");
console.log("✅ Cloudinary Secret Length:", process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.length : "MISSING");
console.log("---------------------------------------");
// -----------------------

// (Your mongoose.connect line is below here...)
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/feedback', require('./routes/feedback')); // <--- ADD THIS LINE


const PORT = process.env.PORT || 5000;
app.use('/uploads', express.static('uploads'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));