const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// --- FIREBASE ADMIN IMPORT ---
// We now import the instance we configured using .env variables
// adjust the path '../config/firebaseAdmin' if you put the file somewhere else
const admin = require('../config/firebaseAdmin'); 

// --- UTILITIES ---

// 1. Generate JWT token (For your Node Backend)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 2. Format User Response
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

// 3. Normalize String
const normalize = (str) => {
    return str ? str.replace(/\s+/g, '').toLowerCase() : '';
};

// ===============================================
// REGISTER
// POST /api/auth/register
// ===============================================
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    // 2. Check User Existence
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Name Reservation Check
    const reservedName = process.env.MAIN_ADMIN_NAME || '';
    if (reservedName && normalize(name) === normalize(reservedName)) {
        if (email !== process.env.MAIN_ADMIN_EMAIL) {
            return res.status(400).json({ 
                message: 'This name is reserved and cannot be used.' 
            });
        }
    }

    // 4. Create User
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
    
    const user = await User.create({
      name,
      email,
      password,
      avatar: avatarUrl,
    });

    if (user) {
      const userData = formatUserResponse(user);
      const token = generateToken(user._id);

      // --- GENERATE FIREBASE TOKEN ---
      let firebaseToken = null;
      try {
          // Check if admin was initialized successfully in the config file
          if (admin.apps.length) {
              firebaseToken = await admin.auth().createCustomToken(user._id.toString());
          } else {
              console.warn("⚠️ Skipping Firebase Token: Admin not initialized (Check .env)");
          }
      } catch (fbError) {
          console.error("❌ Error creating Firebase token:", fbError.message);
          // We continue anyway so the user can still use the rest of the site
      }

      res.status(201).json({
        ...userData,
        token,         // For Node API
        firebaseToken  // For Firebase Chat
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
      // Fetch fresh data
      const refreshedUser = await User.findById(user._id).select('-password');
      const userData = formatUserResponse(refreshedUser);
      const token = generateToken(user._id);

      // --- GENERATE FIREBASE TOKEN ---
      let firebaseToken = null;
      try {
          if (admin.apps.length) {
              // Create a custom token using the MongoDB User ID
              firebaseToken = await admin.auth().createCustomToken(user._id.toString());
          }
      } catch (fbError) {
          console.error("❌ Error creating Firebase token:", fbError.message);
      }

      res.json({
        ...userData,
        token,          // For Node API
        firebaseToken   // For Firebase Chat
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
