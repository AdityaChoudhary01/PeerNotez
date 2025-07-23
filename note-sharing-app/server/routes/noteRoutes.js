const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage });

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
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ uploadDate: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/notes/:id
// @desc    Get a single note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('user', 'name avatar') // Gets the main uploader's info
      .populate({ // Gets the info for each user who left a review
        path: 'reviews.user',
        select: 'name avatar'
      });
      
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/notes/upload
// @desc    Upload a new note
router.post('/upload', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded.' });
        }
        const { path: filePath, originalname, mimetype, filename, size } = req.file;
        const { title, university, course, subject, year } = req.body;
        const newNote = new Note({
          title, university, course, subject, year,
          fileName: originalname, filePath: filePath, fileType: mimetype, fileSize: size,
          cloudinaryId: filename, user: req.user._id,
        });
        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
      } catch (error) {
        res.status(500).json({ message: 'Error saving note to database.', error: error.message });
      }
});

// @route   POST /api/notes/:id/reviews
// @desc    Create a new review for a note
router.post('/:id/reviews', protect, async (req, res) => {
    const { rating, comment } = req.body;
    try {
        const note = await Note.findById(req.params.id);
        if (note) {
            const alreadyReviewed = note.reviews.find(r => r.user.toString() === req.user.id.toString());
            if (alreadyReviewed) {
                return res.status(400).json({ message: 'You have already reviewed this note' });
            }
            const review = { user: req.user.id, rating: Number(rating), comment, createdAt: new Date() };
            note.reviews.push(review);
            note.numReviews = note.reviews.length;
            note.rating = note.reviews.reduce((acc, item) => item.rating + acc, 0) / note.reviews.length;
            await note.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/notes/:id/download
// @desc    Increment the download count for a note
router.put('/:id/download', async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);
      if (note) {
        note.downloadCount = (note.downloadCount || 0) + 1;
        await note.save();
        res.json({ message: 'Download count updated' });
      } else {
        res.status(404).json({ message: 'Note not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
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

// @route   DELETE /api/notes/:id
// @desc    Delete a note
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    await note.deleteOne();
    res.json({ message: 'Note removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
