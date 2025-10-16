// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Utility: convert Mongoose IDs to strings
const formatUserResponse = (user) => {
  const userObject = user.toObject();
  return {
    _id: userObject._id.toString(),
    name: userObject.name,
    email: userObject.email,
    avatar: userObject.avatar,
    role: userObject.role,
    savedNotes: (userObject.savedNotes || []).map(id => id.toString()),
    following: (userObject.following || []).map(id => id.toString()),
  };
};

// ===============================================
// REGISTER
// POST /api/auth/register
// ===============================================
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;

    const user = await User.create({
      name,
      email,
      password,
      avatar: avatarUrl,
    });

    if (user) {
      const userData = formatUserResponse(user);
      res.status(201).json({
        ...userData,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in /register:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ===============================================
// LOGIN
// POST /api/auth/login
// ===============================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const refreshedUser = await User.findById(user._id).select('-password');
      const userData = formatUserResponse(refreshedUser);

      res.json({
        ...userData,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error in /login:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
