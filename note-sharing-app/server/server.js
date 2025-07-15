const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- REQUIRE ALL ROUTE FILES ---
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const contactRoutes = require('./routes/contactRoutes');
const userRoutes = require('./routes/userRoutes'); // --- ADD THIS ---

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors()); // For development. Update for production.
app.use(express.json());

// DB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected.'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- USE ALL ROUTE FILES ---
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/users', userRoutes); // --- ADD THIS ---

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
