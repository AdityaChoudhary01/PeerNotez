const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const User = require('../models/User');
const Note = require('../models/Note'); 
const Blog = require('../models/Blog'); 
const Collection = require('../models/Collection');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const upload = multer({ storage });

// Function to calculate simple badges based on cached counts
const calculateBadges = (user) => {
    const badges = [];
    if (user.noteCount >= 50) {
        badges.push({ name: 'Power Uploader', description: '50+ Notes Uploaded', icon: '⚡️' });
    } else if (user.noteCount >= 10) {
        badges.push({ name: 'Active Contributor', description: '10+ Notes Uploaded', icon: '🌟' });
    }
    if (user.blogCount >= 10) {
        badges.push({ name: 'Master Blogger', description: '10+ Blogs Written', icon: '✍️' });
    }
    // Note: Advanced badges (e.g., Average Rating) would require aggregation logic here.
    return badges;
};

// ==========================================================
// USER AUTH & PROFILE MANAGEMENT
// ==========================================================

// @route   GET /api/users/profile
// @desc    Get user profile with calculated badges and following status
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (user) {
            const userObject = user.toObject();
            
            // NEW: Add calculated badges
            const badges = calculateBadges(userObject);

            res.json({
                ...userObject,
                badges: badges,
                // The 'following' array is already part of the user object
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server Error occurred while fetching profile.' });
    }
});


// @route   PUT /api/users/profile/avatar
// @desc    Update user profile picture
// @access  Private
router.put('/profile/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or file type not supported for avatar.' });
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
        // IMPORTANT: Retain following list for client context update
        following: updatedUser.following || [], 
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating avatar (userRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while updating avatar.', error: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile details (e.g., name)
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                following: updatedUser.following || [],
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating profile (userRoutes):', error);
        res.status(500).json({ message: 'Server Error occurred while updating profile.', error: error.message });
    }
});


// ==========================================================
// NEW: FOLLOWING & FEED ROUTES
// ==========================================================

// @route   PUT /api/users/:id/follow
// @desc    Follow or unfollow a user (User ID in params is the author to follow)
router.put('/:id/follow', protect, async (req, res) => {
    try {
        const userIdToFollow = req.params.id;
        const currentUser = await User.findById(req.user.id);

        if (!currentUser) {
            return res.status(404).json({ message: 'Current user not found.' });
        }
        if (userIdToFollow.toString() === currentUser._id.toString()) {
            return res.status(400).json({ message: 'You cannot follow yourself.' });
        }

        // Check if the author exists
        const author = await User.findById(userIdToFollow);
        if (!author) {
            return res.status(404).json({ message: 'Author to follow not found.' });
        }

        // Check if already following
        const isFollowing = currentUser.following.includes(userIdToFollow);
        
        let updateQuery;
        let message;

        if (isFollowing) {
            // Unfollow
            updateQuery = { $pull: { following: userIdToFollow } };
            message = `${author.name} unfollowed successfully.`;
        } else {
            // Follow
            updateQuery = { $push: { following: userIdToFollow } };
            message = `${author.name} followed successfully.`;
        }

        // Update the current user's following list
        const updatedUser = await User.findByIdAndUpdate(currentUser._id, updateQuery, { new: true });
        
        res.json({ 
            message, 
            isFollowing: !isFollowing, 
            userFollowing: updatedUser.following // Send back the updated list
        });

    } catch (error) {
        console.error('Error toggling follow status:', error);
        res.status(500).json({ message: 'Server error: Could not update follow status.' });
    }
});

// @route   GET /api/users/feed
// @desc    Get latest content from followed users (Personalized Feed)
router.get('/feed', protect, async (req, res) => {
    try {
        const followedUsers = req.user.following;
        const page = Number(req.query.page) || 1;
        const limit = 10;
        const skip = limit * (page - 1);

        if (!followedUsers || followedUsers.length === 0) {
            return res.status(200).json({ 
                content: [], 
                page: 1, 
                totalPages: 0,
                message: 'Your feed is empty. Follow some users to see content here!'
            });
        }
        
        // Find recent Notes and Blogs from followed users
        const notePromise = Note.find({ user: { $in: followedUsers } })
            // 🛑 FIX APPLIED HERE: Added cloudinaryId, fileType, and filePath 🛑
            .select('title university course uploadDate downloadCount user rating cloudinaryId fileType filePath') 
            .populate('user', 'name avatar')
            .sort({ uploadDate: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        const blogPromise = Blog.find({ author: { $in: followedUsers } })
            .select('title slug createdAt downloadCount author rating')
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        const [notes, blogs] = await Promise.all([notePromise, blogPromise]);

        // Combine and sort content by creation date (latest first)
        const combinedContent = [
            ...notes.map(n => ({ type: 'note', ...n })),
            ...blogs.map(b => ({ type: 'blog', ...b })),
        ].sort((a, b) => new Date(b.uploadDate || b.createdAt) - new Date(a.uploadDate || a.createdAt));

        // Return the first 'limit' items from the sorted list
        res.json({ 
            content: combinedContent.slice(0, limit), 
            page, 
            totalPages: 1 // Simplified pagination for this combined view
        });

    } catch (error) {
        console.error('Error fetching personalized feed:', error);
        res.status(500).json({ message: 'Server error: Could not fetch feed.' });
    }
});


// ==========================================================
// NOTE SAVING ROUTES (Existing Logic)
// ==========================================================

// @route   PUT /api/users/save/:noteId
// @desc    Save a note to user's savedNotes list
// @access  Private
router.put('/save/:noteId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.savedNotes.includes(req.params.noteId)) {
      user.savedNotes.push(req.params.noteId);
      await user.save();
      res.status(200).json({ message: 'Note saved successfully!', savedNotesCount: user.savedNotes.length });
    } else {
      res.status(200).json({ message: 'Note already saved.', savedNotesCount: user.savedNotes.length });
    }
  } catch (error) {
    console.error('Error saving note (userRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while saving note.' });
  }
});

// @route   PUT /api/users/unsave/:noteId
// @desc    Unsave a note from user's savedNotes list
// @access  Private
router.put('/unsave/:noteId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const initialLength = user.savedNotes.length;
    user.savedNotes = user.savedNotes.filter(
      (noteId) => noteId.toString() !== req.params.noteId.toString()
    );
    if (user.savedNotes.length < initialLength) {
      await user.save();
      res.status(200).json({ message: 'Note unsaved successfully!', savedNotesCount: user.savedNotes.length });
    } else {
        res.status(200).json({ message: 'Note was not found in saved list.', savedNotesCount: user.savedNotes.length });
    }
  } catch (error) {
    console.error('Error unsaving note (userRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while unsaving note.' });
  }
});

// @route   GET /api/users/savednotes
// @desc    Get all saved notes for a user with pagination
// @access  Private
router.get('/savednotes', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const savedNoteIds = user.savedNotes;

    const notes = await Note.find({ _id: { $in: savedNoteIds } })
                            .populate('user', 'name avatar')
                            .sort({ createdAt: -1 })
                            .skip(skip)
                            .limit(limit);

    const totalNotes = savedNoteIds.length;
    const totalPages = Math.ceil(totalNotes / limit);

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


// ==========================================================
// PUBLIC & ADMIN ROUTES (Existing Logic)
// ==========================================================

// @route GET /api/users/top-contributors
// @desc Get top contributors for the homepage (based on note count)
router.get('/top-contributors', async (req, res) => {
    try {
        // NOTE: This logic should be updated to use the cached noteCount field
        // For now, retaining the aggregation for existing compatibility:
        const topContributors = await User.aggregate([
            {
                $lookup: {
                    from: 'notes', 
                    localField: '_id',
                    foreignField: 'user',
                    as: 'notes'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    avatar: 1,
                    noteCount: { $size: '$notes' }
                }
            },
            { $sort: { noteCount: -1 } },
            { $limit: 4 } 
        ]);

        res.json({ users: topContributors });
    } catch (error) {
        console.error('Error fetching top contributors:', error);
        res.status(500).json({ message: 'Failed to fetch top contributors.' });
    }
});

// @route   GET /api/users/me/collections
// @desc    Get all user collections (used for profile/modal)
// @access  Private
router.get('/me/collections', protect, async (req, res) => {
    try {
        // Find all collections belonging to the authenticated user
        const collections = await Collection.find({ user: req.user.id })
            .select('name notes createdAt')
            .lean(); 
        
        // Return collections under a key to mirror standard API responses
        res.json({ collections });
    } catch (error) {
        console.error('Error fetching user collections:', error);
        res.status(500).json({ message: 'Failed to fetch user collections.' });
    }
});

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users (userRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while fetching users.' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    if (req.params.id.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself as an admin.' });
    }

    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user (userRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while deleting user.' });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Change a user's role (toggle between 'user' and 'admin')
// @access  Private/Admin
router.put('/:id/role', protect, admin, async (req, res) => {
  try {
    if (req.params.id.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role via this endpoint.' });
    }

    const user = await User.findById(req.params.id);
    if (user) {
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
