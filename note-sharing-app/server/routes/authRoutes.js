const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Assuming your User model is in ../models/User
const jwt = require('jsonwebtoken');

// Helper function to generate a JWT token
// Now accepts the full user object to include more details in the payload
const generateToken = (user) => {
  // Include user._id, user.email, and user.name in the JWT payload
  // This allows the frontend to access these details directly from the token
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '30d' } // Token valid for 30 days
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // --- Basic Server-Side Validation ---
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields (name, email, password)' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  // Optional: More robust email validation (can also be done in Mongoose schema)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }
  // --- End of Basic Validation ---

  try {
    // Check if user with the given email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Create a new user in the database
    // Assumes your User model handles password hashing before saving
    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user), // Pass the full user object to generateToken
      });
    } else {
      // This case should ideally be caught by more specific validation above or Mongoose errors
      res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    // Catch Mongoose validation errors (e.g., if you have custom validators in your schema)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    // Generic server error
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Basic input validation for login
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter email and password' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists and if the provided password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user), // Pass the full user object to generateToken
      });
    } else {
      // If user not found or password doesn't match
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
