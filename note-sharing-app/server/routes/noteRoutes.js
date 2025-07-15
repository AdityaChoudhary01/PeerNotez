const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage });

// GET route to fetch all notes or search
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
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
    }
    const notes = await Note.find(query).populate('user', 'name avatar').sort({ uploadDate: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET route for a single note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('user', 'name avatar');
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
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
    // ... (logic remains the same)
});

// PUT route to update a note
router.put('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE route to remove a note
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    await note.deleteOne();
    res.json({ message: 'Note removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
