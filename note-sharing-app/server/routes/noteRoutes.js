const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary, storage } = require('../config/cloudinary'); // Import cloudinary for deletion
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware'); // Assuming 'protect' middleware exists

const upload = multer({ storage });

// @desc    Get all notes, with search, sort, and pagination
// @route   GET /api/notes
router.get('/', async (req, res) => {
  try {
    const limit = 12; // Number of notes per page
    const page = Number(req.query.page) || 1; // Current page number, default to 1
    const { search, title, university, course, subject, year, sort } = req.query;
    let query = {}; // MongoDB query object

    // Build the query based on search parameters
    if (search) {
      // If a general search term is provided, search across multiple fields
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } }, // Case-insensitive title search
          { university: { $regex: search, $options: 'i' } }, // Case-insensitive university search
          { course: { $regex: search, $options: 'i' } }, // Case-insensitive course search
          { subject: { $regex: search, $options: 'i' } }, // Case-insensitive subject search
        ],
      };
    } else {
      // Otherwise, apply specific filters if provided
      if (title) query.title = { $regex: title, $options: 'i' };
      if (university) query.university = { $regex: university, $options: 'i' };
      if (course) query.course = { $regex: course, $options: 'i' };
      if (subject) query.subject = { $regex: subject, $options: 'i' };
      if (year) query.year = year; // Exact match for year
    }

    let sortOptions = { uploadDate: -1 }; // Default sort by newest upload date
    if (sort === 'highestRated') sortOptions = { rating: -1 }; // Sort by highest rating
    if (sort === 'mostDownloaded') sortOptions = { downloadCount: -1 }; // Sort by most downloaded

    const count = await Note.countDocuments(query); // Total number of documents matching the query
    const notes = await Note.find(query)
      .populate('user', 'name avatar') // Populate user details (name and avatar) of the uploader
      .sort(sortOptions) // Apply sorting options
      .limit(limit) // Limit the number of documents returned
      .skip(limit * (page - 1)); // Skip documents for pagination

    res.json({ notes, page, totalPages: Math.ceil(count / limit) }); // Respond with notes, current page, and total pages

  } catch (err) {
    console.error(err); // Log the detailed error for debugging purposes
    res.status(500).json({ message: 'Server Error occurred while fetching notes.' }); // Generic error message for client
  }
});

// @route   GET /api/notes/mynotes
// @desc    Get notes for the logged-in user
router.get('/mynotes', protect, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ uploadDate: -1 }); // Find notes by the authenticated user's ID
    res.json(notes);
  } catch (error) {
    console.error(error); // Log the detailed error
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
    console.error(error); // Log the detailed error
    res.status(500).json({ message: 'Server Error occurred while fetching the note.' });
  }
});

// @route   POST /api/notes/upload
// @desc    Upload a new note
router.post('/upload', protect, upload.single('file'), async (req, res) => {
    try {
        // Multer's `upload.single('file')` middleware processes the file.
        // If no file is uploaded or if CloudinaryStorage rejects the file (e.g., wrong format), req.file will be undefined.
        if (!req.file) {
          return res.status(400).json({ 
            message: 'No file uploaded or file type not supported. Please ensure it\'s a PDF, DOC, PPT, or common image type.' 
          });
        }

        // Multer populates req.file with Cloudinary details thanks to multer-storage-cloudinary
        const { path: filePath, originalname, mimetype, filename, size } = req.file;
        const { title, university, course, subject, year } = req.body;

        const newNote = new Note({
          title, 
          university, 
          course, 
          subject, 
          year,
          fileName: originalname, // Original name of the uploaded file
          filePath: filePath, // Cloudinary secure_url for accessing the file
          fileType: mimetype, // MIME type of the uploaded file
          fileSize: size,     // Size of the file in bytes
          cloudinaryId: filename, // Cloudinary public_id, useful for deleting the file later
          user: req.user._id, // User ID from the protect middleware, identifying the uploader
        });

        const savedNote = await newNote.save(); // Save the note details to MongoDB
        res.status(201).json(savedNote); // Respond with the saved note object
      } catch (error) {
        console.error('Upload failed:', error); // Log detailed error for server-side debugging
        // Provide a more user-friendly error message, avoiding revealing internal server details
        res.status(500).json({ message: 'Upload failed. Please check the file and try again.' });
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
            res.status(201).json({ message: 'Review added successfully!' });
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        console.error(error); // Log the detailed error
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
      console.error(error); // Log the detailed error
      res.status(500).json({ message: 'Server Error occurred while updating download count.' });
    }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
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
    console.error(error); // Log the detailed error
    res.status(500).json({ message: 'Server Error occurred while updating the note.' });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    // Check if the logged-in user is the owner of the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this note' });
    }

    // Delete the file from Cloudinary first, using the stored cloudinaryId
    if (note.cloudinaryId) {
      // Ensure the resource_type matches what was used during upload ('raw' for documents)
      await cloudinary.uploader.destroy(note.cloudinaryId, { resource_type: 'raw' });
      console.log(`Deleted Cloudinary asset: ${note.cloudinaryId}`); // Confirm deletion in logs
    }

    await note.deleteOne(); // Delete the note document from MongoDB
    res.json({ message: 'Note removed successfully' });
  } catch (error) {
    console.error(error); // Log the detailed error
    res.status(500).json({ message: 'Server Error occurred while deleting the note.' });
  }
});

module.exports = router;
