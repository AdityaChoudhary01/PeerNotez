// --- Core Modules ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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

// Set the 'trust proxy' setting. This is crucial for rate limiting on
// services like Render, which use a proxy. It ensures the rate limiter
// uses the client's real IP address from the X-Forwarded-For header.
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5001;

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
    // Check if the request origin is in our whitelist or if it's a same-origin request
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

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected successfully.'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// --- Route Mounting ---
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

// --- Fallback Route for Undefined Endpoints ---
app.use('*', (req, res) => {
  res.status(404).json({ message: 'The requested resource was not found on this server.' });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error('🔴 Global Error:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'An unexpected error occurred on the server.',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// --- Server Startup ---
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));



