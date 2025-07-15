const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage });

// GET route to fetch all notes or search
router.get('/mynotes', protect, async (req, res) => {
  // Add a specific check to ensure the user object exists
  if (!req.user || !req.user.id) {
    console.error('CRITICAL ERROR: User object not found on request in /mynotes.');
    return res.status(500).json({ 
      message: 'Authentication error: User could not be identified on the server.' 
    });
  }

  try {
    const notes = await Note.find({ user: req.user.id }).sort({ uploadDate: -1 });
    res.json(notes);
  } catch (error) {
    console.error('DATABASE ERROR in /mynotes route:', error);
    res.status(500).json({
      message: 'A database error occurred while fetching notes.',
      error: error.message,
    });
  }
});

// GET route for a single note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('user', 'name');
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Note ID' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});


// GET notes for the logged-in user
router.get('/mynotes', protect, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ uploadDate: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

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
