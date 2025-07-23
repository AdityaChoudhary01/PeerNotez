const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const upload = multer({ storage });

// @route   GET /api/notes
// @desc    Get all notes, with search, sort, and pagination
router.get('/', async (req, res) => {
  try {
    const limit = 12;
    const page = Number(req.query.page) || 1;
    const { search, title, university, course, subject, year, sort } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { university: { $regex: search, $options: 'i' } },
          { course: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
        ],
      };
    } else {
      if (title) query.title = { $regex: title, $options: 'i' };
      if (university) query.university = { $regex: university, $options: 'i' };
      if (course) query.course = { $regex: course, $options: 'i' };
      if (subject) query.subject = { $regex: subject, $options: 'i' };
      if (year) query.year = year;
    }

    let sortOptions = { uploadDate: -1 };
    if (sort === 'highestRated') sortOptions = { rating: -1 };
    if (sort === 'mostDownloaded') sortOptions = { downloadCount: -1 };

    const count = await Note.countDocuments(query);
    const notes = await Note.find(query)
      .populate('user', 'name avatar')
      .sort(sortOptions)
      .limit(limit)
      .skip(limit * (page - 1));

    res.json({ notes, page, totalPages: Math.ceil(count / limit) });

  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/notes/mynotes
// @desc    Get notes for the logged-in user
router.get('/mynotes', protect, async (req, res) => {
    // ... (This route is correct)
});

// @route   GET /api/notes/:id
// @desc    Get a single note by ID
router.get('/:id', async (req, res) => {
    // ... (This route is correct)
});

// @route   POST /api/notes/upload
// @desc    Upload a new note
router.post('/upload', protect, upload.single('file'), async (req, res) => {
    // ... (This route is correct)
});

// @route   POST /api/notes/:id/reviews
// @desc    Create a new review for a note
router.post('/:id/reviews', protect, async (req, res) => {
    // ... (This route is correct)
});

// @route   PUT /api/notes/:id/download
// @desc    Increment download count
router.put('/:id/download', async (req, res) => {
    // ... (This route is correct)
});

// @route   PUT /api/notes/:id
// @desc    Update a note
router.put('/:id', protect, async (req, res) => {
    // ... (This route is correct)
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    if (note.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await note.deleteOne();
    res.json({ message: 'Note removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
