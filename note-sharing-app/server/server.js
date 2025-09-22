// --- Core Modules ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet'); // New: Security headers
const rateLimit = require('express-rate-limit'); // New: API rate limiting
const mongoSanitize = require('express-mongo-sanitize'); // New: Prevents NoSQL injection
const xss = require('xss-clean'); // New: Prevents XSS attacks
require('dotenv').config();

// --- Schema Imports ---
require('./models/Comment'); // Ensure all required models are loaded

// --- Route Imports ---
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const contactRoutes = require('./routes/contactRoutes');
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');

// --- App Initialization ---
const app = express();
const PORT = process.env.PORT || 5001;

// --- Security Middleware ---
app.use(helmet()); // Sets various HTTP headers to protect against common attacks
app.use(mongoSanitize()); // Sanitizes user-supplied data to prevent MongoDB Operator Injection
app.use(xss()); // Sanitizes user input coming from POST bodies, GET queries, and URL params

// --- CORS Configuration ---
const allowedOrigins = [
  'http://localhost:3000', // Your local development front-end
  'https://peernotez.netlify.app/', // Your production front-end URL
];
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json()); // Parses incoming JSON requests

// --- Rate Limiting ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per 15 minutes per IP
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});
app.use('/api/', apiLimiter); // Apply rate limiting to all API routes

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected successfully.'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1); // Exit with a failure code
  });

// --- Route Mounting ---
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);

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

