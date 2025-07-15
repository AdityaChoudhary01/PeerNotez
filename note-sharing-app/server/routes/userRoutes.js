const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage });

// @route   PUT /api/users/profile/avatar
// @desc    Update user profile picture
router.put('/profile/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    const user = await User.findById(req.user.id);
    if (user) {
      user.avatar = req.file.path;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        savedNotes: updatedUser.savedNotes
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// --- THIS IS THE NEW ROUTE ---
// @route   PUT /api/users/profile
// @desc    Update user profile details (e.g., name)
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name; // Update name if provided

            const updatedUser = await user.save();
            
            // Send back the full user object
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                savedNotes: updatedUser.savedNotes,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});


// @route   PUT /api/users/save/:noteId
// @desc    Save a note
router.put('/save/:noteId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.savedNotes.includes(req.params.noteId)) {
      user.savedNotes.push(req.params.noteId);
      await user.save();
    }
    res.json(user.savedNotes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/users/unsave/:noteId
// @desc    Unsave a note
router.put('/unsave/:noteId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.savedNotes = user.savedNotes.filter(
      (noteId) => noteId.toString() !== req.params.noteId
    );
    await user.save();
    res.json(user.savedNotes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/users/savednotes
// @desc    Get all saved notes for a user
router.get('/savednotes', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
        path: 'savedNotes',
        populate: { path: 'user', select: 'name avatar' }
    });
    res.json(user.savedNotes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
