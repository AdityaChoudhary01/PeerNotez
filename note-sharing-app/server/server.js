const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Make sure you require both route files
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

const cors = require('cors');
app.use(cors({
  origin: 'https://peernotez.netlify.app/', // Replace with your Netlify frontend URL
  credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected.'))
  .catch(err => console.error(err));

// Make sure you use both route files
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/contact', contactRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
  // ... (error handling code) ...
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
