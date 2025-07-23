const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary, storage } = require('../config/cloudinary'); // Import cloudinary for deletion and storage
const Note = require('../models/Note'); // ESSENTIAL: Note model must be imported here
const { protect } = require('../middleware/authMiddleware'); // Assuming 'protect' middleware exists
// No need to import `admin` middleware directly here if you're checking `req.user.isAdmin`
// within the route logic, which is the current approach for note deletion.

const upload = multer({ storage }); // Multer instance for file uploads

router.get('/', async (req, res) => {
  try {
    const limit = 12;
    const page = Number(req.query.page) || 1;
    const { search, title, university, course, subject, year, sort } = req.query;

    // Build conditions array
    const andConditions = [];

    // Valid search (non-empty and not zero string)
    if (search && search.trim() !== '' && search.trim() !== '0') {
      const s = search.trim();
      andConditions.push({
        $or: [
          { title: { $regex: s, $options: 'i' } },
          { university: { $regex: s, $options: 'i' } },
          { course: { $regex: s, $options: 'i' } },
          { subject: { $regex: s, $options: 'i' } },
        ],
      });
    }

    // Individual filters
    if (title && title.trim() !== '' && title.trim() !== '0') {
      andConditions.push({ title: { $regex: title.trim(), $options: 'i' } });
    }
    if (university && university.trim() !== '' && university.trim() !== '0') {
      andConditions.push({ university: { $regex: university.trim(), $options: 'i' } });
    }
    if (course && course.trim() !== '' && course.trim() !== '0') {
      andConditions.push({ course: { $regex: course.trim(), $options: 'i' } });
    }
    if (subject && subject.trim() !== '' && subject.trim() !== '0') {
      andConditions.push({ subject: { $regex: subject.trim(), $options: 'i' } });
    }
    if (year && year.trim() !== '' && year.trim() !== '0') {
      const y = Number(year);
      if (!isNaN(y)) {
        andConditions.push({ year: y });
      }
    }

    // Build query object
    let query = {};
    if (andConditions.length === 1) {
      query = andConditions[0];
    } else if (andConditions.length > 1) {
      query = { $and: andConditions };
    }
    // else query - empty = fetch all

    console.log('MongoDB query:', JSON.stringify(query, null, 2));

    // Sorting logic
    let sortOptions = { uploadDate: -1 };
    if (sort === 'highestRated') sortOptions = { rating: -1 };
    if (sort === 'mostDownloaded') sortOptions = { downloadCount: -1 };

    // Execute query
    const count = await Note.countDocuments(query);
    const notes = await Note.find(query)
      .populate('user', 'name avatar')
      .sort(sortOptions)
      .limit(limit)
      .skip(limit * (page - 1));

    res.json({ notes, page, totalPages: Math.ceil(count / limit) });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Server error occurred while fetching notes.' });
  }
});


// @route   GET /api/notes/mynotes
// @desc    Get notes for the logged-in user
router.get('/mynotes', protect, async (req, res) => {
  try {
    // Ensure req.user.id is correctly populated by your protect middleware
    const notes = await Note.find({ user: req.user.id }).sort({ uploadDate: -1 }); // Find notes by the authenticated user's ID
    res.json(notes);
  } catch (error) {
    console.error('Error fetching my notes (noteRoutes):', error); // Log the detailed error
    res.status(500).json({ message: 'Server Error occurred while fetching your notes.' });
  }
});

// @route   GET /api/notes/:id
// @desc    Get a single note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('user', 'name avatar') // Get the main uploader's info
      .populate({ // Get the info for each user who left a review
        path: 'reviews.user',
        select: 'name avatar'
      });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    console.error('Error fetching single note (noteRoutes):', error); // Log the detailed error
    res.status(500).json({ message: 'Server Error occurred while fetching the note.' });
  }
});

// @route   POST /api/notes/upload
// @desc    Upload a new note
router.post('/upload', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
          return res.status(400).json({
            message: 'No file uploaded or file type not supported. Please ensure it\'s a PDF, DOC, PPT, or common image type.'
          });
        }

        const { title, university, course, subject, year } = req.body;

        // Basic validation for required fields
        if (!title || !university || !course || !subject || !year) {
            // If the file was uploaded, but required text fields are missing, delete the file from Cloudinary
            if (req.file.filename) {
                await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' });
                console.warn(`Deleted orphaned Cloudinary asset: ${req.file.filename} due to missing note details.`);
            }
            return res.status(400).json({ message: 'Please provide all required fields: title, university, course, subject, and year.' });
        }


        const newNote = new Note({
          title,
          university,
          course,
          subject,
          year,
          fileName: req.file.originalname, // Original name of the uploaded file
          filePath: req.file.path, // Cloudinary secure_url for accessing the file
          fileType: req.file.mimetype, // MIME type of the uploaded file
          fileSize: req.file.size,     // Size of the file in bytes
          cloudinaryId: req.file.filename, // Cloudinary public_id, useful for deleting the file later
          user: req.user._id, // User ID from the protect middleware, identifying the uploader
        });

        const savedNote = await newNote.save(); // Save the note details to MongoDB
        res.status(201).json(savedNote); // Respond with the saved note object
      } catch (error) {
        console.error('Note upload failed (noteRoutes):', error); // Log detailed error for server-side debugging
        // If an error occurred after file upload but before saving to DB, try to delete the Cloudinary file
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' });
                console.warn(`Cleaned up Cloudinary asset ${req.file.filename} after failed DB save.`);
            } catch (cleanupError) {
                console.error('Failed to clean up Cloudinary asset after upload error:', cleanupError);
            }
        }
        res.status(500).json({ message: 'Upload failed. Please check the file and form data and try again.' });
      }
});

// @route   POST /api/notes/:id/reviews
// @desc    Create a new review for a note
router.post('/:id/reviews', protect, async (req, res) => {
    const { rating, comment } = req.body;
    try {
        const note = await Note.findById(req.params.id);
        if (note) {
            // Check if the user has already reviewed this note
            const alreadyReviewed = note.reviews.find(r => r.user.toString() === req.user.id.toString());
            if (alreadyReviewed) {
                return res.status(400).json({ message: 'You have already reviewed this note' });
            }

            // Create new review object. Mongoose will automatically add createdAt/updatedAt due to timestamps: true on reviewSchema.
            const review = { user: req.user.id, rating: Number(rating), comment };
            note.reviews.push(review); // Add the new review to the note's reviews array

            // Recalculate rating and numReviews based on all reviews
            note.numReviews = note.reviews.length;
            note.rating = note.reviews.reduce((acc, item) => item.rating + acc, 0) / note.reviews.length;

            await note.save(); // Save the updated note
            res.status(201).json({ message: 'Review added successfully!', review }); // Respond with the new review
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        console.error('Error adding review (noteRoutes):', error); // Log the detailed error
        res.status(500).json({ message: 'Server Error occurred while adding review.' });
    }
});

// @route   PUT /api/notes/:id/download
// @desc    Increment the download count for a note
router.put('/:id/download', async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);
      if (note) {
        // Use $inc for an atomic increment operation, which is safer for counters
        await Note.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });
        res.json({ message: 'Download count updated' });
      } else {
        res.status(404).json({ message: 'Note not found' });
      }
    } catch (error) {
      console.error('Error updating download count (noteRoutes):', error); // Log the detailed error
      res.status(500).json({ message: 'Server Error occurred while updating download count.' });
    }
});

// @route   PUT /api/notes/:id
// @desc    Update a note (only by owner)
router.put('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Check if the logged-in user is the owner of the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this note' });
    }

    // Filter req.body to allow only specific fields for update for security and data integrity
    const { title, university, course, subject, year } = req.body;
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (university !== undefined) updateFields.university = university;
    if (course !== undefined) updateFields.course = course;
    if (subject !== undefined) updateFields.subject = subject;
    if (year !== undefined) updateFields.year = year;

    // Use findByIdAndUpdate to update the document and return the new version
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note (noteRoutes):', error); // Log the detailed error
    res.status(500).json({ message: 'Server Error occurred while updating the note.' });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note (user can delete their own, admin can delete any)
// @access  Private (Owner or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Check ownership or admin role
    if (note.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this note' });
    }

    // Delete Cloudinary asset
    if (note.cloudinaryId) {
      await cloudinary.uploader.destroy(note.cloudinaryId, { resource_type: 'raw' });
      console.log(`Deleted Cloudinary asset: ${note.cloudinaryId}`);
    }

    await note.deleteOne();
    res.json({ message: 'Note removed successfully' });
  } catch (error) {
    console.error('Error deleting note (noteRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while deleting the note.' });
  }
});


module.exports = router;
