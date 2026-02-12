const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// --- UTILITIES ---

// 1. Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 2. Format User Response (Convert IDs to strings)
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

// 3. Normalize String (Remove spaces, convert to lowercase)
// Used to compare names strictly (e.g. "Aditya Choudhary" == "adityachoudhary")
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

    // 3. --- SECURITY: NAME RESERVATION CHECK ---
    // Prevent users from taking the Super Admin's name
    const reservedName = process.env.MAIN_ADMIN_NAME || '';
    
    // Only perform check if a reserved name is actually set in .env
    if (reservedName && normalize(name) === normalize(reservedName)) {
        // Only allow if the email matches the Main Admin Email
        // If emails don't match, someone is trying to impersonate the admin
        if (email !== process.env.MAIN_ADMIN_EMAIL) {
            return res.status(400).json({ 
                message: 'This name is reserved and cannot be used.' 
            });
        }
    }

    // 4. Create Avatar
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;

    // 5. Create User
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
      // Fetch fresh data (in case roles/following changed externally)
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
