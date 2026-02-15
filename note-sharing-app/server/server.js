// --- Core Modules ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
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
  'http://localhost:3000' // Useful for local dev
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

// NOTE: Rate Limiting removed for Vercel. 
// In serverless, memory is ephemeral, making memory-store rate limiters ineffective and slow.

// --- Database Connection (Serverless Optimized Pattern) ---
let cachedDb = null;
let cachedPromise = null;

const connectDB = async () => {
    // 1. If we have a connection, use it immediately.
    if (cachedDb && mongoose.connection.readyState === 1) {
        return cachedDb;
    }

    // 2. If a connection is already being established, wait for that same promise.
    // This prevents multiple requests from spawning multiple connections.
    if (!cachedPromise) {
        const opts = {
            maxPoolSize: 5, // Lower pool size is better for serverless (prevents connection exhaustion)
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false, // Fail fast if DB is down
        };

        cachedPromise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
            console.log('✅ New MongoDB connection established.');
            return mongoose;
        }).catch((err) => {
            console.error('❌ MongoDB Connection Error:', err);
            cachedPromise = null; // Reset promise on failure so we can try again
            throw err;
        });
    }

    cachedDb = await cachedPromise;
    return cachedDb;
};

// Middleware to ensure DB is connected on every request
// This is now efficient because it reuses the pending promise if one exists
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(error);
    }
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
module.exports = app;

// Only start the standalone server if running locally
if (require.main === module) {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`🚀 Local Server is running on port ${PORT}`));
}
