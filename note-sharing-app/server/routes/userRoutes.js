const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

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

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note (user can delete their own, admin can delete any)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    // --- UPDATED LOGIC ---
    // Allow deletion if user is the owner OR if the user is an admin
    if (note.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await note.deleteOne();
    res.json({ message: 'Note removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}); // Fetches all users
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      // You might want to add logic here to delete associated notes as well
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});
// @route   PUT /api/users/:id/role
// @desc    Change a user's role (Admin only)
// @access  Private/Admin
router.put('/:id/role', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.role = user.role === 'admin' ? 'user' : 'admin';
      await user.save();
      res.json({ message: `User role updated to ${user.role}` });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
