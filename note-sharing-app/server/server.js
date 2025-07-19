const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('./models/Comment');
require('dotenv').config();

// --- REQUIRE ALL ROUTE FILES ---
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const contactRoutes = require('./routes/contactRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors()); // For development. Can be configured for production.
app.use(express.json());

// DB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected.'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- USE ALL ROUTE FILES ---
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/users', userRoutes);


// --- ADD THIS HEALTH CHECK ROUTE ---
// A simple endpoint for uptime monitoring services to ping.
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});


// --- ADD THIS GLOBAL ERROR HANDLER ---
// This should be the last piece of middleware.
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'An unexpected error occurred on the server.',
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });
});


app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
