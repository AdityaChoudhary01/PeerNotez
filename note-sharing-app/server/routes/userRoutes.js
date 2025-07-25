const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const User = require('../models/User');
const Note = require('../models/Note'); // <-- ADD THIS LINE: Import your Note model
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const upload = multer({ storage });

// @route   PUT /api/users/profile/avatar
// @desc    Update user profile picture
// @access  Private (User must be logged in)
router.put('/profile/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or file type not supported for avatar.' });
    }
    const user = await User.findById(req.user.id);
    if (user) {
      // If there was an old avatar, you might want to delete it from Cloudinary
      // For simplicity, we are just updating the URL here.
      // Implementing old avatar deletion would require storing public_id for avatar too.
      user.avatar = req.file.path; // Multer (via CloudinaryStorage) gives you the URL in req.file.path
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar, // Send back the new avatar URL
        // savedNotes: updatedUser.savedNotes // No need to send this entire array here, it can be large
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating avatar (userRoutes):', error); // Log detailed error
    res.status(500).json({ message: 'Server Error occurred while updating avatar.', error: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile details (e.g., name, email - but be careful with email changes)
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            // Update name if provided in the request body
            user.name = req.body.name || user.name;
            // You might want to allow email change but it often requires re-verification
            // user.email = req.body.email || user.email;

            const updatedUser = await user.save();

            // Send back the necessary user object data
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                // savedNotes: updatedUser.savedNotes, // No need to send this entire array here, it can be large
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating profile (userRoutes):', error);
        res.status(500).json({ message: 'Server Error occurred while updating profile.', error: error.message });
    }
});


// @route   PUT /api/users/save/:noteId
// @desc    Save a note to user's savedNotes list
// @access  Private
router.put('/save/:noteId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Ensure the noteId is not already saved
    if (!user.savedNotes.includes(req.params.noteId)) {
      user.savedNotes.push(req.params.noteId);
      await user.save();
      // Send back only relevant info, not the full user object
      res.status(200).json({ message: 'Note saved successfully!', savedNotesCount: user.savedNotes.length });
    } else {
      res.status(200).json({ message: 'Note already saved.', savedNotesCount: user.savedNotes.length });
    }
  } catch (error) {
    console.error('Error saving note (userRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while saving note.' });
  }
});

// @route   PUT /api/users/unsave/:noteId
// @desc    Unsave a note from user's savedNotes list
// @access  Private
router.put('/unsave/:noteId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Filter out the noteId
    const initialLength = user.savedNotes.length;
    user.savedNotes = user.savedNotes.filter(
      (noteId) => noteId.toString() !== req.params.noteId.toString() // Ensure strict comparison
    );
    if (user.savedNotes.length < initialLength) {
      await user.save();
      // Send back only relevant info, not the full user object
      res.status(200).json({ message: 'Note unsaved successfully!', savedNotesCount: user.savedNotes.length });
    } else {
        res.status(200).json({ message: 'Note was not found in saved list.', savedNotesCount: user.savedNotes.length });
    }
  } catch (error) {
    console.error('Error unsaving note (userRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while unsaving note.' });
  }
});

// @route   GET /api/users/savednotes
// @desc    Get all saved notes for a user with pagination
// @access  Private
router.get('/savednotes', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Or your desired default limit
    const skip = (page - 1) * limit;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const savedNoteIds = user.savedNotes; // Array of note IDs stored on the user document

    // Fetch the actual Note documents that correspond to the savedNoteIds
    // Apply pagination (skip and limit) and populate the uploader's info
    const notes = await Note.find({ _id: { $in: savedNoteIds } })
                            .populate('user', 'name avatar') // Populate the 'user' field within each Note
                            .sort({ createdAt: -1 }) // Sort by creation date, newest first
                            .skip(skip)
                            .limit(limit);

    const totalNotes = savedNoteIds.length; // Total count is the number of IDs in the array
    const totalPages = Math.ceil(totalNotes / limit);

    // THIS IS THE CRUCIAL PART THAT NEEDS TO BE EXACTLY LIKE THIS
    res.json({
      notes: notes,
      page: page,
      totalPages: totalPages,
      totalNotes: totalNotes,
    });

  } catch (error) {
    console.error('Error fetching saved notes (userRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while fetching saved notes.' });
  }
});


// ADMIN ROUTES FOR USERS

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}); // Fetches all users
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users (userRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while fetching users.' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself as an admin.' });
    }

    const user = await User.findById(req.params.id);
    if (user) {
      // Optional: Add logic here to delete associated notes or other content created by this user
      // This would involve finding all notes where user: req.params.id and deleting them.
      // Also, consider deleting their Cloudinary avatar if public_id was stored.

      await user.deleteOne(); // Delete the user document
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user (userRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while deleting user.' });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Change a user's role (toggle between 'user' and 'admin')
// @access  Private/Admin
router.put('/:id/role', protect, admin, async (req, res) => {
  try {
    // Prevent changing your own role via this endpoint (should be done carefully through specific UI)
    if (req.params.id.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role via this endpoint.' });
    }

    const user = await User.findById(req.params.id);
    if (user) {
      // Toggle role: if admin, make user; if user, make admin
      user.role = user.role === 'admin' ? 'user' : 'admin';
      await user.save();
      res.json({ message: `User role for ${user.name} updated to ${user.role}`, userId: user._id, newRole: user.role });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error changing user role (userRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while changing user role.' });
  }
});

module.exports = router;
