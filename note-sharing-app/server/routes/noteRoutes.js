const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage });

// GET route to fetch all notes
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    // If a search term is provided, build the multi-field search query
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { university: { $regex: search, $options: 'i' } },
          { course: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const notes = await Note.find(query).populate('user', 'name').sort({ uploadDate: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- THIS IS THE MISSING ROUTE ---
// @route   GET /api/notes/:id
// @desc    Get a single note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    // This will catch errors like an invalid ID format
    res.status(500).json({ message: 'Server Error' });
  }
});
// --- END OF MISSING ROUTE ---


// POST route to upload notes
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { path: filePath, originalname, mimetype, filename, size } = req.file;
    const { title, university, course, subject, year } = req.body;

    const newNote = new Note({
      title, university, course, subject, year,
      fileName: originalname,
      filePath: filePath,
      fileType: mimetype,
      fileSize: size,
      cloudinaryId: filename,
      user: req.user._id,
    });

    const savedNote = await newNote.save();
    res.status(201).json(savedNote);

  } catch (error) {
    console.error("DATABASE SAVE FAILED:", error);
    res.status(500).json({ message: 'Error saving note to database.', error: error.message });
  }
});

module.exports = router;