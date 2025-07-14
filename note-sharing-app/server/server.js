const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// Removed unused imports: fs and path
require('dotenv').config(); // Loads environment variables from a .env file

// Make sure you require both route files
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Allow only Netlify frontend
app.use(cors({
  origin: 'https://peernotez.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json()); // Middleware to parse JSON request bodies

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected.'))
  .catch(err => console.error('MongoDB connection error:', err)); // Improved error log

// Route Middleware
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/contact', contactRoutes);

// Global Error Handler
// This middleware catches errors from preceding middleware and route handlers
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the full error stack for debugging purposes

  // Determine the status code: use error's status code if available, otherwise default to 500
  const statusCode = err.statusCode || 500;

  // Determine the message: use error's message if available, otherwise a generic server error message
  const message = err.message || 'Internal Server Error';

  // Send the error response as JSON
  res.status(statusCode).json({
    message: message,
    // Optionally, include the stack trace in development for debugging
    // It's generally not recommended to send stack traces in production
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
