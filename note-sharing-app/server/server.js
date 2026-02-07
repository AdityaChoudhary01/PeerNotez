// --- Core Modules ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');
require('dotenv').config();

// --- Schema Imports ---
require('./models/Comment');

// --- Route Imports ---
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const contactRoutes = require('./routes/contactRoutes');
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');
const sitemapRoutes = require('./routes/sitemapRoutes');

// --- App Initialization ---
const app = express();

// Set the 'trust proxy' setting for Vercel/CDN compatibility
app.set('trust proxy', 1);

// --- Security Middleware ---
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

// --- CORS Configuration ---
const allowedOrigins = [
  'https://peernotez.netlify.app',
];
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// --- Rate Limiting ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});
app.use('/api/', apiLimiter);

// --- Database Connection (Serverless Optimized) ---
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;

    try {
        const db = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        isConnected = db.connections[0].readyState;
        console.log('✅ MongoDB connected successfully.');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        isConnected = false;
    }
};

// Middleware to ensure DB is connected on every request before hitting routes
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// --- Route Mounting (API Routes) ---
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/', sitemapRoutes);

// --- Health Check Endpoint ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// --- Global Error Handler (KEEP LAST) ---
app.use((err, req, res, next) => {
  console.error('🔴 Global Error:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'An unexpected error occurred on the server.',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// --- Vercel Export Configuration ---
// Export the app for Vercel's serverless handler
module.exports = app;

// Only start the standalone server if running locally
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`🚀 Local Server is running on port ${PORT}`));
}
